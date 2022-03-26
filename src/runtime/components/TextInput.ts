import React, {ChangeEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {updateState} from '../appData'
import {valueOfProps} from '../runtimeFunctions'

type Properties = {state: {value?: string, _path: string, _controlValue: string | null}, label?: string, maxLength?: number, width?: string | number, multiline?: boolean}

export default function TextInput({state, ...props}: Properties) {
    const {maxLength, label, multiline, width} = valueOfProps(props)
    const inputProps = maxLength !== undefined ? {inputProps: {maxLength}} : {}
    const widthProp = width !== undefined ? {width} : {}
    const sxProps = {sx: {...widthProp}}
    const optionalProps = definedPropertiesOf({label, multiline})
    const {_path: path} = state
    const value = state._controlValue ?? ''
    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? controlValue : null
        updateState(path, {value: updateValue })
    }

    return React.createElement(TextField, {
        id: path,
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value,
        onChange,
        ...inputProps,
        ...sxProps,
        ...optionalProps
    })
}
