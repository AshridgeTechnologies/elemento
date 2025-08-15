import React, {CSSProperties, useContext} from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import MuiImage from 'mui-image'
import {omit, pick} from 'ramda'
import {sxProps} from './ComponentHelpers'
import UrlContext, {UrlContextContext} from '../UrlContext'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = Readonly<{
    path: string,
    source?: PropVal<string>,
    description?: PropVal<string>
    show?: PropVal<boolean>,
    styles?: StylesPropVals
}>

const wrapperStyles = [
    'margin',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'marginTop',
    'width',
    'height'
]

export const ImageSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Image",
    "description": "Description of Image",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Image",
    "icon": "image",
    "elementType": "statelessUI",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "source": {
                    "description": "The ",
                    "$ref": "#/definitions/StringOrExpression"
                },
                "description": {
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
export default function Image({path, ...props}: Properties) {
    const urlContext = useContext(UrlContextContext) as UrlContext

    const {source, description, show, styles = {}} = valueOfProps(props)
    const wrapperStylesProps = sxProps(pick(wrapperStyles, styles), show) as CSSProperties
    const imageStylesProps = sxProps(omit(wrapperStyles, styles))
    const src = urlContext.getFullUrl(source)

    // @ts-ignore unknown property id
    return React.createElement(MuiImage, {id: path, src,
        sx: imageStylesProps,
        alt: description,
        title: description,
        duration: 0, // just too annoying during editing if have the transition
        wrapperStyle: wrapperStylesProps
        })
}

Image.Schema = ImageSchema
