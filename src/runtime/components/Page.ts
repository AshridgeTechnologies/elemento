import React from 'react'
import {StylesPropVals, valueOfProps} from '../runtimeFunctions'
import Stack from '@mui/material/Stack'
import {sxProps} from './ComponentHelpers'
import {Definitions} from '../../model/schema'
import {ElementSchema} from '../../model/ModelElement'

type Properties = { path: string, children?: any, styles?: StylesPropVals }

export const PageSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Page",
    "description": "Description of Page",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Page",
    "icon": "web",
    "elementType": "statefulUI",
    "canContain": "elementsWithThisParentType",
    "parentType": "App",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "notLoggedInPage": {
                    "description": "The ",
                    "$ref": "#/definitions/Expression"
                },
                "styles": {
                    "description": "The ",
                    "$ref": "#/definitions/Styles"
                }
            }
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

export default function Page({children, path, ...props}: Properties) {
    const {styles = {}} = valueOfProps(props)

    return React.createElement(Stack, {
        id: path,
        className: 'ElPage',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        spacing: 2,
        useFlexGap: true,
        height: '100%', width: '100%',
        boxSizing: 'border-box',
        tabIndex: -1,
        sx: {
            outline: 'none',
            overflowY: 'scroll',
            padding: 1,
            position: 'relative',
            ...sxProps(styles)
        },
        children
    })
}

Page.Schema = PageSchema
