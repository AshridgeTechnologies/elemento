import React from 'react'
import {StylesProps, valueOfProps} from '../runtimeFunctions'
import {Stack} from '@mui/material'

type Properties = { path: string, children?: any, styles?: StylesProps }

export default function Page({children, path, ...props}: Properties) {
    const {styles = {}} = valueOfProps(props)

    return React.createElement(Stack, {
        id: path,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        spacing: 2,
        height: '100%', width: '100%',
        sx: {
            overflowY: 'scroll',
            padding: 1,
            position: 'relative',
            ...styles
        },
        children
    })
}
