import React from 'react'
import {Typography} from '@mui/material'
import DOMPurify from 'dompurify'
import parse, {DOMNode} from 'html-react-parser'
import {asArray, PropVal, StylesPropVals, valueLiteral, valueOfProps} from '../runtimeFunctions'
import {sxProps} from './ComponentHelpers'
import {flatten} from 'ramda'

import lodash from 'lodash';

const {isFunction, isPlainObject, isObject} = lodash;

type Properties = React.PropsWithChildren<Readonly<{
    path: string,
    content: any,
    allowHtml?: boolean,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
}>>

const asText = (content: any) => {
    if (React.isValidElement(content)) return content.toString()
    const contentValue = content?.valueOf()
    if (isPlainObject(contentValue)) {
        return valueLiteral(contentValue)
    }
    if (isFunction(contentValue)) {
        return 'function ' + contentValue.name
    }
    if (isObject(contentValue)) {
        return contentValue.toString()
    }
    return contentValue?.toString() ?? ''
}

function findReactChildren(text: string, allowHtml: boolean, children: React.ReactNode) {
    const childArray = asArray(children)
    const childrenWithPlaceholders = new Set<React.ReactNode>()
    const substituteElementsForPlaceholders = (text: string) => {
        const textChunks = text.split(/(@\w+@)/)
        const findChildWithId = (name: string) => children ? childArray.find(child => {
            const path = child?.props?.path
            return typeof path === 'string' && path.endsWith(`.${name}`)
        }) : null
        return textChunks.map(chunk => {
            const match = chunk.match(/^@(\w+)@$/)
            if (match) {
                const childForPlaceholder = findChildWithId(match[1])
                if (childForPlaceholder) {
                    childrenWithPlaceholders.add(childForPlaceholder)
                    return childForPlaceholder
                }
            }
            return chunk
        })
    }

    const plainTextWithBrs = (text: string) => {
        const lines = text.split('\n')
        return flatten(lines.map((line: string, index: number) => [
            substituteElementsForPlaceholders(line),
            index < lines.length - 1 ? React.createElement('br', {key: index}) : []
        ]))
    }

    const htmlWithBrs = (text: string) => {
        const textWithBreaks = text.replace(/\n+/g, (match: string) => match.substring(1).replace(/\n/g, '<br/>'))
        const contentText = DOMPurify.sanitize(textWithBreaks, {FORCE_BODY: true})
        const substitutePlaceholders = (domNode: DOMNode) => domNode.type === 'text' ? React.createElement(React.Fragment, null, substituteElementsForPlaceholders(domNode.data)) : domNode
        return parse(contentText, {replace: substitutePlaceholders})
    }

    const reactChildren = allowHtml ? htmlWithBrs(text) : plainTextWithBrs(text)
    const childrenWithoutPlaceholders = childArray.filter(child => {
        const path = child?.props?.path
        return typeof path === 'string' && !childrenWithPlaceholders.has(child)
    })
    return [...asArray(reactChildren), ...childrenWithoutPlaceholders]
}

export default function TextElement({children, path, content, allowHtml = false, ...props}: Properties) {
    const {show, styles = {}} = valueOfProps(props)
    const text = asText(content)
    const typographyProps = {id: path, sx: sxProps(styles, show), component: 'div'}
    const reactChildren = findReactChildren(text, allowHtml, children)
    return React.createElement(Typography, typographyProps, ...reactChildren)
}
