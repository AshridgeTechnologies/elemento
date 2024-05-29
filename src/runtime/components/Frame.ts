import React, {useContext} from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {AppUtilsContext} from '../../runner/AppRunner'
import AppUtils from '../AppUtils'
import {sxProps} from './ComponentHelpers'

type Properties = Readonly<{
    path: string,
    source?: PropVal<string>,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
}>

export default function Frame({path, ...props}: Properties) {
    const appUtils = useContext(AppUtilsContext) as AppUtils
    const {source, show, styles = {}} = valueOfProps(props)
    const frameStylesProps = {border: 'none', ...sxProps(styles, show)}
    const src = appUtils.getFullUrl(source)

    return React.createElement('iframe', {id: path, src, style: frameStylesProps,})
}
