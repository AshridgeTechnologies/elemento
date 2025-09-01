import {ElementSchema} from './ModelElement'
import {Definitions} from './schema'

export const FileFolderSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "File Folder",
    "description": "Description of FileFolder",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "FileFolder",
    "icon": "folder",
    "elementType": "background",
    "canContain": "elementsWithThisParentType",
    "parentType": "Project",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {}
        },
        "elements": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/BaseElement"
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

