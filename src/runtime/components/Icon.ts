import React from 'react'
import {Icon as MuiIcon, IconButton as MuiIconButton} from '@mui/material'
import {valueOf, valueOfProps} from '../runtimeFunctions'

type Properties = {path: string, iconName: string, label?: string, color?: string, fontSize?: string | number, action?: () => void, display?: boolean}

export default function Icon({path, action,  ...props}: Properties) {
    const {iconName, label, color, fontSize, display} = valueOfProps(props)


    const sxDisplay = display !== undefined && !display ? {display: 'none'} : {}
    const sx = {display: sxDisplay, color, fontSize}

    if (action) {
        return React.createElement(MuiIconButton, {
            id: path,
            'aria-label': label,
            title: label,
            sx: {display: sxDisplay},
            onClick: action,
        }, React.createElement(MuiIcon, {sx: {color, fontSize}}, valueOf(iconName)))

    }
    return React.createElement(MuiIcon, {id: path, 'aria-label': label, title: label, sx: {display: sxDisplay, color, fontSize}}, valueOf(iconName))
}
