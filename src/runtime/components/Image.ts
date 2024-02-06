import React, {useContext} from 'react'
import {PropVal, StylesProps, valueOfProps} from '../runtimeFunctions'
import MuiImage from 'mui-image'
import {AppUtilsContext} from '../../runner/AppRunner'
import AppUtils from '../AppUtils'
import {omit, pick} from 'ramda'
import {CSSProperties} from '@mui/material/styles/createMixins'

type Properties = Readonly<{
    path: string,
    source?: PropVal<string>,
    description?: PropVal<string>
    show?: PropVal<boolean>,
    styles?: StylesProps
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

    const {source, description, show = true, styles = {}} = valueOfProps(props)

    const showProps = show ? {} : {display: 'none'}
    const wrapperStylesProps = pick(wrapperStyles, styles)
    const imageStylesProps = omit(wrapperStyles, styles)
    const wrapperSx = {
        ...showProps,
        ...wrapperStylesProps
    }
    const src = appUtils.getFullUrl(source)

    // @ts-ignore unknown property id
    return React.createElement(MuiImage, {id: path, src,
        sx: imageStylesProps,
        alt: description,
        title: description,
        duration: 0, // just too annoying during editing if have the transition
        wrapperStyle: wrapperSx
        })
}
