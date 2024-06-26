import React from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {Box, Stack, SxProps} from '@mui/material'
import {sxProps} from './ComponentHelpers'

const layoutChoices = ['vertical', 'horizontal', 'horizontal wrapped', 'positioned', 'none'] as const
export type BlockLayout = typeof layoutChoices[number]
type Properties = { path: string, layout: BlockLayout, show?: PropVal<boolean>, styles?: StylesPropVals, children?: React.ReactElement[] }
type LayoutProperties = { path: string, horizontal?: PropVal<boolean>, wrap?: PropVal<boolean>, show?: PropVal<boolean>, styles?: StylesPropVals, children?: any }

function Layout({children, path,  ...props}: LayoutProperties) {
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
    } as SxProps
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

const stackLayouts: BlockLayout[] = ['horizontal', 'horizontal wrapped', 'vertical']
export default function Block({children = [], path,  ...props}: Properties) {
    const {show, layout, styles = {}} = valueOfProps(props)
    if (stackLayouts.includes(layout)) {
        const horizontal: boolean = layout.startsWith('horizontal')
        const wrap= layout === 'horizontal wrapped'
        return React.createElement(Layout, {path, horizontal, wrap, show, styles, children})
    }

    // use block layout
    const sx = {
        position: layout === 'positioned' ? 'relative' : 'inherit',
        width: '100%',  // so that absolutely positioned children are inside the block
        ...sxProps(styles, show)
    } as SxProps
    return React.createElement(Box, {
        id: path,
        sx,
        children
    })
}
