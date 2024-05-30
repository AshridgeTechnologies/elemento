import React, {CSSProperties, useContext} from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import MuiImage from 'mui-image'
import {AppContextContext} from '../../runner/AppRunner'
import {omit, pick} from 'ramda'
import {sxProps} from './ComponentHelpers'
import AppContext from '../AppContext'

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

export default function Image({path, ...props}: Properties) {
    const appContext = useContext(AppContextContext) as AppContext

    const {source, description, show, styles = {}} = valueOfProps(props)
    const wrapperStylesProps = sxProps(pick(wrapperStyles, styles), show) as CSSProperties
    const imageStylesProps = sxProps(omit(wrapperStyles, styles))
    const src = appContext.getFullUrl(source)

    // @ts-ignore unknown property id
    return React.createElement(MuiImage, {id: path, src,
        sx: imageStylesProps,
        alt: description,
        title: description,
        duration: 0, // just too annoying during editing if have the transition
        wrapperStyle: wrapperStylesProps
        })
}
