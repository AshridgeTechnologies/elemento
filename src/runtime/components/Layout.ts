import React from 'react'
import {valueOfProps} from '../runtimeFunctions'
import {Stack} from '@mui/material'

type Properties = { path: string, horizontal?: boolean, width?: string | number, wrap?: boolean, children?: any }

export default function Layout({children, path, horizontal = false, wrap = false, ...props}: Properties) {
    const propVals = valueOfProps(props)
    const direction = horizontal ? 'row' : 'column'
    const flexWrap = wrap ? 'wrap' : 'nowrap'
    return React.createElement(Stack, {
        id: path,
        direction,
        flexWrap,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        spacing: 2,
        ...propVals,
        children
    })
}
