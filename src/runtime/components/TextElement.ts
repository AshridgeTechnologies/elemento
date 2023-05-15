import React from 'react'
import {Typography} from '@mui/material'
import lodash from 'lodash'; const {isArray, isFunction, isPlainObject, isString} = lodash;
import {valueLiteral, valueOfProps} from '../runtimeFunctions'
import {flatten} from 'ramda'

type Properties = {path: string, children?: any
    fontSize?: string | number, fontFamily?: string, color?: string, backgroundColor?: string,
    border?: number, borderColor?: string, width?: number, height?: number, marginBottom?: string | number,
    display?: boolean
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
    const display = 'display' in propVals ? propVals.display : true
    return display ? React.createElement(Typography, {id: path, ...propVals}, ...childArray.map(asText)) : null
}
