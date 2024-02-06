import React, {FocusEvent} from 'react'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'
import {DateType} from '../types'
import {DateField, DatePicker} from '@mui/x-date-pickers'
import {pick} from 'ramda'
import {
    fieldsetComponentStyles,
    formControlStyles,
    getLabelWithRequired,
    inputElementProps,
    propsForInputComponent,
    sxFieldSetProps
} from './InputComponentHelpers'
import {definedPropertiesOf} from '../../util/helpers'
import zIndex from '@mui/material/styles/zIndex'

type Properties = { path: string, label?: PropVal<string>, readOnly?: PropVal<boolean> }

export default function DateInput({path, ...props}: Properties) {
    const {label, readOnly, styles = {}} = valueOfProps(props)
    const sxProps = {sx: {...pick(formControlStyles, styles), fieldset: sxFieldSetProps(styles)}}

    const state = useGetObjectState<DateInputState>(path)
    const {value, dataType} = state
    const labelWithRequired = getLabelWithRequired(dataType, label)
    const optionalProps = definedPropertiesOf({label: labelWithRequired})
    const inputComponentProps = propsForInputComponent(dataType, styles)
    const inputProps = inputElementProps(styles, readOnly, {})
    if (inputProps.inputProps) inputProps.inputProps.style = {'z-index': 1}
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
            onBlur,
            ...inputComponentProps,
            ...inputProps,
        },
        // field: {
        //     ...inputProps.inputProps,
        //     style: {'z-index': 1}
        // },
        // inputAdornment: {
        //     sx: {zIndex: 1}
        // }
    }
    return readOnly
        ? React.createElement(DateField, {
            slotProps,
            ...optionalProps,
            ...sxProps,
            value,
            format: 'dd MMM yyyy',
            readOnly
        })
        : React.createElement(DatePicker, {
            slotProps,
            ...optionalProps,
            ...sxProps,
            value,
            format: 'dd MMM yyyy',
            // @ts-ignore
            onChange,
            minDate: dataType?.min,
            maxDate: dataType?.max,
        })
}

export class DateInputState extends InputComponentState<Date, DateType> {
    defaultValue = null
}

DateInput.State = DateInputState
