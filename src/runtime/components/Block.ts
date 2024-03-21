import React from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {Box, SxProps} from '@mui/material'
import {sxProps} from './ComponentHelpers'

type Properties = { path: string, show?: PropVal<boolean>, styles?: StylesPropVals, children?: React.ReactElement[] }

export default function Block({children = [], path,  ...props}: Properties) {
    const {show, styles = {}} = valueOfProps(props)
    const sx = {
        position: 'relative',
        width: '100%',  // so that absolutely positioned children are inside the block
        ...sxProps(styles, show)
    } as SxProps<{}>
    return React.createElement(Box, {
        id: path,
        sx,
        children
    })
}
