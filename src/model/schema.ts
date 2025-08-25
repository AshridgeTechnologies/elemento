import {JSONSchema7Definition} from 'json-schema'

export const Definitions: { [k: string]: JSONSchema7Definition } = {
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
    "StringMultilineOrExpression": {
        "$ref": "#/definitions/StringOrExpression"
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
            "backgroundColor": {"$ref": "#/definitions/StringOrExpression"},
            "width": {"$ref": "#/definitions/StringOrNumberOrExpression"},
            "fontSize": {"$ref": "#/definitions/StringOrNumberOrExpression"},
            "fontFamily": {"$ref": "#/definitions/StringOrExpression"},
        }
    }
}
