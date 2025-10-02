import React, {ChangeEvent, FocusEvent, KeyboardEventHandler} from 'react'
import TextField from '@mui/material/TextField'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState, {InputComponentMetadata} from './InputComponentState'
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
import {ElementMetadata, type ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'
import {useComponentState} from '../state/appStateHooks'

type Properties = BaseInputComponentProperties & {initialValue?: string, dataType?: TextType, multiline?: PropVal<boolean>, keyAction?: KeyboardEventHandler}

const dataTypeProps = (dataType: BaseType<any, any> | undefined) => {
    const props = definedPropertiesOf(pick(['maxLength', 'minLength'], dataType ?? {}))
    const format = (dataType as TextType)?.format
    if (format && ['url', 'email'].includes(format)) {
        props.type = format
    }

    return props
}

export const TextInputSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Text Input",
    "description": "An input box to enter text data, single or multiline",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "TextInput",
    "icon": "crop_16_9",
    "elementType": "statefulUI",
    "valueType": "string",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "$ref": "#/definitions/BaseInputProperties",
            "properties": {
                "multiline": {
                    "description": "Whether the value entered can be multiple lines of text",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "keyAction": {
                    "description": "An action to carry out when a key is pressed",
                    "$ref": "#/definitions/ActionExpression",
                    "argNames": ['$event']
                }
            }
        }
    },
    "required": ["kind", "properties"],
    "unevaluatedProperties": false,

    "definitions": Definitions
}

export const TextInputMetadata: ElementMetadata = {
    stateProps: [...(InputComponentMetadata.stateProps ?? [])]
}


export default function TextInput({path, ...props}: Properties) {
    const {label, multiline: multilineProp, readOnly, show, keyAction, styles = {}} = valueOfProps(props)
    const sx = sxPropsForFormControl(styles, show)

    const {initialValue, dataType} = props
    const state: TextInputState = useComponentState(path, TextInputState, {initialValue, dataType})
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
        value: state.value,
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
TextInput.Schema = TextInputSchema
TextInput.Metadata = TextInputMetadata
