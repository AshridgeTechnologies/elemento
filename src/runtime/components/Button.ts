import React from 'react'
import {Button as MuiButton} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {valueOf} from '../runtimeFunctions'

type Properties = {path: string, content: React.ReactNode, action?: () => void}

export default function Button({path, action, content}: Properties) {
    const optionalProps = definedPropertiesOf({onClick: action})

    return React.createElement(MuiButton, {
        id: path,
        variant: 'outlined',
        size: 'small',
        ...optionalProps,
    }, valueOf(content) as React.ReactNode)
}
