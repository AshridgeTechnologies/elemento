import React from 'react'
import {Icon as MuiIcon, IconButton as MuiIconButton} from '@mui/material'
import {PropVal, StylesPropVals, valueOf, valueOfProps} from '../runtimeFunctions'
import {sxProps, typographyStyles} from './ComponentHelpers'
import {omit, pick} from 'ramda'

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
    const buttonStyleProps = sxProps(omit(typographyStyles, styles), show)
    const buttonSx = {cursor: 'pointer', ...buttonStyleProps}
    const typographySx = {...sxProps(pick(typographyStyles, styles))}
    if (action) {
        return React.createElement(MuiIconButton, {
            id: path,
            'aria-label': label,
            title: label,
            sx: buttonSx,
            onClick: action,
        }, React.createElement(MuiIcon, {sx: typographySx}, valueOf(iconName)))

    }
    return React.createElement(MuiIcon, {id: path, 'aria-label': label, title: label,
        sx: sxProps(styles, show)}, valueOf(iconName))
}
