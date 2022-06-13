import {BaseComponentState, ComponentState} from './ComponentState'

type InputProps<T> = {value?: T | null}

export default abstract class InputComponentState<T>
    extends BaseComponentState<InputProps<T>>
    implements ComponentState<InputComponentState<T>> {

    abstract defaultValue: T

    get value() {
        return this.propsOrStateValue ?? this.defaultValue
    }

    get _controlValue() {
        return this.propsOrStateValue
    }

    private get propsOrStateValue() {
        return this.state.value !== undefined ? this.state.value : this.props.value
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
