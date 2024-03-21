import React from 'react'
import {Typography} from '@mui/material'
import lodash from 'lodash';
import {PropVal, StylesPropVals, valueLiteral, valueOfProps} from '../runtimeFunctions'
import {flatten} from 'ramda'
import {sxProps} from './ComponentHelpers'

const {isArray, isFunction, isPlainObject, isObject, isString} = lodash;

type Properties = Readonly<{path: string, children?: any,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
    }>

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
    if (isObject(contentValue)) {
        return contentValue.toString()
    }
    return contentValue
}


export default function TextElement({children, path, ...props}: Properties) {
    const childArray = isArray(children) ? children : [children]
    const {show, styles = {}} = valueOfProps(props)

    return React.createElement(Typography, {id: path, sx: sxProps(styles, show)}, ...childArray.map(asText))
}
