import {isObject, isPlainObject} from 'lodash'
import {equals, lensPath, mergeDeepRight} from 'ramda'
import {_DELETE, valueLiteral} from './runtimeFunctions'

const isIntegerString = (s: string) => s.match(/^\d+$/)
const lensFor = (path: string) => {
    const props = path.split(/\.|\[|]\.?/).filter(s => s !== '').map(prop => isIntegerString(prop) ? Number(prop) : prop)
    return lensPath(props)
}

export type Changes = object | string | number | boolean

// based on https://thewebdev.info/2022/01/19/how-to-recursively-remove-null-values-from-javascript-object/
const removeDeleted = (obj: object) => {
    for (const key of Object.keys(obj)) {
        const k = key as keyof object
        if (obj[k] === _DELETE) {
            delete obj[k]
        } else if (isPlainObject(obj[k])) {
            removeDeleted(obj[k])
        }
    }
    return obj
}

export default class AppState {
    constructor(initialData: object | Map<string, any>) {
        const initialEntries = initialData instanceof Map ? initialData.entries() : Object.entries(initialData)
        this.state = new Map(initialEntries)
    }

    private state: Map<string, any>

    select(path: string) {
        return this.state.get(path)
    }

    update(path: string, changes: Changes, replace = false): AppState {
        const existingStateAtPath = this.select(path)
        if (!replace && existingStateAtPath !== undefined && !isObject(existingStateAtPath)) {
            throw new Error(`${path}: cannot update existing value ${valueLiteral(existingStateAtPath)} with ${valueLiteral(changes)}`)
        }

        const newStateAtPath = replace ? changes : removeDeleted(mergeDeepRight(existingStateAtPath, changes as object))
        if (!replace && !isPlainObject(changes)) {
            throw new Error(`${path}: cannot update existing value ${valueLiteral(existingStateAtPath)} with ${valueLiteral(changes)}`)
        }
        if (!equals(newStateAtPath, existingStateAtPath)) {
            const newState = new Map(this.state.entries())
            newState.set(path, newStateAtPath)
            return new AppState(newState)
        }

        return this
    }
}