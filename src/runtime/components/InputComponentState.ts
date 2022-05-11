import {update} from '../stateProxy'

export abstract class InputComponentState<T> {
    constructor(private props: { value: T | null | undefined }) {
    }

    abstract defaultValue: T

    get value() {
        return this.props.value
    }

    Reset() {
        return update({value: undefined})
    }
}