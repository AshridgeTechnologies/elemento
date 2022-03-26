import React, {ChangeEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {updateState} from '../appData'
import {valueOfProps} from '../runtimeFunctions'

type Properties = {state: {value?: number, _path: string, _controlValue: number | null}, label?: string}

export default function NumberInput({state, ...props}: Properties) {
    const {label} = valueOfProps(props)

    const optionalProps = definedPropertiesOf({label})
    const numericProps = {type: 'number', sx: { minWidth: 120, flex: 0 }}
    const {_path: path} = state
    const value = state._controlValue ?? ''
    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? Number(controlValue) : null
        updateState(path, {value: updateValue })
    }

    return React.createElement(TextField, {
        id: path,
        variant: 'outlined',
        size: 'small',
        value,
        onChange,
        ...numericProps,
        ...optionalProps
    })
}
