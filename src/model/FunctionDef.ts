import {ElementSchema} from './ModelElement'
import {Definitions} from './schema'

export const FunctionDefSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Function",
    "description": "Description of Function",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Function",
    "icon": "functions",
    "elementType": "background",
    "parentType": [
        "App",
        "Page",
        "ItemSet",
        "Component"
    ],
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "input1": {
                    "description": "The ",
                    "type": "string"
                },
                "input2": {
                    "description": "The ",
                    "type": "string"
                },
                "input3": {
                    "description": "The ",
                    "type": "string"
                },
                "input4": {
                    "description": "The ",
                    "type": "string"
                },
                "input5": {
                    "description": "The ",
                    "type": "string"
                },
                "action": {
                    "description": "The ",
                    "type": "boolean"
                },
                "calculation": {
                    "description": "The ",
                    "$ref": "#/definitions/MultilineExpression"
                },
                "private": {
                    "description": "The ",
                    "type": "boolean"
                },
                "javascript": {
                    "description": "The ",
                    "type": "boolean"
                }
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
