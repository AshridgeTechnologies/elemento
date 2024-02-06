import React from 'react'
import {MenuItem as Mui_MenuItem} from '@mui/material'
import {PropVal, StylesProps, valueOfProps} from '../runtimeFunctions'

type Properties = Readonly<{
    path: string,
    label: PropVal<string>,
    action?: () => void,
    show?: PropVal<boolean>,
    styles?: StylesProps
}>

export default function MenuItem({path, action, ...props}: Properties) {
    const {label, show = true, styles = {}} = valueOfProps(props)
    const showProps = show ? {} : {display: 'none'}
    const sx = {
        ...showProps,
        ...styles
    }

    return <Mui_MenuItem
        id={path}
        sx={sx}
        onClick={action}>{label}</Mui_MenuItem>
}
