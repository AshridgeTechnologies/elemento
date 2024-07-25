import {useEffect, useState} from 'react'
import {mapValues} from 'radash'
import {UpdateBlockable} from './appData'
import {addNotification} from './components/notifications'
import {startCase} from 'lodash'

type DebugFn = () => any
type UpdateFunction = { updateAllowed: true, fn: DebugFn }
export type DebugFunctions = {[name: string]: DebugFn | UpdateFunction}

export const useDebugExpr = () => {
    const [, setDebugExprUpdateTime] = useState(0)
    useEffect(() => {
        const listener = ((event: CustomEvent<string>)=> {
            setDebugExprUpdateTime(Date.now())
        })as EventListener
        window.addEventListener('debugExpr', listener)
        return () => {
            window.removeEventListener('debugExpr', listener)
        }
    }, [])
    return (window as any).elementoDebugExpr ?? null
}

function getDebugData(valFnsFn: () => DebugFunctions) {
    let valFns: DebugFunctions
    try {
        valFns = valFnsFn()
    } catch(e: any) {
        return {_error: e.toString()}
    }
    if (!valFns) {
        return null
    }

    const {_state, ...vals} = valFns
    const state = _state && (_state as DebugFn)() as UpdateBlockable
    return mapValues(vals, (val, name) => {
        let updateAttempted = false
        const updateAllowed = (val as UpdateFunction).updateAllowed
        try {
            if (state && !updateAllowed) {
                state.setPreventUpdates( ()=> updateAttempted = true)
            }
            const result = updateAllowed ? (val as UpdateFunction).fn() : (val as DebugFn)()
            return updateAllowed || updateAttempted ? {_isUpdate: true, result} : result
        } catch (e: any) {
            return {_error: e.toString()}
        } finally {
            if (state) {
                state.setPreventUpdates(null)
            }
        }
    })
}

export const elementoDebug = (valFnsFn: (() => DebugFunctions) | null) => {

    const data = valFnsFn ? getDebugData(valFnsFn) : null
    const event = new CustomEvent('debugData', { detail: data })
    window.dispatchEvent(event)
}

let _lastTrace: {component: string, property: string} | null = null
export const lastTrace = () => _lastTrace
export type DebugData = { [p: string]: any }

type Props = { [p: string]: any }
export const elProps = (path: string, includePathProp = true) => {
    const target: Props = includePathProp ? {path}: {}

    const handler = {
        get(target: Props, property: string) {
            if (property === 'props') {
                _lastTrace = null
                return target
            }

            _lastTrace = {component: path, property}

            return (propValue: any) => {
                target[property] = propValue
                return proxy
            }
        }
    };

    const proxy = new Proxy(target, handler)
    return proxy
}

export const stateProps = (name: string) => elProps(name, false)

export const wrapFn = (path: string, propertyName: string, func: (...args: any[]) => any) => {
    const notifyError = (message: string) => {
        addNotification('error', `Error: ${message}`, `in the ${startCase(propertyName)} property of element ${path}`)
    }
    return (...args: any[]) => {
        try {
            const result = func(...args)
            const isPromise = typeof result?.then === 'function'
            return isPromise ? result.catch((e: any) => notifyError(e.message)) : result
        } catch (e: any) {
            notifyError(e.message)
        }
    }
}
