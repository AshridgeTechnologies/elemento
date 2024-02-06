import React from 'react'
import {Typography} from '@mui/material'
import lodash from 'lodash'; const {isArray, isFunction, isPlainObject, isObject, isString} = lodash;
import {PropVal, StylesProps, valueLiteral, valueOfProps} from '../runtimeFunctions'
import {flatten} from 'ramda'

type Properties = Readonly<{path: string, children?: any,
    show?: PropVal<boolean>,
    styles?: StylesProps
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
    const {show = true, styles = {}} = valueOfProps(props)
    const showProps = show ? {} : {display: 'none'}
    const sxProps = {
        ...showProps,
        ...styles
    }

    return React.createElement(Typography, {id: path, sx: sxProps}, ...childArray.map(asText))
}
