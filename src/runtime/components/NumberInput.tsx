import React, {ChangeEvent, FocusEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'
import {NumberType} from '../../shared/types'
import {pick} from 'ramda'
import {InputWithInfo} from './InputWithInfo'

type Properties = {path: string, label?: PropVal<string>, }

export default function NumberInput({path, ...props}: Properties) {
    const {label: plainLabel} = valueOfProps(props)

    const numericProps = {type: 'number', sx: { minWidth: 120, flex: 0 }}
    const state = useGetObjectState<NumberInputState>(path)
    const value = state._controlValue ?? ''
    const dataType = state.dataType
    const label = dataType?.required ? plainLabel + ' (required)' : plainLabel
    const optionalProps = definedPropertiesOf({label})

    const dataTypeProps = definedPropertiesOf(pick(['max', 'min'], dataType ?? {}))
    const inputPropsValues = {...dataTypeProps, }
    const inputProps = Object.keys(inputPropsValues).length > 0 ? {inputProps: inputPropsValues} : {}

    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors ? (state.errors as string[]).join('.  ') : undefined

    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? Number(controlValue) : null
        state._setValue(updateValue)
    }
    const onBlur = (_event: FocusEvent) => state.ShowErrors(true)

    const formControl = React.createElement(TextField, {
        id: path,
        variant: 'outlined',
        size: 'small',
        value,
        error,
        helperText,
        onChange,
        onBlur,
        ...inputProps,
        ...numericProps,
        ...optionalProps
    })

    return InputWithInfo({description: dataType?.description, formControl})
}

export class NumberInputState extends InputComponentState<number, NumberType>  {
    defaultValue = 0
}

NumberInput.State = NumberInputState
