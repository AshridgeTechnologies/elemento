import {isArray, isFunction, isObject, isPlainObject, isString} from 'lodash'
import {flatten, map} from 'ramda'
import React from 'react'

export function codeGenerationError(_expr: string, _err: string) {
    return undefined
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

export const showAppCode = () => {
    // @ts-ignore
    const code = document.querySelector('script#appMainCode').innerHTML
    console.log(code)
    return code
}

export const highlightClassName = 'elemento-editor-highlight'
const highlightStyleId = 'elementoEditorHighlight'

const findElementWith = (el: Element, condition: (el: Element) => boolean) => {
    let currentEl: Element | null = el
    while (currentEl !== null && !condition(currentEl)) {
        currentEl = currentEl.parentElement
    }

    return currentEl
}

const findInputParentLabel = (el: Element) : Element | null => el.tagName === 'INPUT' ? findElementWith(el, el => el.tagName === 'LABEL') : null

export const highlightElement = (id: string | null) => {
    if (!document.getElementById(highlightStyleId)) {
        const styleEl = document.createElement('style')
        styleEl.id = highlightStyleId
        styleEl.innerHTML = `.${highlightClassName} { outline: 2px dashed orangered !important; outline-offset: 2px}`
        document.head.append(styleEl)
    }
    const oldHighlightedElements = document.querySelectorAll('.' + highlightClassName)
    oldHighlightedElements.forEach( el => el.classList.remove(highlightClassName))

    const addHighlightClass = (idToHighlight: string) => {
        let matchingElements: NodeListOf<Element> | Element[] = document.querySelectorAll(`[id = '${idToHighlight}']`)
        if (matchingElements.length === 0) {
            const indexRegExp = /\.\d+/g
            const allElementsWithId = document.querySelectorAll(`[id]`) as NodeList
            matchingElements = Array.from(allElementsWithId).filter((node) => (<Element>node).id.replace(indexRegExp, '') === idToHighlight) as Element[]
        }
        matchingElements.forEach(el => {
            const elToHighlight = findInputParentLabel(el) ?? el
            elToHighlight.classList.add(highlightClassName)
        })
    }

    if (id) {
        addHighlightClass(id)
        addHighlightClass(id.replace(/^\w+/, 'app'))  //TODO hack to get round wrong ids on input elements
    }
}

export type Value<T> = T | { valueOf: () => T }
export type PropVal<T> = T | { valueOf: () => T }

export function valueOf<T>(x: Value<T>): T {
    return isObject(x) ? x.valueOf() : x
}

export const valueOfProps = (props: object): any => map(valueOf, props)

export function asText(content: any) {
    if (React.isValidElement(content)) return content
    const contentValue = content?.valueOf()
    if (isString(contentValue) && contentValue.includes('\n')) {
        return flatten(contentValue.split('\n').map((line: string, index: number) => [line, React.createElement('br', {key: index})]))
    }
    if (isPlainObject(contentValue)) {
        return valueLiteral(contentValue)
    }
    if (isFunction(contentValue)) {
        return 'function ' + contentValue.name
    }
    return contentValue
}

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
