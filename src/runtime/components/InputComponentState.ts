import {BaseComponentState, ComponentState} from './ComponentState'
import {PropVal, valueOf} from '../runtimeFunctions'
import BaseType from '../types/BaseType'

export type InputComponentExternalProps<T, DT extends BaseType<T, any>, Props> = {value?: PropVal<T | null> | null, dataType?: DT} & Props
type InputComponentStateProps<T> = {value?: T | null, errorsShown?: boolean, editedValue?: string}
export default abstract class InputComponentState<T, DT extends BaseType<T, any>, Props = {}>
    extends BaseComponentState<InputComponentExternalProps<T, DT, Props>, InputComponentStateProps<T>>
    implements ComponentState<InputComponentState<T, DT, Props>> {

    abstract defaultValue: T | null

    get value() {
        return this.propsOrStateValue ?? this.defaultValue
    }

    get originalValue() {
        return valueOf(this.props.value)
    }

    get valid() {
        return this.errors === null
    }

    get errors() {
        return this.dataType?.validate(this.propsOrStateValue ?? null) ?? null
    }

    get modified() {
        const stateValue = this.state.value
        return stateValue !== undefined
            && (stateValue ?? null) !== (this.originalValue ?? null)
    }

    get errorsShown() {
        return this.state.errorsShown ?? false
    }

    get dataValue() {
        return this.propsOrStateValue ?? null
    }

    get controlValue() {
        return this.state.editedValue
    }

    get dataType() { return this.props.dataType }

    protected get propsOrStateValue() {
        return this.state.value !== undefined ? this.state.value : this.originalValue
    }

    _setValue(value: T | null) {
        this.updateState({value})
    }

    _setBlurred() {
        this.updateState({errorsShown: true, editedValue: undefined})
    }

    valueOf() {
        return this.value
    }

    Reset() {
        this.updateState({value: undefined, errorsShown: false})
    }

    ShowErrors(errorsShown: boolean) {
        this.updateState({errorsShown})
    }
}
