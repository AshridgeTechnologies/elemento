import {mergeDeepWith} from 'ramda'
import {isPlainObject} from 'lodash'

export type updateFnType = (path: string, changes: object, replace?: boolean) => void
export type proxyUpdateFnType = (changes: object) => void


const stateProxyHandler = (path: string, updateFn: updateFnType) => ({

    get: function (obj: any, prop: string): any {
        if (prop === '_path') {
            return path
        }

        if (prop === '_update') {
            return (changes: object, replace: boolean = false) => updateFn(path, changes, replace)
        }

        if (prop === '_updateApp') {
            return (changes: object) => updateFn('app', changes, false)
        }

        if (prop === '_controlValue') {
            return obj.value ?? null
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

        const result = obj[prop] ?? obj.value?.[prop] ?? obj.defaultValue?.[prop]
        return isPlainObject(result) ? stateProxy(`${path}.${prop}`, result, {}, updateFn) : result
    }

})

const useRightIfDefined = (left: any, right: any) => right !== undefined ? right : left

export function stateProxy(path: string, storedState: object | undefined, initialValuesAndDefaults: object,
                           updateFn: updateFnType) {
    const existingStateAtPath = storedState || {}
    const mergedState = mergeDeepWith(useRightIfDefined, initialValuesAndDefaults, existingStateAtPath)
    return new Proxy(mergedState, stateProxyHandler(path, updateFn))
}