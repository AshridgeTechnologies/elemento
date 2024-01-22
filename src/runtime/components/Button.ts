import React from 'react'
import {Button as MuiButton, Link as MuiLink, Typography} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {Value, valueOf, valueOfProps} from '../runtimeFunctions'

const appearanceChoices = ['outline', 'filled', 'link'] as const
type Appearance = typeof appearanceChoices[number]
type Properties = {path: string, appearance?: Appearance , content: Value<React.ReactNode>, action?: () => void, display?: Value<boolean>, enabled?: Value<boolean>}

export default function Button({path, action, content, appearance, display, enabled = true}: Properties) {
    const optionalProps = definedPropertiesOf({onClick: action})
    const {display: displayVal} = valueOfProps({display})
    const sxVariable = displayVal !== undefined && !displayVal ? {display: 'none'} : {}
    const sx = {cursor: 'pointer', ...sxVariable}

    if (appearance === 'link') {
        return React.createElement(MuiLink, {
            id: path,
            underline: 'hover',
            sx,
            ...optionalProps,
        }, React.createElement(Typography, null, valueOf(content) as React.ReactNode))
    }
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
