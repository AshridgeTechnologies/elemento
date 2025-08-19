import React, {ChangeEvent, FocusEvent, KeyboardEventHandler} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import type {InputComponentExternalProps} from './InputComponentState'
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
import {useObject} from '../appStateHooks'
import {type JSONSchema} from '@apidevtools/json-schema-ref-parser'

type Properties = BaseInputComponentProperties & {multiline?: PropVal<boolean>, keyAction?: KeyboardEventHandler}
type StateProperties = InputComponentExternalProps<string, TextType, {}>
export type SchemaProperties = Properties & StateProperties

const dataTypeProps = (dataType: BaseType<any, any> | undefined) => {
    const props = definedPropertiesOf(pick(['maxLength', 'minLength'], dataType ?? {}))
    const format = (dataType as TextType)?.format
    if (format && ['url', 'email'].includes(format)) {
        props.type = format
    }

    return props
}

export const Schema: JSONSchema = {
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

    "definitions": {
        "BaseElement": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "properties": {
                "id": {
                    "description": "The unique identifier of this element",
                    "type": "string"
                },
                "name": {
                    "description": "The name of this element",
                    "type": "string"
                },
                "kind": {
                    "description": "The type of this element eg TextInput",
                    "type": "string"
                },
                "notes": {
                    "description": "Additional information about this element for use by the developer",
                    "type": "string"
                }
            },
            "required": ["id", "name", "kind"]
        },
        "BaseInputProperties": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "properties": {
                "label": {
                    "description": "The label shown for the input box. The name is used if not specified.",
                    "$ref": "#/definitions/StringOrExpression"
                },
                "dataType": {
                    "description": "A Data Type for this input box",
                    "$ref": "#/definitions/Expression"
                },
                "readOnly": {
                    "description": "If true, the initial value shown cannot be changed by the user",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "show": {
                    "description": "Whether this element is displayed",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "styles": {
                    "description": "The specific CSS styles applied to this element",
                    "$ref": "#/definitions/Styles"
                },
                "initialValue": {
                    "description": "The initial value shown in the input box.",
                    "$ref": "#/definitions/StringOrNumberOrExpression"
                }

            },
            "required": []
        },
        // "TextInput": ,
        "Expression": {
            "description": "A formula used to calculate a value",
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "expr": {
                    "description": "The formula",
                    "type": "string"
                }
            }
        },
        "ActionExpression": {
            "description": "A formula used to perform an action",
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "expr": {
                    "description": "The formula",
                    "type": "string"
                }
            }
        },
        "StringOrExpression": {
            "anyOf": [
                {
                    "type": "string"
                },
                {
                    "$ref": "#/definitions/Expression"
                }
            ]
        },
        "StringOrNumberOrExpression": {
            "anyOf": [
                {
                    "type": "string"
                },
                {
                    "type": "number"
                },
                {
                    "$ref": "#/definitions/Expression"
                }
            ]
        },
        "BooleanOrExpression": {
            "anyOf": [
                {
                    "type": "boolean"
                },
                {
                    "$ref": "#/definitions/Expression"
                }
            ]
        },
        "Styles": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "backgroundColor": {
                    "$ref": "#/definitions/StringOrExpression"

                },
                "width": {
                    "$ref": "#/definitions/StringOrNumberOrExpression"
                },
            }
        }
    }
}


export default function TextInput({path, ...props}: Properties) {
    const {label, multiline: multilineProp, readOnly, show, keyAction, styles = {}} = valueOfProps(props)
    const sx = sxPropsForFormControl(styles, show)

    const state: TextInputState = useObject(path)
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
