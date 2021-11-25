import React from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../util/helpers'

type Properties = {label?: string, initialValue?: string, maxLength?: number}

export default function TextInput({initialValue = '', maxLength, label}: Properties) {
    const maxLengthProps = maxLength !== undefined ? {inputProps: {maxLength: maxLength}} : {}
    const optionalProps = definedPropertiesOf({label})
    return React.createElement(TextField, {
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value: initialValue,
        ...maxLengthProps,
        ...optionalProps
    })
}
