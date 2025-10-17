import InputComponentState from './InputComponentState'
import {RecordType} from '../types'
import {mergeDeepRight} from 'ramda'
import {ErrorResult} from '../../shared/DataStore'
import {AppStateForObject} from '../state/AppStateStore'
import {unique} from '../../util/helpers'
import {createProxy} from '../state/BaseComponentState'

type SubmitActionFn = (form: BaseFormState, data: any) => any | Promise<any>

// const formState = <T extends any>(type: BaseType<T, any>, value: PropVal<T>): StoredStateWithProps<any> => {
//     if (type instanceof TextType) {
//         return new TextInputState({dataType: type, initialValue: value as PropVal<string>})
//     }
//     if (type instanceof NumberType) {
//         return new NumberInputState({dataType: type, initialValue: value as PropVal<number>})
//     }
//     if (type instanceof DecimalType) {
//         return new NumberInputState({dataType: type, initialValue: value as PropVal<BigNumber>})
//     }
//     if (type instanceof ChoiceType) {
//         return new SelectInputState({dataType: type, initialValue: value as PropVal<string>})
//     }
//     if (type instanceof TrueFalseType) {
//         return new TrueFalseInputState({dataType: type, initialValue: value as PropVal<boolean>})
//     }
//     if (type instanceof DateType) {
//         return new DateInputState({dataType: type, initialValue: value as PropVal<Date>})
//     }
//     if (type instanceof RecordType) {
//         return new DataTypeFormState({dataType: type, initialValue: value as PropVal<object>})
//     }
//     // if (type instanceof ListType) {
//     //     return new ListElementState({})
//     // }
//
//     return {} as StoredState
// }

export default abstract class BaseFormState<T extends object = object> extends InputComponentState<T, RecordType<T>, {submitAction?: SubmitActionFn}> {
    defaultValue = {} as T

    protected abstract readonly ownFieldNames: string[]

    init(asi: AppStateForObject<any>, previousVersion?: this): this {
        return createProxy(asi, super.init(asi, previousVersion))
    }

    protected get submitAction() { return this.props.submitAction }

    get dataValue(): T {
        return this.valueFromChildren() as T
    }

    get originalValue() {
        return super.originalValue ?? {}
    }

    get fieldNames() {
        const dataTypeFields = this.props.dataType?.fields?.map(f => f.codeName ) ?? []
        return unique([...dataTypeFields, ...(this.ownFieldNames ?? [])])
    }

    get updates() {
        const modifiedFields = this.fieldNames.filter(name => this.getInputChildState(name)?.modified)
        return this.valueFromChildren(modifiedFields)
    }

    get modified() {
        return this.fieldNames.some(name => this.getInputChildState(name)?.modified)
    }

    get errors(): { [p: string]: string[] } | null {
        const componentErrorEntries = this.fieldNames.map(name => [name, this.getInputChildState(name)?.errors]).filter( ([_name, entries]) => entries)
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

    private valueFromChildren(names: string[] = this.fieldNames) {
        return Object.fromEntries(names.map(name => [name, this.getChildValue(name) ?? null]))
    }

    private getChildValue(name: string) {
        const childStateValue = this.getInputChildState(name)?.dataValue
        if (childStateValue !== undefined && !childStateValue?._isPlaceholder) return childStateValue

        return this.props.initialValue?.[name as keyof object]
    }

    protected getInputChildState<T extends InputComponentState<any, any>>(name: string): T {
        return super.getChildState(name) as T
    }

    Reset() {
        super.Reset()
        this.fieldNames.forEach(name => this.getInputChildState(name)?.Reset?.())
    }

    ShowErrors(errorsShown: boolean) {
        super.ShowErrors(errorsShown)
        this.fieldNames.forEach(name => this.getInputChildState(name)?.ShowErrors?.(errorsShown))
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
