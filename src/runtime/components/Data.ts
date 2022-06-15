import {createElement} from 'react'
import {valueLiteral} from '../runtimeFunctions'
import {equals, mergeRight} from 'ramda'

type Properties = {state: any, display?: boolean}

export default function Data({state, display = false}: Properties) {
    const {_path: path, value} = state
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null, valueLiteral(value))) : null
}

Data.State = class State {
    private state: { value?: any | null, updateFn: (changes: object, replace?: boolean)=> void }

    constructor(private props: { value: any | null | undefined }) {
        this.state = {updateFn: () => {throw new Error('updateFn called before injected')}}
    }

    init(updateFn: (changes: object, replace?: boolean)=> void) {
        this.state.updateFn = updateFn  // no effect on external view so no need to update
    }

    setState(changes: {value?: any | null}) {
        const result = new Data.State(this.props)
        result.state = mergeRight(this.state, changes)
        return result
    }

    private updateState(changes: { value?: object, queries?: object }) {
        this.state.updateFn(this.setState(changes), true)
    }

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

