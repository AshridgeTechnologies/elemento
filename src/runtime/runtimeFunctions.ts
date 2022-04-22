import {isArray, isFunction, isObject, isPlainObject, isString} from 'lodash'
import {flatten, map} from 'ramda'
import React from 'react'

export function codeGenerationError(_expr: string, _err: string) {
    //console.log('Error in expression:', _expr, ':', _err)
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
    if (id) {
        const newHighlightedElements = document.querySelectorAll(`[id = '${id}']`)
        newHighlightedElements.forEach( el => {
            const elToHighlight = findInputParentLabel(el) ?? el
            elToHighlight.classList.add(highlightClassName)
        })
    }
}

export type Value<T> = T | { valueOf: () => T }
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