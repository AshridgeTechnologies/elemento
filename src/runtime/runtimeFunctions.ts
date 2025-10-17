import lodash from 'lodash'
import {equals, map} from 'ramda'
import {mapValues} from 'radash'
import * as Module from "module"
import BigNumber from 'bignumber.js'
import {StylingProp} from '../util/StylingTypes'
import {DragOverEvent, DragStartEvent, useDndMonitor} from '@dnd-kit/core'
import {useState} from 'react'
import {BaseComponentState} from './components/ComponentState'

export {isoDateReviver} from '../util/helpers'

const {isArray, isObject, isPlainObject} = lodash

export function codeGenerationError(_expr: string, _err: string) {
    return undefined
}

export function importHandlers(exportName = 'default', moduleName = '') {
    const noopFunction = () => undefined

    function handleModule(module: Module) {
        if (exportName === '*') {
            return module
        }
        const func = module[exportName as keyof Module]
        if (!func) {
            console.error(`Error in import ${moduleName} - name '${exportName}' not found`)
            return noopFunction
        }
        return func
    }

    function handleError(e: any) {
        console.error(`Error in import ${moduleName}`, e)
        return noopFunction
    }

    return [ handleModule, handleError ]
}

export function importModule(moduleName: string, exportName = 'default'): Promise<Function> {
    return import(moduleName).then(...importHandlers(exportName, moduleName))
}

// copy of function used in Generator to avoid additional dependencies for runtime code
export const valueLiteral = function (propertyValue: any): string {
    if (isPlainObject(propertyValue)) {
        return `{${Object.entries(propertyValue).map(([name, val]) => `${name}: ${valueLiteral(val)}`).join(', ')}}`
    } else if (isArray(propertyValue)) {
        return `[${propertyValue.map(valueLiteral).join(', ')}]`
    } else if (typeof propertyValue === 'string') {
        return propertyValue.includes('\n') ? `\`${propertyValue}\`` : `'${propertyValue}'`
    } else {
        return String(propertyValue)
    }
}

export const idOf = (val: any) => val?.id

export function parentPath(path: string) {
    const pathWithoutTrailingIndex = path.replace(/\.#\w+$/, '')
    return pathWithoutTrailingIndex.replace(/\.\w+$/, '')
}

export const showAppCode = () => {
    // @ts-ignore
    const code = document.querySelector('script#appMainCode').innerHTML
    console.log(code)
    return code
}

export type Value<T>   = T | { valueOf: () => T }
export type PropVal<T> = T | { valueOf: () => T }
export type StylesPropVals = Partial<Readonly<{
    [k in StylingProp]: PropVal<string | number>
}>>
export type StylesProps = Partial<Readonly<{
    [k in StylingProp]: string | number
}>>

export function valueOf<T>(x: Value<T>): T {
    if (x instanceof Date) return x as T
    if (x instanceof BigNumber) return x as T
    if (isPlainObject(x)) return mapValues(x as object, valueOf) as T
    return isObject(x) ? x.valueOf() : x
}

export function valueOfOneLevel<T>(x: Value<T>): T {
    if (x instanceof Date) return x as T
    if (x instanceof BigNumber) return x as T
    if (isPlainObject(x)) return x as T
    return isObject(x) ? x.valueOf() : x
}

export const valuesOf = (...values: Value<any>[]): any[] => values.map(valueOf)
export const valueOfProps = (props: object): any => map(valueOf, props)

export function asArray(value: any[] | object | any) {
    if (isArray(value)) {
        return value
    }

    if (value === null || value === undefined) {
        return []
    }

    return [value]
}

export const ensureSlash = (prefix: string | null) => prefix?.replace(/^\/?/, '/') ?? ''
export const lastItemIdOfPath = (path: string) => path.match(/\.#(\w+)[^#]*$/)?.[1]
export const indexedPath = (path: string, index: number) => path + '.#' + index

export const dragFunctions = () => {

    const [draggedData, setDraggedData] = useState<any | null>(null)
    const [dragOverItem, setDragOverItem] = useState<any | null>(null)

    const clearDrag = () => {
        setDragOverItem(null)
        setDraggedData(null)
    }

    useDndMonitor({
        onDragStart(event: DragStartEvent) {
            setDraggedData(event.active.data.current)
        },

        onDragOver(event: DragOverEvent) {
            const item = event.over?.data?.current?.item
            setDragOverItem(item ?? null)
        },

        onDragEnd: clearDrag,
        onDragCancel: clearDrag
    })

    return {
        DragIsOver: (blockOrItem: any) => blockOrItem.isOver !== undefined ? blockOrItem.isOver : equals(blockOrItem, dragOverItem),
        DraggedItem: ()=> draggedData?.item,
        DraggedItemId: ()=> draggedData?.itemId
    }
}

export const domElement = (state: BaseComponentState<any, any>) => state._path ? document.getElementById(state._path) : null
