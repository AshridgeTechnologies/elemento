import {createElement} from 'react'
import {valueLiteral} from '../runtimeFunctions'
import {update} from '../stateProxy'

type Properties = {state: any, display?: boolean}

export default function Data({state, display = false}: Properties) {
    const {_path: path, value} = state
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null, valueLiteral(value))) : null
}

Data.State = class State {
    constructor(private props: { value: any | null | undefined }) {
    }

    get value() {
        return this.props.value
    }

    Set(value: any) {
        return update({value}, true)
    }

    Update(changes: object) {
        return update({value: changes})
    }
}

