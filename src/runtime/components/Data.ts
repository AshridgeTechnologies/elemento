import {createElement} from 'react'
import {valueLiteral} from '../runtimeFunctions'
import {equals, mergeRight} from 'ramda'
import {AppStateForObject} from '../stateProxy'

type Properties = {state: any, display?: boolean}

export default function Data({state, display = false}: Properties) {
    const {_path: path, value} = state
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null, valueLiteral(value))) : null
}

Data.State = class State {
    private state: { value?: any | null, appStateInterface: AppStateForObject }

    constructor(private props: { value: any | null | undefined }) {
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

    setState(changes: {value?: any | null}) {
        const result = new Data.State(this.props)
        result.state = mergeRight(this.state, changes)
        return result
    }

    private updateState(changes: { value?: object, queries?: object }) {
        const newVersion = this.state.appStateInterface.latest().setState(changes)
        this.state.appStateInterface.update(newVersion)    }

    mergeProps(newState: typeof this) {
        return equals(this.props, newState.props) ? this : new Data.State(newState.props).setState(this.state)
    }

    get value() {
        return this.state.value !== undefined ? this.state.value : this.props.value
    }

    Set(value: any) {
        this.updateState({value})
    }

    Update(changes: object) {
        const newValue = mergeRight(this.value, changes )
        this.updateState({value: newValue})
    }
}

