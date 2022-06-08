import React from 'react'
import {valueOfProps} from '../runtimeFunctions'
import {Stack} from '@mui/material'

type Properties = { path: string, horizontal?: boolean, width?: string | number, wrap?: boolean, children?: any }

export default function Layout({children, path, horizontal = false, wrap = false, ...props}: Properties) {
    const propVals = valueOfProps(props)
    const direction = horizontal ? 'row' : 'column'
    const flexWrap = wrap ? 'wrap' : 'nowrap'
    const sx = {
        py: horizontal ? 0 : 1,
        overflow: horizontal ? 'visible' : 'scroll',
        maxHeight: '100%',
        boxSizing: 'border-box',
        alignItems: horizontal ? 'baseline' : 'flex-start',
        padding: horizontal ? 0 : 1,
    }
    return React.createElement(Stack, {
        id: path,
        direction,
        flexWrap,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        spacing: 2,
        sx,
        ...propVals,
        children
    })
}
