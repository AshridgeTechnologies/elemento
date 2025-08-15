import React from 'react'
import {MenuItem as Mui_MenuItem} from '@mui/material'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {sxProps} from './ComponentHelpers'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = Readonly<{
    path: string,
    label: PropVal<string>,
    action?: () => void,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
}>

export const MenuItemSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Menu Item",
    "description": "One of the choices in a Menu",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "MenuItem",
    "icon": "menu_open",
    "elementType": "statelessUI",
    "parentType": "Menu",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "label": {
                    "description": "The text shown in the menu item",
                    "$ref": "#/definitions/StringOrExpression",
                    "default": "=name"
                },
                "action": {
                    "description": "An action to carry out when the menu item is clicked",
                    "$ref": "#/definitions/ActionExpression",
                    "argNames": []
                },
                "show": {
                    "description": "Whether this element is displayed",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "styles": {
                    "description": "The specific CSS styles applied to this element",
                    "$ref": "#/definitions/Styles"
                }
            }
        }
    },
    "required": ["kind", "properties"],
    "unevaluatedProperties": false,

    "definitions": Definitions
}

export default function MenuItem({path, action, ...props}: Properties) {
    const {label, show, styles = {}} = valueOfProps(props)

    return <Mui_MenuItem
        id={path}
        sx={sxProps(styles, show)}
        onClick={action}>{label}</Mui_MenuItem>
}

MenuItem.Schema = MenuItemSchema
