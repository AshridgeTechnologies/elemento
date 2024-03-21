import React from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {Box} from '@mui/material'
import {sxProps} from './ComponentHelpers'

type Properties = { path: string, show?: PropVal<boolean>, styles?: StylesPropVals, children?: any }

export default function ComponentElement({children, path,  ...props}: Properties) {
    const {show, styles = {}} = valueOfProps(props)
    return React.createElement(Box, {
        id: path,
        sx: sxProps(styles, show),
        children
    })
}
