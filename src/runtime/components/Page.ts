import React from 'react'
import {StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {Stack} from '@mui/material'
import {sxProps} from './ComponentHelpers'

type Properties = { path: string, children?: any, styles?: StylesPropVals }

export default function Page({children, path, ...props}: Properties) {
    const {styles = {}} = valueOfProps(props)

    return React.createElement(Stack, {
        id: path,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        spacing: 2,
        height: '100%', width: '100%',
        boxSizing: 'border-box',
        sx: {
            overflowY: 'scroll',
            padding: 1,
            position: 'relative',
            ...sxProps(styles)
        },
        children
    })
}
