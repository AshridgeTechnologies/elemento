import {BaseComponentState, ComponentState} from './ComponentState'
import {PropVal, valueOf} from '../runtimeFunctions'

type InputProps<T> = {value?: PropVal<T> | null}
type StateProps<T> = {value?: T | null}

export default abstract class InputComponentState<T>
    extends BaseComponentState<InputProps<T>, StateProps<T>>
    implements ComponentState<InputComponentState<T>> {

    abstract defaultValue: T

    get value() {
        return this.propsOrStateValue ?? this.defaultValue
    }

    get _controlValue() {
        return this.propsOrStateValue
    }

    private get propsOrStateValue() {
        return this.state.value !== undefined ? this.state.value : valueOf(this.props.value)
    }

    _setValue(value: T | null) {
        this.updateState({value})
    }

    valueOf() {
        return this.value
    }

    Reset() {
        this.updateState({value: undefined})
    }
}
