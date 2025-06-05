import InputComponentState from './InputComponentState'
import {ChoiceType, DateType, NumberType, RecordType, TextType, TrueFalseType} from '../types'
import {equals, mergeDeepRight} from 'ramda'
import {ErrorResult} from '../../shared/DataStore'
import BaseType from '../types/BaseType'
import {PropVal} from '../runtimeFunctions'
import {TextInputState} from './TextInput'
import {NumberInputState} from './NumberInput'
import DecimalType from '../types/DecimalType'
import BigNumber from 'bignumber.js'
import {SelectInputState} from './SelectInput'
import {TrueFalseInputState} from './TrueFalseInput'
import {DateInputState} from './DateInput'
import {StoredState} from '../AppStateStore'
import {StateMap} from './ComponentState'

type SubmitActionFn = (form: BaseFormState, data: any) => any | Promise<any>

const formState = <T extends any>(type: BaseType<T, any>, value: PropVal<T>): StoredState => {
    if (type instanceof TextType) {
        return new TextInputState({dataType: type, value: value as PropVal<string>})
    }
    if (type instanceof NumberType) {
        return new NumberInputState({dataType: type, value: value as PropVal<number>})
    }
    if (type instanceof DecimalType) {
        return new NumberInputState({dataType: type, value: value as PropVal<BigNumber>})
    }
    if (type instanceof ChoiceType) {
        return new SelectInputState({dataType: type, value: value as PropVal<string>})
    }
    if (type instanceof TrueFalseType) {
        return new TrueFalseInputState({dataType: type, value: value as PropVal<boolean>})
    }
    if (type instanceof DateType) {
        return new DateInputState({dataType: type, value: value as PropVal<Date>})
    }
    if (type instanceof RecordType) {
        return new DataTypeFormState({dataType: type, value: value as PropVal<object>})
    }
    // if (type instanceof ListType) {
    //     return new ListElementState({})
    // }

    return {} as StoredState
}

export default abstract class BaseFormState extends InputComponentState<object, RecordType, {submitAction?: SubmitActionFn}> {
    defaultValue = {}

    protected abstract readonly ownFieldNames: string[]

    protected get submitAction() { return this.props.submitAction }

    protected setupChildStates() {
        const dataTypeFields = this.dataType?.fields ?? []
        const dataTypeChildStates = Object.fromEntries( dataTypeFields.map( type => {
            const {codeName} = type
            const childState = this.getOrCreateChildState(codeName, formState(type, this.originalValue?.[codeName as keyof object]))
            return [codeName, childState]
        })) as StateMap

        const ownChildStates = this.createChildStates()
        this.state.childStates = {...dataTypeChildStates, ...ownChildStates}
    }

    get dataValue() {
        return this.valueFromChildren()
    }

    get originalValue() {
        return super.originalValue ?? {}
    }

    get fieldNames() {
        const dataTypeFields = this.props.dataType?.fields?.map(f => f.codeName ) ?? []
        return [...dataTypeFields, ...(this.ownFieldNames ?? [])]
    }

    get updates() {
        const modifiedFields = this.fieldNames.filter(name => this.getChildState(name)?.modified)
        return this.valueFromChildren(modifiedFields)
    }

    get modified() {
        return this.fieldNames.some(name => this.getChildState(name)?.modified)
    }

    get errors(): { [p: string]: string[] } | null {
        const componentErrorEntries = this.fieldNames.map(name => [name, this.getChildState(name)?.errors]).filter( ([_name, entries]) => entries)
        const validationResult = this.dataType?.validate(this.dataValue)
        const ownErrorResult = (validationResult && (validationResult as any)._self) as string[]
        const ownErrors = ownErrorResult ? {_self: ownErrorResult} : {}
        const componentErrors =  componentErrorEntries.length ? Object.fromEntries(componentErrorEntries) : {}
        // @ts-ignore there is probably some adjustment to the type parameters of InputComponentState that would allow this....
        const submitErrors = this.state.submitErrors
        const selfErrors = mergeDeepRight(ownErrors, submitErrors ?? {})
        const allErrors = {...selfErrors, ...componentErrors, }
        return Object.keys(allErrors).length ? allErrors : null
    }

    protected isEqualTo(newObj: this): boolean {
        return equals(this.props.value, newObj.props.value)
            && equals(this.props.dataType, newObj.props.dataType)
    }

    private valueFromChildren(names: string[] = this.fieldNames) {
        return Object.fromEntries(names.map(name => [name, this.getChildValue(name)]))
    }

    private getChildValue(name: string) {
        const childStateValue = this.getChildState(name)?.dataValue
        if (childStateValue !== undefined) return childStateValue

        return this.props.value?.[name as keyof object]
    }

    protected getChildState(name: string) {
        return super.getChildState(name) as InputComponentState<any, any>
    }

    Reset() {
        super.Reset()
        this.fieldNames.forEach(name => this.getChildState(name)?.Reset())
    }

    ShowErrors(errorsShown: boolean) {
        super.ShowErrors(errorsShown)
        this.fieldNames.forEach(name => this.getChildState(name)?.ShowErrors(errorsShown))
    }

    async Submit(data: any) {
        const submitResult = await this.submitAction?.(this, data)
        if (submitResult instanceof ErrorResult) {
            // @ts-ignore
            this.latest().updateState({submitErrors: {_self: [submitResult.errorMessage]}})
        } else {
            this.Reset()
        }
    }
}

export class DataTypeFormState extends BaseFormState {
    protected readonly ownFieldNames: string[] = []
}
