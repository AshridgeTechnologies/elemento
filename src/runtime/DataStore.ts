import {isObject, isPlainObject} from 'lodash'
import {equals, lensPath, mergeDeepRight, set, view} from 'ramda'
import {valueLiteral} from './runtimeFunctions'

const isIntegerString = (s: string) => s.match(/^\d+$/)
const lensFor = (path: string) => {
    const props = path.split(/\.|\[|]\.?/).filter(s => s !== '').map(prop => isIntegerString(prop) ? Number(prop) : prop)
    return lensPath(props)
}

export type Changes = object | string | number | boolean
export default class DataStore {
    constructor(initialData: object) {
        this.state = initialData
    }

    state: object

    select(path: string) {
        return view(lensFor(path), this.state)
    }

    update(path: string, changes: Changes, replace: boolean = false): DataStore {
        const lens = lensFor(path)
        const existingState = this.state
        const existingStateAtPath = view(lens, existingState)
        if (!replace && existingStateAtPath !== undefined && !isObject(existingStateAtPath)) {
            throw new Error(`${path}: cannot update existing value ${valueLiteral(existingStateAtPath)} with ${valueLiteral(changes)}`)
        }

        const newStateAtPath = replace ? changes : mergeDeepRight(existingStateAtPath, changes as object)
        if (!replace && !isPlainObject(changes)) {
            throw new Error(`${path}: cannot update existing value ${valueLiteral(existingStateAtPath)} with ${valueLiteral(changes)}`)
        }
        if (!equals(newStateAtPath, existingStateAtPath)) {
            const newState = set(lens, newStateAtPath, existingState)
            return new DataStore(newState)
        }

        return this
    }
}