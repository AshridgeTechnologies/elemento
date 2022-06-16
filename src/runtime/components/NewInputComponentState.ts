import {equals, mergeRight} from 'ramda'
import {AppStateForObject} from '../stateProxy'

export default abstract class InputComponentState<T>  {
    private state: { value?: T | null, appStateInterface: AppStateForObject }

    constructor(private props: { value: T | null | undefined }) {
        this.state = {appStateInterface: {
                latest() {
                    throw new Error('latest called before injected')
                },
                update() {
                    throw new Error('update called before injected')
                },
            }}
    }

    init(appStateInterface: AppStateForObject) {
        this.state.appStateInterface = appStateInterface  // no effect on external view so no need to update
    }

    private get thisConstructor(): any { return this.constructor as any }

    setState(changes: {value?: string | null}) {
        const result = new this.thisConstructor(this.props)
        result.state = mergeRight(this.state, changes)
        return result
    }

    private updateState(changes: { value?: string | null }) {
        const newVersion = this.state.appStateInterface.latest().setState(changes)
        this.state.appStateInterface.update(newVersion)
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
