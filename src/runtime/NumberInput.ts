import React, {ChangeEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../util/helpers'
import {updateState} from './appData'

type Properties = {state: {value?: number, _path: string}, label?: string}

export default function NumberInput({state, label}: Properties) {
    const optionalProps = definedPropertiesOf({label})
    const {_path: path, value = ''} = state
    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? Number(controlValue) : undefined
        updateState(path, {value: updateValue })
    }

    return React.createElement(TextField, {
        id: path,
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value,
        onChange,
        ...optionalProps
    })
}
