import React from 'react'
import {Button as MuiButton, Link as MuiLink, SxProps, Typography} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, StylesProps, valueOf, valueOfProps} from '../runtimeFunctions'
import {omit, pick} from 'ramda'

const appearanceChoices = ['outline', 'filled', 'link'] as const
type Appearance = typeof appearanceChoices[number]
type Properties = {path: string, appearance?: PropVal<Appearance> , content: PropVal<React.ReactNode>, action?: () => void, show?: PropVal<boolean>, enabled?: PropVal<boolean>, styles?: StylesProps}

const typographyStyles = [
    'font',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'lineHeight',
]

export default function Button({path, ...props}: Properties) {
    const {action, content, appearance, show = true, enabled = true, styles = {}} = valueOfProps(props)
    const optionalProps = definedPropertiesOf({onClick: action})
    const showProps = show ? {} : {display: 'none'}

    if (appearance === 'link') {
        const linkSx = {cursor: 'pointer', ...showProps, ...omit(typographyStyles, styles)}
        const typographySx = {...pick(typographyStyles, styles)}
        return React.createElement(MuiLink, {
            id: path,
            underline: 'hover',
            sx: linkSx,
            ...optionalProps,
        }, React.createElement(Typography, {sx: typographySx as SxProps}, valueOf(content) as React.ReactNode))
    }

    const sx = {cursor: 'pointer', ...showProps, ...styles}
    return React.createElement(MuiButton, {
        id: path,
        variant: appearance === 'filled' ? 'contained' : 'outlined',
        size: 'small',
        disableElevation: true,
        disabled: !enabled,
        sx,
        ...optionalProps,
    }, valueOf(content) as React.ReactNode)
}
