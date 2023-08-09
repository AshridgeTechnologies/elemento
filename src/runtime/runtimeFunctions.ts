import lodash from 'lodash'; const {isArray, isObject, isPlainObject} = lodash;
import {map} from 'ramda'
import * as Module from "module";

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
    const pathWithoutTrailingIndex = path.replace(/\.\d+$/, '')
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

export function valueOf<T>(x: Value<T>): T {
    if (x instanceof Date) return x as T
    return isObject(x) ? x.valueOf() : x
}

export const valuesOf = (...values: Value<any>[]): any[] => values.map(valueOf)
export const valueOfProps = (props: object): any => map(valueOf, props)

export function asArray(value: any[] | object | any) {
    const val = valueOf(value)
    if (isPlainObject(val)) {
        return Object.values(val)
    }

    if (isArray(val)) {
        return val
    }

    if (val === null || val === undefined) {
        return []
    }

    return [val]
}

export const _DELETE = '_DELETE'
export const isClassObject = (obj: any) => isObject(obj) && !isPlainObject(obj)
export const ensureSlash = (prefix: string | null) => prefix?.replace(/^\/?/, '/') ?? ''