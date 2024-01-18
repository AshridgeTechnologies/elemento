import React, {FocusEvent} from 'react'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'
import {DateType} from '../types'
import {InputWithInfo} from './InputWithInfo'
import {DatePicker, DateField} from '@mui/x-date-pickers'

type Properties = {path: string, label?: PropVal<string>, readOnly?: PropVal<boolean> }

export default function DateInput({path, ...props}: Properties) {
    const {label, readOnly} = valueOfProps(props)

    const state = useGetObjectState<DateInputState>(path)
    const {value} = state
    const dataType = state.dataType
    const required = dataType?.required
    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors ? (state.errors as string[]).join('.  ') : undefined

    const onChange = (newDate: Date) => {
        state._setValue(newDate)
    }
    const onBlur = (_event: FocusEvent) => state._setBlurred()

    const slotProps = {
        textField: {
            id: path,
            size: 'small' as 'small',
            error,
            helperText,
            onBlur
        }
    }
    const formControl = readOnly
        ? React.createElement(DateField, {
            label,
            slotProps,
            value,
            format: 'dd MMM yyyy',
            readOnly
        })
        : React.createElement(DatePicker, {
        label,
        slotProps,
        value,
        format: 'dd MMM yyyy',
        // @ts-ignore
        onChange,
        minDate: dataType?.min,
        maxDate: dataType?.max,
    })

    return InputWithInfo({description: dataType?.description, required, formControl})
}

export class DateInputState extends InputComponentState<Date, DateType>  {
    defaultValue = null
}

DateInput.State = DateInputState
