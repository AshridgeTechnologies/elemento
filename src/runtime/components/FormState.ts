import InputComponentState from './InputComponentState'
import {RecordType} from '../types'
import {equals, mergeDeepRight} from 'ramda'
import {ErrorResult} from '../DataStore'

type SubmitActionFn = (form: BaseFormState, data: any) => any | Promise<any>

export default abstract class BaseFormState extends InputComponentState<object, RecordType, {submitAction?: SubmitActionFn}> {
    defaultValue = {}

    protected abstract readonly ownFieldNames: string[]

    protected get submitAction() { return this.props.submitAction }

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

    protected getChildValue(name: string) {
        const childStateValue = this.getChildState(name)?.dataValue
        if (childStateValue !== undefined) return childStateValue

        return this.props.value?.[name as keyof object]
    }

    private getChildState(name: string) {
        return (this._appStateInterface?.getChildState(name) as InputComponentState<any, any>)
    }

    get originalValue() {
        return super.originalValue ?? {}
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

    _updateValue() {
        const currentValue = this.valueFromChildren()
        if (!equals(this.propsOrStateValue, currentValue)) {
            this._setValue(currentValue)
        }
    }
}

export class DataTypeFormState extends BaseFormState {
    protected readonly ownFieldNames: string[] = []
}
