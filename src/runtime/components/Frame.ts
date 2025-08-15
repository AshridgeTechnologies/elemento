import React, {useContext} from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {sxProps} from './ComponentHelpers'
import UrlContext, {UrlContextContext} from '../UrlContext'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = Readonly<{
    path: string,
    source?: PropVal<string>,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
}>

export const FrameSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Frame",
    "description": "Description of Frame",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Frame",
    "icon": "picture_in_picture",
    "elementType": "statelessUI",
    "parentType": [
        "Page",
        "Form",
        "Block"
    ],
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "source": {
                    "description": "The ",
                    "$ref": "#/definitions/StringOrExpression"
                },
                "show": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "styles": {
                    "description": "The ",
                    "$ref": "#/definitions/Styles"
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

export default function Frame({path, ...props}: Properties) {
    const urlContext = useContext(UrlContextContext) as UrlContext
    const {source, show, styles = {}} = valueOfProps(props)
    const frameStylesProps = {border: 'none', ...sxProps(styles, show)}
    const src = urlContext.getFullUrl(source)

    return React.createElement('iframe', {id: path, src, style: frameStylesProps,})
}

Frame.Schema = FrameSchema
