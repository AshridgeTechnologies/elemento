import React from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {AppBar as MuiAppBar, Stack, Toolbar, Typography} from '@mui/material'
import {sxProps, typographyStyles} from './ComponentHelpers'
import {pick} from 'ramda'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = { path: string, title?: PropVal<string>, children?: any, show?: PropVal<boolean>,
    styles?: StylesPropVals
}

export const AppBarSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "App Bar",
    "description": "A bar shown at the top of the App above every Page.  It can be given a title to display, and it can also contain other elements. ",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "AppBar",
    "icon": "web_asset",
    "elementType": "statelessUI",
    "isLayoutOnly": true,
    "canContain": "elementsWithThisParentType",
    "parentType": "App",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "title": {
                    "description": "The title displayed at the left, before any other elements in the app bar.",
                    "$ref": "#/definitions/StringOrExpression",
                },
                "show": {
                    "description": "Whether this element is displayed",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "styles": {
                    "description": "The specific CSS styles applied to the menu when opened",
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
    "required": ["kind", "properties"],
    "unevaluatedProperties": false,

    "definitions": Definitions
}

export default function AppBar({children, path, ...props}: Properties) {
    const propVals = valueOfProps(props)
    const {title, show, styles = {}} = propVals
    const typographySxProps = sxProps(pick(typographyStyles, styles))
    return <MuiAppBar position="static" id={path} sx={sxProps(styles, show)}>
            <Toolbar variant="dense">
                <Stack
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                    flexWrap='wrap'
                    useFlexGap
                    rowGap={0}
                >
                {title && <Typography variant="h6" component="div" marginRight={2} sx={typographySxProps}>
                    {title}
                </Typography>}
                    <Stack direction="row"
                           justifyContent="flex-start"
                           alignItems="center"
                           spacing={1.5}
                           flexWrap='wrap'
                           useFlexGap
                           rowGap={0}
                    >
                        {children}
                    </Stack>
                </Stack>
            </Toolbar>
        </MuiAppBar>
}

AppBar.Schema = AppBarSchema
