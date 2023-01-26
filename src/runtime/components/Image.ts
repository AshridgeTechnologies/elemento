import React, {useContext} from 'react'
import {valueOfProps} from '../runtimeFunctions'
import MuiImage from 'mui-image'
import {isNumeric} from '../../util/helpers'
import {AppUtilsContext} from '../../runner/AppRunner'
import AppUtils from '../AppUtils'

type Properties = {path: string, source: string, display?: boolean,
    width?: string | number, height?: string | number, marginBottom?: string | number,
    description?: string | number}

export default function Image({path, ...props}: Properties) {
    const appUtils = useContext(AppUtilsContext) as AppUtils

    const {source, display, width, height, marginBottom, description} = valueOfProps(props)
    const marginBottomWithUnits = marginBottom && (isNumeric(marginBottom.toString()) ? `${marginBottom}px` : marginBottom)

    const sxDisplay = display !== undefined && !display ? {display: 'none'} : {}
    const sx = {...sxDisplay}
    const src = appUtils.getFullUrl(source)

    // @ts-ignore unknown property id
    return React.createElement(MuiImage, {id: path, src, sx, width, height,
        alt: description, title: description,
        duration: 0, // just too annoying during editing if have the transition
        wrapperStyle: {marginBottom: marginBottomWithUnits}})
}
