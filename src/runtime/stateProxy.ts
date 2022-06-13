import {mergeDeepWith} from 'ramda'
import {isFunction, isPlainObject} from 'lodash'
import {isClassObject} from './runtimeFunctions'

export type updateFnType = (path: string, changes: object, replace?: boolean) => void
export type proxyUpdateFnType = (changes: object) => void

export class Update {
    constructor(public changes: object, public replace: boolean) {}
}

export class ResultWithUpdates {
    constructor(public result: any, public syncUpdate?: Update, public asyncUpdate?: Promise<Update>) {}
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
                if (returnVal instanceof ResultWithUpdates) {
                    if (returnVal.syncUpdate) {
                        updateFn(path, returnVal.syncUpdate.changes, returnVal.syncUpdate.replace)
                    }
                    if (returnVal.asyncUpdate) {
                        returnVal.asyncUpdate.then( (result: Update) => updateFn(path, result.changes, result.replace) )
                    }
                    return returnVal.result
                } else if (returnVal instanceof Update) {
                    updateFn(path, returnVal.changes, returnVal.replace)
                } else if (isClassObject(returnVal)) {
                    updateFn(path, returnVal, true)
                } else {
                    return returnVal
                }
            }
        }
        return isPlainObject(result) ? stateProxy(`${path}.${prop}`, result, {}, updateFn) : result
    }

})

const useRightIfDefined = (left: any, right: any) => right !== undefined ? right : left

export function stateProxy(path: string, storedState: object | undefined, initialValues: object | undefined, updateFn: updateFnType) {
    const proxyTarget = () => {
        if (isClassObject(storedState)) {
            return storedState
        }

        const mergedState = mergeDeepWith(useRightIfDefined, initialValues || {}, storedState || {})
        const {_type, ...proxyState} = mergedState
        return _type ? new _type(proxyState) : proxyState
    }
    const proxy = new Proxy(proxyTarget(), stateProxyHandler(path, updateFn))
    proxy.init?.((changes: object, replace?: boolean) => updateFn(path, changes, replace))
    return proxy
}