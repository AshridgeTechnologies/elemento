import React, {FocusEvent} from 'react'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {DateType} from '../types'
import {DateField, DatePicker} from '@mui/x-date-pickers'
import {pick} from 'ramda'
import {formControlStyles, getLabelWithRequired, inputElementProps, propsForInputComponent, sxFieldSetProps, sxProps} from './ComponentHelpers'
import {definedPropertiesOf} from '../../util/helpers'
import {SxProps} from '@mui/material'
import {useObject} from '../appStateHooks'

type Properties = { path: string, label?: PropVal<string>, readOnly?: PropVal<boolean> }

export default function DateInput({path, ...props}: Properties) {
    const {label, readOnly, show, styles = {}} = valueOfProps(props)
    const sx = {...sxProps(pick(formControlStyles, styles), show), fieldset: sxFieldSetProps(styles)} as SxProps<{}>

    const state = useObject(path)
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
    }
    return readOnly
        ? React.createElement(DateField, {
            slotProps,
            ...optionalProps,
            sx,
            value,
            format: 'dd MMM yyyy',
            readOnly
        })
        : React.createElement(DatePicker, {
            slotProps,
            ...optionalProps,
            sx,
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
