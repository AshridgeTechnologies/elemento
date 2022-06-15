import {equals, mergeRight} from 'ramda'

export default abstract class InputComponentState<T>  {
    private state: { value?: T | null, updateFn: (changes: object, replace?: boolean)=> void }

    constructor(private props: { value: T | null | undefined }) {
        this.state = {updateFn: () => {throw new Error('updateFn called before injected')}}
    }

    init(updateFn: (changes: object, replace?: boolean)=> void) {
        this.state.updateFn = updateFn  // no effect on external view so no need to update
    }

    private get thisConstructor(): any { return this.constructor as any }

    setState(changes: {value?: string | null}) {
        const result = new this.thisConstructor(this.props)
        result.state = mergeRight(this.state, changes)
        return result
    }

    private updateState(changes: { value?: string | null }) {
        this.state.updateFn(this.setState(changes), true)
    }

    mergeProps(newState: typeof this) {
        return equals(this.props, newState.props) ? this : new this.thisConstructor(newState.props).setState(this.state)
    }

    abstract defaultValue: T

    get value() {
        return this.state.value !== undefined ? this.state.value : this.props.value
    }

    _setValue(value: string) {
        this.updateState({value})
    }

    Reset() {
        this.updateState({value: undefined})
    }
}
