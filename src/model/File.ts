import {ElementSchema} from './ModelElement'
import {Definitions} from './schema'

export const FileSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "File",
    "description": "Description of File",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "File",
    "icon": "insert_drive_file",
    "elementType": "background",
    "parentType": "FileFolder",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {}
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}
