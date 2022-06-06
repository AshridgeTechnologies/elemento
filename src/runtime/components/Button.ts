import React from 'react'
import {Button as MuiButton} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {valueOf, valueOfProps} from '../runtimeFunctions'

type Properties = {path: string, filled?: boolean , content: React.ReactNode, action?: () => void, display?: boolean}

export default function Button({path, action, content, filled, display}: Properties) {
    const optionalProps = definedPropertiesOf({onClick: action})
    const {display: displayVal} = valueOfProps({display})

    const sx = displayVal !== undefined && !displayVal ? {display: 'none'} : {}
    return React.createElement(MuiButton, {
        id: path,
        variant: filled ? 'contained' : 'outlined',
        size: 'small',
        disableElevation: true,
        sx,
        ...optionalProps,
    }, valueOf(content) as React.ReactNode)
}
