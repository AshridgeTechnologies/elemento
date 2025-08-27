import React from 'react'
import {Button, Icon, IconButton, Menu as Mui_Menu} from '@mui/material'
import {compose, omit, pick} from 'ramda'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {sxProps, typographyStyles} from './ComponentHelpers'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = Readonly<{
    path: string,
    label?: PropVal<string>,
    iconName?: PropVal<string>,
    filled?: PropVal<boolean>,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
    buttonStyles?: StylesPropVals
    children?: any
}>

export const MenuSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Menu",
    "description": "Displays a button that, when clicked, shows a list of Menu Items that the user can select.",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Menu",
    "icon": "menu",
    "elementType": "statelessUI",
    "canContain": ['MenuItem'],
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "label": {
                    "description": "The label in the button that displays the menu",
                    "$ref": "#/definitions/StringOrExpression",
                    "default": "=name"
                },
                "iconName": {
                    "description": "The icon shown in the menu button",
                    "$ref": "#/definitions/StringOrExpression",
                },
                "filled": {
                    "description": "Whether the label in the button is filled with the main app colour",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "show": {
                    "description": "Whether this element is displayed",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "styles": {
                    "description": "The specific CSS styles applied to the menu when opened",
                    "$ref": "#/definitions/Styles"
                },
                "buttonStyles": {
                    "description": "The specific CSS styles applied to the menu button",
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

export default function Menu({path, children = [], ...props}: Properties) {
    const {label, iconName, filled, show, styles = {}, buttonStyles = {}} = valueOfProps(props)
    const showProps = show !== undefined && !show ? {display: 'none'} : {}

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const buttonId = `${path}_button`
    const modifiedChildren = React.Children.toArray(children).map( (child: any, index) => {
        const {props} = child
        const existingAction = props.action
        const newAction = existingAction ? compose(existingAction, handleClose) : handleClose
        const key = props.key ?? props.label ?? index
        return React.cloneElement(child, {action: newAction, key})
    })

    const buttonStyleProps = sxProps(omit(typographyStyles, buttonStyles))
    const typographySx = sxProps(pick(typographyStyles, buttonStyles))
    const button = iconName ?
        <IconButton id={buttonId} aria-label={label} title={label} sx={buttonStyleProps} onClick={handleClick}>
            <Icon sx={typographySx}>{iconName}</Icon>
        </IconButton> :
        <Button
        id={buttonId}
        variant={filled ? 'contained' : 'text'}
        size='small'
        disableElevation={true}
        aria-controls={open ? path : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={sxProps(buttonStyles)}
    >
        {label}
    </Button>

    return <div style={showProps}>
        {button}
        <Mui_Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
                id: path,
                'aria-labelledby': buttonId,
                sx: sxProps(styles)
            }}
        >
            {modifiedChildren}
        </Mui_Menu>
    </div>
}

Menu.Schema = MenuSchema
