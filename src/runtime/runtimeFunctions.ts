import lodash from 'lodash'
import {equals, map} from 'ramda'
import {mapValues} from 'radash'
import * as Module from "module"
import BigNumber from 'bignumber.js'
import {StylingProp} from '../util/StylingTypes'
import {DragOverEvent, DragStartEvent, useDndMonitor} from '@dnd-kit/core'
import {useState} from 'react'

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

export const highlightClassName = 'editor-highlight'
const highlightStyleId = 'elementoEditorHighlight'

const findElementWith = (el: Element, condition: (el: Element) => boolean) => {
    let currentEl: Element | null = el
    while (currentEl !== null && !condition(currentEl)) {
        currentEl = currentEl.parentElement
    }

    return currentEl
}

const findInputParentLabel = (el: Element) : Element | null => el.tagName === 'INPUT' ? findElementWith(el, el => el.tagName === 'LABEL') : null

export const highlightElement = (id: string | undefined) => {
    if (!document.getElementById(highlightStyleId)) {
        const styleEl = document.createElement('style')
        styleEl.id = highlightStyleId
        styleEl.innerHTML = `.${highlightClassName} { outline: 2px dashed orangered !important; outline-offset: 2px}`
        document.head.append(styleEl)
    }
    const oldHighlightedElements = document.querySelectorAll('.' + highlightClassName)
    oldHighlightedElements.forEach( el => el.classList.remove(highlightClassName))

    if (id) {
        let matchingElements: NodeListOf<Element> | Element[] = document.querySelectorAll(`[id = '${id}']`)
        if (matchingElements.length === 0) {
            const listItemIdRegExp = /\.#[^.]+/g
            const allElementsWithId = document.querySelectorAll(`[id]`) as NodeList
            matchingElements = Array.from(allElementsWithId).filter((node) => (<Element>node).id.replace(listItemIdRegExp, '') === id) as Element[]
        }
        matchingElements.forEach(el => {
            const elToHighlight = findInputParentLabel(el) ?? el
            elToHighlight.classList.add(highlightClassName)
        })
    }
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
