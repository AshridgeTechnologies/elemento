import {createElement} from 'react'
import {valueLiteral} from '../runtimeFunctions'
import {clone, isArray, isNumber, isObject, isString} from 'lodash'

type Properties = {state: any, display?: boolean}

let nextId = 1

const Collection = function Collection({state, display = false}: Properties) {
    const {_path: path, value} = state
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null, valueLiteral(value))) : null
}


export const toEntry = (value: any): [PropertyKey, any] => {
    if (isString(value) || isNumber(value)) {
        return [value, value]
    }
    const id = value.id ?? value.Id ?? nextId++
    return [id, value]
}

Collection.initialValue = (value?: any) => {
    if (value === undefined) {
        return {}
    }

    if (isArray(value)) {
        return Object.fromEntries( value.map(toEntry))
    }

    if (isObject(value)) {
        return clone(value)
    }
}

export default Collection
