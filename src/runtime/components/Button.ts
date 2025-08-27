import React from 'react'
import {Button as MuiButton, Icon, IconButton, Link as MuiLink, SxProps, Typography} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, StylesPropVals, valueOf, valueOfProps} from '../runtimeFunctions'
import {omit, pick} from 'ramda'
import {sxProps, typographyStyles} from './ComponentHelpers'
import {Definitions} from '../../model/schema'
import {ElementSchema} from '../../model/ModelElement'

const appearanceChoices = ['outline', 'filled', 'link'] as const
type Appearance = typeof appearanceChoices[number]
type Properties = {
    path: string,
    appearance?: PropVal<Appearance>,
    content: PropVal<React.ReactNode>,
    iconName?: PropVal<string>,
    action?: () => void,
    show?: PropVal<boolean>,
    enabled?: PropVal<boolean>,
    styles?: StylesPropVals
}

export const ButtonSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Button",
    "description": "A Button element carries out an action when it is clicked.  The action formula defines what the button does.",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Button",
    "icon": "crop_3_2",
    "elementType": "statelessUI",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "content": {
                    "description": "The text shown in the button",
                    "$ref": "#/definitions/StringOrExpression",
                    "default": "=name"
                },
                "iconName": {
                    "description": "The icon to show in the button",
                    "$ref": "#/definitions/StringOrExpression"
                },
                "appearance": {
                    "description": "The overall style of the button",
                    "enum": ["outline", "filled", "link"],
                    "default": "outline"
                },
                "enabled": {
                    "description": "Whether the button is enabled",
                    "$ref": "#/definitions/BooleanOrExpression",
                },
                "action": {
                    "description": "An action to carry out when the button is clicked",
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


export default function Button({path, ...props}: Properties) {
    const {action, content, iconName, appearance, show, enabled = true, styles = {}} = valueOfProps(props)
    const optionalProps = definedPropertiesOf({onClick: action})

    if (appearance === 'link') {
        const linkStyleProps = sxProps(omit(typographyStyles, styles), show)
        const sx = {cursor: 'pointer', display: 'inline-flex', ...linkStyleProps}
        const typographySx = {...sxProps(pick(typographyStyles, styles)), width: '100%'}
        return React.createElement(MuiLink, {
            id: path,
            underline: 'hover',
            sx,
            ...optionalProps,
        }, React.createElement(Typography, {sx: typographySx as SxProps}, valueOf(content) as React.ReactNode))
    }

    const sx = {cursor: 'pointer', ...sxProps(styles, show)}
    const startIcon = iconName ? React.createElement(Icon, {}, iconName) : undefined
    return React.createElement(MuiButton, {
        id: path,
        variant: appearance === 'filled' ? 'contained' : 'outlined',
        size: 'small',
        disableElevation: true,
        disabled: !enabled,
        sx,
        startIcon,
        ...optionalProps,
    }, valueOf(content) as React.ReactNode)
}

Button.Schema = ButtonSchema
