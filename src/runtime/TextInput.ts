import React, {ChangeEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../util/helpers'
import {updateState, useObjectState} from './appData'

type Properties = {path: string, label?: string, initialValue?: string, maxLength?: number}

export default function TextInput({path, initialValue = '', maxLength, multiline, label}: Properties) {
    const state = useObjectState(path)
    const maxLengthProps = maxLength !== undefined ? {inputProps: {maxLength: maxLength}} : {}
    const optionalProps = definedPropertiesOf({label, multiline})
    const value = (state?.value !== undefined) ? state.value : initialValue
    const onChange = (event: ChangeEvent) => updateState(path, {value: (event.target as any).value })

    return React.createElement(TextField, {
        id: path,
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value,
        onChange,
        ...maxLengthProps,
        ...optionalProps
    })
}
