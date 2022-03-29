import {createElement} from 'react'
import {valueLiteral} from '../runtimeFunctions'

type Properties = {state: any, display?: boolean}

export default function Data({state, display = false}: Properties) {
    const {_path: path, value} = state
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null, valueLiteral(value))) : null
}
