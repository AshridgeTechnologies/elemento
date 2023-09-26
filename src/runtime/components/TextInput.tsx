import React, {ChangeEvent, FocusEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'
import {TextType} from '../../shared/types'
import {pick} from 'ramda'
import {InputWithInfo} from './InputWithInfo'


type Properties = {path: string, label?: PropVal<string>, width?: PropVal<string | number>, multiline?: PropVal<boolean>, readOnly?: PropVal<boolean>}

export default function TextInput({path, ...props}: Properties) {
    const {label, multiline: multilineProp, width, readOnly} = valueOfProps(props)
    const widthProp = width !== undefined ? {width} : {}
    const sxProps = {sx: {...widthProp}}

    const state = useGetObjectState<TextInputState>(path)
    const {value} = state
    const dataType = state.dataType
    const required = dataType?.required
    const multiline = dataType?.format === 'multiline' || multilineProp
    const multilineProps = multiline ? {minRows: 2, maxRows: 10} : {}
    const optionalProps = definedPropertiesOf({label, multiline, ...multilineProps})

    const dataTypeProps = definedPropertiesOf(pick(['maxLength', 'minLength'], dataType ?? {}))
    const format = dataType?.format
    if (format && ['url', 'email'].includes(format)) {
        dataTypeProps.type = format
    }
    const inputPropsValues = {...dataTypeProps, ...definedPropertiesOf({readOnly}), }
    const inputProps = Object.keys(inputPropsValues).length > 0 ? {inputProps: inputPropsValues} : {}

    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors ? (state.errors as string[]).join('.  ') : undefined

    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? controlValue : null
        state._setValue(updateValue)
    }
    const onBlur = (_event: FocusEvent) => state.ShowErrors(true)

    const formControl =  React.createElement(TextField, {
        id: path,
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value,
        error,
        helperText,
        onChange,
        onBlur,
        ...inputProps,
        ...sxProps,
        ...optionalProps
    })
    return InputWithInfo({description: dataType?.description, required, width, formControl})
}

export class TextInputState extends InputComponentState<string, TextType> {
    defaultValue = ''
}

TextInput.State = TextInputState