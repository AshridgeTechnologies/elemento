import React from 'react'
import {MenuItem as Mui_MenuItem} from '@mui/material'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {sxProps} from './ComponentHelpers'

type Properties = Readonly<{
    path: string,
    label: PropVal<string>,
    action?: () => void,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
}>

export default function MenuItem({path, action, ...props}: Properties) {
    const {label, show, styles = {}} = valueOfProps(props)

    return <Mui_MenuItem
        id={path}
        sx={sxProps(styles, show)}
        onClick={action}>{label}</Mui_MenuItem>
}
