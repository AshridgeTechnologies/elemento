import React from 'react'
import {Typography} from '@mui/material'
import {isArray} from 'lodash'
import {asText, valueOfProps} from './runtimeFunctions'

type Properties = {path: string, children?: any
    fontSize?: string | number, fontFamily?: string, color?: string, backgroundColor?: string,
    border?: number, borderColor?: string, width?: number, height?: number
    }

export default function TextElement({children, path, ...props}: Properties) {
    const childArray = isArray(children) ? children : [children]
    const propVals = valueOfProps(props)
    return React.createElement(Typography, {id: path, gutterBottom: true, ...propVals}, ...childArray.map(asText))
}
