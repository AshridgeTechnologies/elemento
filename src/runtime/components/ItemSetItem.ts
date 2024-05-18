import React, {MouseEventHandler} from 'react'
import {Box} from '@mui/material'
import {StylesPropVals, valueOf} from '../runtimeFunctions'
import {sxProps} from './ComponentHelpers'

type Properties = {
    path: string,
    onClick?: MouseEventHandler<HTMLDivElement> | undefined,
    styles?: StylesPropVals,
    children: React.ReactNode
}

export default function ItemSetItem({path, onClick, styles: styleVals = {}, children}: Properties) {
    const styles = valueOf(styleVals) ?? {}
    return React.createElement(Box, {id: path, onClick, sx: sxProps(styles)}, children)
}
