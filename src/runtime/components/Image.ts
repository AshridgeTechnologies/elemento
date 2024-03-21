import React, {useContext, CSSProperties} from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import MuiImage from 'mui-image'
import {AppUtilsContext} from '../../runner/AppRunner'
import AppUtils from '../AppUtils'
import {omit, pick} from 'ramda'
import {sxProps} from './ComponentHelpers'

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
    const appUtils = useContext(AppUtilsContext) as AppUtils

    const {source, description, show, styles = {}} = valueOfProps(props)
    const wrapperStylesProps = sxProps(pick(wrapperStyles, styles), show) as CSSProperties
    const imageStylesProps = sxProps(omit(wrapperStyles, styles))
    const src = appUtils.getFullUrl(source)

    // @ts-ignore unknown property id
    return React.createElement(MuiImage, {id: path, src,
        sx: imageStylesProps,
        alt: description,
        title: description,
        duration: 0, // just too annoying during editing if have the transition
        wrapperStyle: wrapperStylesProps
        })
}
