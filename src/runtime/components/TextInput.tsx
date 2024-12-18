import React, {ChangeEvent, FocusEvent, KeyboardEventHandler} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'
import {TextType} from '../types'
import {pick} from 'ramda'
import BaseType from '../types/BaseType'
import {
    BaseInputComponentProperties,
    getLabelWithRequired,
    inputElementProps,
    propsForInputComponent,
    sxPropsForFormControl
} from './ComponentHelpers'

type Properties = BaseInputComponentProperties & {multiline?: PropVal<boolean>, keyAction?: KeyboardEventHandler}

const dataTypeProps = (dataType: BaseType<any, any> | undefined) => {
    const props = definedPropertiesOf(pick(['maxLength', 'minLength'], dataType ?? {}))
    const format = (dataType as TextType)?.format
    if (format && ['url', 'email'].includes(format)) {
        props.type = format
    }

    return props
}

export default function TextInput({path, ...props}: Properties) {
    const {label, multiline: multilineProp, readOnly, show, keyAction, styles = {}} = valueOfProps(props)
    const sx = sxPropsForFormControl(styles, show)

    const state = useGetObjectState<TextInputState>(path)
    const {value, dataType} = state
    const multiline = dataType?.format === 'multiline' || multilineProp
    const multilineProps = multiline ? {minRows: 2, maxRows: 10} : {}
    const labelWithRequired = getLabelWithRequired(dataType, label)
    const optionalProps = definedPropertiesOf({label: labelWithRequired, multiline, ...multilineProps})
    const inputComponentProps = propsForInputComponent(dataType, styles)
    const inputProps = inputElementProps(styles, readOnly, dataTypeProps(dataType))

    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors ? (state.errors as string[]).join('.  ') : undefined

    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? controlValue : null
        state._setValue(updateValue)
    }
    const onBlur = (_event: FocusEvent) => state._setBlurred()

    return React.createElement(TextField, {
        id: path,
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value,
        error,
        helperText,
        onChange,
        onBlur,
        onKeyDown: keyAction,
        sx,
        ...inputProps,
        ...inputComponentProps,
        ...optionalProps
    })
}

export class TextInputState extends InputComponentState<string, TextType> {
    defaultValue = ''
}

TextInput.State = TextInputState
