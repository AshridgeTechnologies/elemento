import React, {ChangeEvent, createElement, FocusEvent} from 'react'
import {Checkbox, FormControl, FormControlLabel, FormHelperText} from '@mui/material'
import {valueOfProps} from '../runtimeFunctions'
import InputComponentState, {InputComponentMetadata} from './InputComponentState2'
import {TrueFalseType} from '../types'
import {
    BaseInputComponentProperties,
    getLabelWithRequired,
    inputElementProps,
    propsForInputComponent,
    sxPropsForFormControl
} from './ComponentHelpers'
import {noop} from 'lodash'
import {useObject} from '../appStateHooks'
import {omit} from 'ramda'
import {Definitions} from '../../model/schema'
import {ElementMetadata, ElementSchema} from '../../model/ModelElement'
import {use$state} from '../state/appStateHooks'
import {NumberInputState} from './NumberInput'

type Properties = BaseInputComponentProperties & {initialValue?: boolean, dataType?: TrueFalseType}

export const TrueFalseInputSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Truefalseinput",
    "description": "Description of TrueFalseInput",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "TrueFalseInput",
    "icon": "check_box_outlined",
    "elementType": "statefulUI",
    "valueType": "boolean",
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

export const TrueFalseInputMetadata: ElementMetadata = {
    stateProps: [...(InputComponentMetadata.stateProps ?? [])]
}

export default function TrueFalseInput({path, ...props}: Properties) {
    const {label = '', readOnly, show, styles = {}} = valueOfProps(props)
    const sx = sxPropsForFormControl(styles, show)

    const {initialValue, dataType} = props
    const state = use$state(path, TrueFalseInputState, {initialValue, dataType})
    const value = state.dataValue ?? false
    const labelWithRequired = getLabelWithRequired(dataType, label)
    const inputComponentProps = propsForInputComponent(dataType, styles)
    const inputComponentPropsForCheckbox = omit(['endAdornment'], inputComponentProps.InputProps)
    const inputProps = inputElementProps(styles, false, {})

    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors ? (state.errors as string[]).join('.  ') : undefined

    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).checked
        const updateValue = controlValue !== '' ? controlValue : null
        state._setValue(updateValue)
    }
    const onBlur = (_event: FocusEvent) => state._setBlurred()

    const checkbox = createElement(Checkbox, {
        id: path,
        size: 'small',
        color: 'primary',
        checked: value,
        onChange: readOnly ? noop : onChange,
        disabled: readOnly,
        onBlur,
        ...inputProps,
        ...inputComponentPropsForCheckbox,
    })
    return <FormControl error={error} variant="standard">
        <FormControlLabel label={labelWithRequired}
                          labelPlacement='start'
                          htmlFor={path}
                          control={checkbox}
                          sx={sx}/>
        <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
}

export class TrueFalseInputState extends InputComponentState<boolean, TrueFalseType> {
    defaultValue = false

    get modified() {
        const stateValue = this.state.value
        return stateValue !== undefined
            && (stateValue ?? false) !== (this.originalValue ?? false)
    }
}

TrueFalseInput.State = TrueFalseInputState
TrueFalseInput.Schema = TrueFalseInputSchema
TrueFalseInput.Metadata = TrueFalseInputMetadata
