import React from 'react'
import {Icon as MuiIcon, IconButton as MuiIconButton} from '@mui/material'
import {PropVal, StylesPropVals, valueOf, valueOfProps} from '../runtimeFunctions'
import {sxProps} from './ComponentHelpers'

type Properties = Readonly<{
    path: string,
    iconName: PropVal<string>,
    label?: PropVal<string>,
    action?: () => void,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
}>

export default function Icon({path, action,  ...props}: Properties) {
    const {iconName, label, show, styles = {}} = valueOfProps(props)
    if (action) {
        return React.createElement(MuiIconButton, {
            id: path,
            'aria-label': label,
            title: label,
            sx: sxProps({}, show),
            onClick: action,
        }, React.createElement(MuiIcon, {sx: sxProps(styles)}, valueOf(iconName)))

    }
    return React.createElement(MuiIcon, {id: path, 'aria-label': label, title: label,
        sx: sxProps(styles, show)}, valueOf(iconName))
}
