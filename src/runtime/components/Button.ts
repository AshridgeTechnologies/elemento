import React from 'react'
import {Button as MuiButton, Icon, IconButton, Link as MuiLink, SxProps, Typography} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, StylesPropVals, valueOf, valueOfProps} from '../runtimeFunctions'
import {omit, pick} from 'ramda'
import {sxProps, typographyStyles} from './ComponentHelpers'

const appearanceChoices = ['outline', 'filled', 'link'] as const
type Appearance = typeof appearanceChoices[number]
type Properties = {
    path: string,
    appearance?: PropVal<Appearance>,
    content: PropVal<React.ReactNode>,
    iconName?: PropVal<string>,
    action?: () => void,
    show?: PropVal<boolean>,
    enabled?: PropVal<boolean>,
    styles?: StylesPropVals
}

export default function Button({path, ...props}: Properties) {
    const {action, content, iconName, appearance, show, enabled = true, styles = {}} = valueOfProps(props)
    const optionalProps = definedPropertiesOf({onClick: action})

    if (appearance === 'link') {
        const linkStyleProps = sxProps(omit(typographyStyles, styles), show)
        const sx = {cursor: 'pointer', display: 'inline-flex', ...linkStyleProps}
        const typographySx = {...sxProps(pick(typographyStyles, styles)), width: '100%'}
        return React.createElement(MuiLink, {
            id: path,
            underline: 'hover',
            sx,
            ...optionalProps,
        }, React.createElement(Typography, {sx: typographySx as SxProps}, valueOf(content) as React.ReactNode))
    }

    const sx = {cursor: 'pointer', ...sxProps(styles, show)}
    const startIcon = iconName ? React.createElement(Icon, {}, iconName) : undefined
    return React.createElement(MuiButton, {
        id: path,
        variant: appearance === 'filled' ? 'contained' : 'outlined',
        size: 'small',
        disableElevation: true,
        disabled: !enabled,
        sx,
        startIcon,
        ...optionalProps,
    }, valueOf(content) as React.ReactNode)
}
