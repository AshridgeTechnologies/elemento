import React from 'react'
import {Icon as MuiIcon, IconButton as MuiIconButton} from '@mui/material'
import {PropVal, StylesProps, valueOf, valueOfProps} from '../runtimeFunctions'

type Properties = Readonly<{
    path: string,
    iconName: PropVal<string>,
    label?: PropVal<string>,
    action?: () => void,
    show?: PropVal<boolean>,
    styles?: StylesProps
}>

export default function Icon({path, action,  ...props}: Properties) {
    const {iconName, label, show = true, styles = {}} = valueOfProps(props)

    const showProps = !show ? {display: 'none'} : {}
    const sx = {
        ...showProps,
        ...styles
    }

    if (action) {
        return React.createElement(MuiIconButton, {
            id: path,
            'aria-label': label,
            title: label,
            sx: showProps,
            onClick: action,
        }, React.createElement(MuiIcon, {sx: styles}, valueOf(iconName)))

    }
    return React.createElement(MuiIcon, {id: path, 'aria-label': label, title: label,
        sx: {...showProps, ...styles}}, valueOf(iconName))
}
