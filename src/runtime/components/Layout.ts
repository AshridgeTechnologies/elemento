import React from 'react'
import {PropVal, StylesProps, valueOfProps} from '../runtimeFunctions'
import {Stack} from '@mui/material'

type Properties = { path: string, horizontal?: PropVal<boolean>, wrap?: PropVal<boolean>, show?: PropVal<boolean>, styles?: StylesProps, children?: any }

export default function Layout({children, path,  ...props}: Properties) {
    const {horizontal = false, wrap = false, show = true, styles = {}} = valueOfProps(props)
    const direction = horizontal ? 'row' : 'column'
    const flexWrap = wrap ? 'wrap' : 'nowrap'
    const showProps = show ? {} : {display: 'none'}
    const sx = {
        py: horizontal ? 0 : 1,
        overflow: horizontal ? 'visible' : 'scroll',
        maxHeight: '100%',
        boxSizing: 'border-box',
        alignItems: horizontal ? 'baseline' : 'flex-start',
        padding: horizontal ? 0 : 1,
        ...showProps,
        ...styles
    }
    return React.createElement(Stack, {
        id: path,
        direction,
        flexWrap,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        spacing: 2,
        sx,
        children
    })
}
