import React, {ChangeEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../util/helpers'
import {updateState} from './appData'

type Properties = {state: {value?: string, _path: string}, label?: string, maxLength?: number, multiline?: boolean}

export default function TextInput({state, maxLength, multiline, label}: Properties) {
    const maxLengthProps = maxLength !== undefined ? {inputProps: {maxLength: maxLength}} : {}
    const optionalProps = definedPropertiesOf({label, multiline})
    const {_path: path, value = ''} = state
    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? controlValue : undefined
        updateState(path, {value: updateValue })
    }

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
