import {ElementSchema} from './ModelElement'
import {Definitions} from './schema'

export const FunctionImportSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Functionimport",
    "description": "Description of FunctionImport",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "FunctionImport",
    "icon": "label_important",
    "elementType": "utility",
    "parentType": [
        "App",
        "Page"
    ],
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "source": {
                    "description": "The ",
                    "type": "string"
                },
                "exportName": {
                    "description": "The ",
                    "type": "string"
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

