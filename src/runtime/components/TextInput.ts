import React, {ChangeEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'


type Properties = {path: string, label?: PropVal<string>, maxLength?: PropVal<number>, width?: PropVal<string | number>, multiline?: PropVal<boolean>, readOnly?: PropVal<boolean>}

export default function TextInput({path, ...props}: Properties) {
    const {maxLength, label, multiline, width, readOnly} = valueOfProps(props)
    const inputPropsValues = definedPropertiesOf({maxLength, readOnly})
    const inputProps = Object.keys(inputPropsValues).length > 0 ? {inputProps: inputPropsValues} : {}
    const widthProp = width !== undefined ? {width} : {}
    const sxProps = {sx: {...widthProp}}
    const multilineProps = multiline ? {minRows: 2, maxRows: 10} : {}
    const optionalProps = definedPropertiesOf({label, multiline, ...multilineProps})

    const state = useGetObjectState<TextInputState>(path)
    const value = state._controlValue ?? ''
    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? controlValue : null
        state._setValue(updateValue)
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

export class TextInputState extends InputComponentState<string> {
    defaultValue = ''
}

TextInput.State = TextInputState