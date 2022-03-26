import React from 'react'
import {valueLiteral} from '../runtimeFunctions'

type Properties = {state: any, display?: boolean}

export default function Data({state, display = false}: Properties) {
    const {_path: path, value} = state
    return display ? <div id={path}>
        <div>{path}</div>
        <code>{valueLiteral(value)}</code>
        </div>
         : null
}
