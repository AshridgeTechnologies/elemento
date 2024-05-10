import React from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {Stack, SxProps} from '@mui/material'
import {sxProps} from './ComponentHelpers'

type Properties = { path: string, horizontal?: PropVal<boolean>, wrap?: PropVal<boolean>, show?: PropVal<boolean>, styles?: StylesPropVals, children?: any }

export default function Layout({children, path,  ...props}: Properties) {
    const {horizontal = false, wrap = false, show, styles = {}} = valueOfProps(props)
    const direction = horizontal ? 'row' : 'column'
    const flexWrap = wrap ? 'wrap' : 'nowrap'
    const sx = {
        py: horizontal ? 0 : 1,
        overflow: horizontal ? 'visible' : 'scroll',
        maxHeight: '100%',
        boxSizing: 'border-box',
        alignItems: 'flex-start',
        padding: horizontal ? 0 : 1,
        ...sxProps(styles, show),
    } as SxProps<{}>
    return React.createElement(Stack, {
        id: path,
        direction,
        flexWrap,
        useFlexGap: true,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        spacing: 2,
        sx,
        children
    })
}
