import React, {ChangeEvent, FocusEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {NumberType} from '../types'
import {isNil, pick} from 'ramda'
import BigNumber from 'bignumber.js'
import DecimalType from '../types/DecimalType'
import BaseType from '../types/BaseType'
import {
    BaseInputComponentProperties,
    getLabelWithRequired,
    inputElementProps,
    propsForInputComponent,
    sxPropsForFormControl
} from './ComponentHelpers'
import {useObject} from '../appStateHooks'

type Properties = BaseInputComponentProperties

const decPlaces = (dataType: BaseType<any, any> | undefined) => dataType?.kind === 'Decimal' ? (dataType as DecimalType).decimalPlaces : undefined

const dataTypeProps = (dataType: BaseType<any, any> | undefined) => {
    const props = definedPropertiesOf(pick(['max', 'min'], dataType ?? {}))
    props.step = decPlaces(dataType) === 0 ? 1 : undefined
    return props
}

export default function NumberInput({path, ...props}: Properties) {
    const {label, readOnly, show, styles = {}} = valueOfProps(props)
    const sx = sxPropsForFormControl(styles, show, {minWidth: 120, flex: 0})

    const state: NumberInputState = useObject(path)
    const {dataValue, dataType} = state

    const formatValue = () => {
        if (isNil(dataValue)) return ''
        const dp = decPlaces(dataType)
        return dp !== undefined ? dataValue.toFixed(dp) : dataValue.toString()
    }
    const value = state.controlValue ?? formatValue()
    const labelWithRequired = getLabelWithRequired(dataType, label)
    const optionalProps = definedPropertiesOf({label: labelWithRequired})
    const inputComponentProps = propsForInputComponent(dataType, styles)
    const inputProps = inputElementProps(styles, readOnly, dataTypeProps(dataType))

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

    return React.createElement(TextField, {
        id: path,
        variant: 'outlined',
        size: 'small',
        type: 'number',
        value,
        error,
        helperText,
        onChange,
        onBlur,
        sx,
        ...inputProps,
        ...inputComponentProps,
        ...optionalProps
    })
}

export class NumberInputState extends InputComponentState<number | BigNumber, NumberType | DecimalType>  {
    defaultValue = 0

    _setValues(value: number | BigNumber | null, editedValue: string) {
        this.updateState({value, editedValue})
    }
}

NumberInput.State = NumberInputState
