import React from 'react'
import {Button as MuiButton} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {valueOf} from '../runtimeFunctions'

type Properties = {path: string, filled?: boolean , content: React.ReactNode, action?: () => void}

export default function Button({path, action, content, filled}: Properties) {
    const optionalProps = definedPropertiesOf({onClick: action})

    return React.createElement(MuiButton, {
        id: path,
        variant: filled ? 'contained' : 'outlined',
        size: 'small',
        disableElevation: true,
        ...optionalProps,
    }, valueOf(content) as React.ReactNode)
}
