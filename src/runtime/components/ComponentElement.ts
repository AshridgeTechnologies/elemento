import React from 'react'
import {PropVal, StylesProps, valueOfProps} from '../runtimeFunctions'
import {Box} from '@mui/material'

type Properties = { path: string, show?: PropVal<boolean>, styles?: StylesProps, children?: any }

export default function ComponentElement({children, path,  ...props}: Properties) {
    const {show = true, styles = {}} = valueOfProps(props)
    const showProps = show ? {} : {display: 'none'}
    const sx = {
        ...showProps,
        ...styles
    }
    return React.createElement(Box, {
        id: path,
        sx,
        children
    })
}
