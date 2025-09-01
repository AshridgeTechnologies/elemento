import React, {FocusEvent} from 'react'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState, {InputComponentMetadata} from './InputComponentState'
import {DateType} from '../types'
import {DateField, DatePicker} from '@mui/x-date-pickers'
import {pick} from 'ramda'
import {formControlStyles, getLabelWithRequired, inputElementProps, propsForInputComponent, sxFieldSetProps, sxProps} from './ComponentHelpers'
import {definedPropertiesOf} from '../../util/helpers'
import {SxProps} from '@mui/material'
import {useObject} from '../appStateHooks'
import {ElementMetadata, ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = { path: string, label?: PropVal<string>, readOnly?: PropVal<boolean> }

export const DateInputSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Dateinput",
    "description": "Description of DateInput",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "DateInput",
    "icon": "insert_invitation_outlined",
    "elementType": "statefulUI",
    "valueType": "string",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "$ref": "#/definitions/BaseInputProperties",
            "properties": {
            }
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}

export const DateInputMetadata: ElementMetadata = {
    stateProps: [...(InputComponentMetadata.stateProps ?? [])]
}

export default function DateInput({path, ...props}: Properties) {
    const {label, readOnly, show, styles = {}} = valueOfProps(props)
    const sx = {...sxProps(pick(formControlStyles, styles), show), fieldset: sxFieldSetProps(styles)} as SxProps<{}>

    const state = useObject<DateInputState>(path)
    const {value, dataType} = state
    const labelWithRequired = getLabelWithRequired(dataType, label)
    const optionalProps = definedPropertiesOf({label: labelWithRequired})
    const inputComponentProps = propsForInputComponent(dataType, styles)
    const inputProps = inputElementProps(styles, readOnly, {})
    if (inputProps.inputProps) inputProps.inputProps.style = {'zIndex': 1}
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
DateInput.Schema = DateInputSchema
DateInput.Metadata = DateInputMetadata
