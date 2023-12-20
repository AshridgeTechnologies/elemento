import React, {ChangeEvent, FocusEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'
import {NumberType} from '../types'
import {isNil, pick} from 'ramda'
import {InputWithInfo} from './InputWithInfo'
import BigNumber from 'bignumber.js'
import DecimalType from '../types/DecimalType'

type Properties = {path: string, label?: PropVal<string>, }

export default function NumberInput({path, ...props}: Properties) {
    const {label} = valueOfProps(props)

    const state = useGetObjectState<NumberInputState>(path)
    const dataType = state.dataType
    const decPlaces = dataType?.kind === 'Decimal' ? (dataType as DecimalType).decimalPlaces : undefined
    const numericProps = {type: 'number', sx: { minWidth: 120, flex: 0 }}

    const formatValue = () => {
        const {dataValue} = state
        if (isNil(dataValue)) return ''
        if (decPlaces !== undefined){
            return dataValue.toFixed(decPlaces)
        }
        return dataValue.toString()
    }
    const value = state.controlValue ?? formatValue()
    const required = dataType?.required
    const optionalProps = definedPropertiesOf({label})

    const dataTypeProps = definedPropertiesOf(pick(['max', 'min'], dataType ?? {}))
    const step = decPlaces === 0 ? 1 : undefined

    const inputPropsValues = {...dataTypeProps, step}
    const inputProps = Object.keys(inputPropsValues).length > 0 ? {inputProps: inputPropsValues} : {}

    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors ? (state.errors as string[]).join('.  ') : undefined

    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = () => {
            if (controlValue === '') return null
            if (dataType?.kind === 'Decimal') return new BigNumber(controlValue)
            return Number(controlValue)
        }
        state._setValues(updateValue(), controlValue)
    }
    const onBlur = (_event: FocusEvent) => state._setBlurred()

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

    return InputWithInfo({description: dataType?.description, required, formControl})
}

export class NumberInputState extends InputComponentState<number | BigNumber, NumberType | DecimalType>  {
    defaultValue = 0

    _setValues(value: number | BigNumber | null, editedValue: string) {
        this.updateState({value, editedValue})
    }
}

NumberInput.State = NumberInputState
