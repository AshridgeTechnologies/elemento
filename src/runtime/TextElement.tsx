import React from 'react'
import {Typography} from '@mui/material'
import {flatten} from 'ramda'
import {isArray, isFunction, isPlainObject, isString} from 'lodash'
import {valueLiteral, valueOfProps} from './runtimeFunctions'

type Properties = {path: string, children?: any
    fontSize?: string | number, fontFamily?: string, color?: string, backgroundColor?: string,
    border?: number, borderColor?: string, width?: number, height?: number
    }

function asText(content: any) {
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

export default function TextElement({children, path, ...props}: Properties) {
    const childArray = isArray(children) ? children : [children]
    const propVals = valueOfProps(props)
    return React.createElement(Typography, {id: path, gutterBottom: true, ...propVals}, ...childArray.map(asText))
}
