import {useEffect, useState} from 'react'
import {mapValues} from 'radash'
import {UpdateBlockable} from './appData'

export type DebugExprs = {[name: string]: string}
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

function getDebugData(valFns: DebugFunctions) {
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

export const elementoDebug = (valFns: DebugFunctions | null) => {

    const data = valFns ? getDebugData(valFns) : null
    const event = new CustomEvent('debugData', { detail: data })
    window.dispatchEvent(event)
}

export type DebugData = { [p: string]: any }
