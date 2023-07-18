import {BaseComponentState, ComponentState} from './ComponentState'
import {PropVal, valueOf} from '../runtimeFunctions'
import BaseType from '../../shared/types/BaseType'

type InputProps<T, DT extends BaseType<T, any>> = {value?: PropVal<T> | null, dataType?: DT}
type StateProps<T> = {value?: T | null, errorsShown?: boolean}

export default abstract class InputComponentState<T, DT extends BaseType<T, any>>
    extends BaseComponentState<InputProps<T, DT>, StateProps<T>>
    implements ComponentState<InputComponentState<T, DT>> {

    abstract defaultValue: T | null

    get value() {
        return this.propsOrStateValue ?? this.defaultValue
    }

    get valid() {
        return this.errors === null
    }

    get errors() {
        return this.dataType?.validate(this.value) ?? null
    }

    get modified() {
        return this.state.value !== undefined && this.state.value !== this.props.value
    }

    get errorsShown() {
        return this.state.errorsShown ?? false
    }

    get _controlValue() {
        return this.propsOrStateValue
    }

    get dataType() { return this.props.dataType }

    private get propsOrStateValue() {
        return this.state.value !== undefined ? this.state.value : valueOf(this.props.value)
    }

    _setValue(value: T | null) {
        this.updateState({value})
    }

    _setBlurred() {
        this.updateState({errorsShown: true})
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
