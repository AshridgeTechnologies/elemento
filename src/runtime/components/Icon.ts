import React from 'react'
import {Icon as MuiIcon, IconButton as MuiIconButton} from '@mui/material'
import {PropVal, StylesPropVals, valueOf, valueOfProps} from '../runtimeFunctions'
import {sxProps, typographyStyles} from './ComponentHelpers'
import {omit, pick} from 'ramda'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = Readonly<{
    path: string,
    iconName: PropVal<string>,
    label?: PropVal<string>,
    action?: () => void,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
}>

export const IconSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Icon",
    "description": "Displays an icon, which can also act as a button and perform an action when it is clicked.",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Icon",
    "icon": "sentiment_satisfied",
    "elementType": "statelessUI",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "iconName": {
                    "description": "The name of the icon to show.\n" +
                        "Must be the name of a Material Icon, all lower case, with underscores between words.\n" +
                        "Eg for the Check Circle Outline icon use the name check_circle_outline.\n" +
                        "Find the icons available on the Material Icons website",
                    "$ref": "#/definitions/StringOrExpression"
                },
                "label": {
                    "description": "The title (tooltip) text for the icon",
                    "$ref": "#/definitions/StringOrExpression"
                },
                "action": {
                    "description": "An action to carry out when the icon is clicked",
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

export default function Icon({path, action,  ...props}: Properties) {
    const {iconName, label, show, styles = {}} = valueOfProps(props)
    const buttonStyleProps = sxProps(omit(typographyStyles, styles), show)
    const buttonSx = {cursor: 'pointer', ...buttonStyleProps}
    const typographySx = {...sxProps(pick(typographyStyles, styles))}
    if (action) {
        return React.createElement(MuiIconButton, {
            id: path,
            'aria-label': label,
            title: label,
            sx: buttonSx,
            onClick: action,
        }, React.createElement(MuiIcon, {sx: typographySx}, valueOf(iconName)))

    }
    return React.createElement(MuiIcon, {id: path, 'aria-label': label, title: label,
        sx: sxProps(styles, show)}, valueOf(iconName))
}

(Icon as any).Schema = IconSchema
