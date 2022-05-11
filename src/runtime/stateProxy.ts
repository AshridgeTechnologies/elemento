import {mergeDeepWith} from 'ramda'
import {isFunction, isPlainObject} from 'lodash'

export type updateFnType = (path: string, changes: object, replace?: boolean) => void
export type proxyUpdateFnType = (changes: object) => void

class Update {
    constructor(public changes: object, public replace: boolean) {}
}

export function update(changes: object, replace = false) {
    return new Update(changes, replace)
}


const stateProxyHandler = (path: string, updateFn: updateFnType) => ({

    get: function (obj: any, prop: string): any {
        if (prop === '_path') {
            return path
        }

        if (prop === '_update') {
            return (changes: object, replace = false) => updateFn(path, changes, replace)
        }

        if (prop === '_updateApp') {
            return (changes: object) => updateFn('app', changes, false)
        }

        if (prop === '_controlValue') {
            return obj.value
        }

        if (prop === 'value') {
            return obj.value ?? obj.defaultValue
        }

        if (prop === 'valueOf') {
            if ('value' in obj || 'defaultValue' in obj) {
                return function () {
                    return obj.value ?? obj.defaultValue
                }
            }
            return obj.valueOf
        }

        if (prop === 'constructor') {
            return obj.constructor
        }

        const result = obj[prop] ?? obj.value?.[prop]
        if (isFunction(result)) {
            return function(...args: any[]) {
                const returnVal = result.call(obj, ...args)
                if (returnVal instanceof Update) {
                    updateFn(path, returnVal.changes, returnVal.replace)
                } else {
                    return returnVal
                }
            }
        }
        return isPlainObject(result) ? stateProxy(`${path}.${prop}`, result, {}, updateFn) : result
    }

})

const useRightIfDefined = (left: any, right: any) => right !== undefined ? right : left

export function stateProxy(path: string, storedState: object | undefined, initialValues: object, updateFn: updateFnType) {
    const existingStateAtPath = storedState || {}
    const mergedState = mergeDeepWith(useRightIfDefined, initialValues, existingStateAtPath)
    const {_type, ...proxyState} = mergedState
    const proxyTarget = _type ? new _type(proxyState) : proxyState
    return new Proxy(proxyTarget, stateProxyHandler(path, updateFn))
}