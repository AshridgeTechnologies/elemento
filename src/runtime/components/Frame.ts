import React, {useContext} from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {sxProps} from './ComponentHelpers'
import UrlContext, {UrlContextContext} from '../UrlContext'

type Properties = Readonly<{
    path: string,
    source?: PropVal<string>,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
}>

export default function Frame({path, ...props}: Properties) {
    const urlContext = useContext(UrlContextContext) as UrlContext
    const {source, show, styles = {}} = valueOfProps(props)
    const frameStylesProps = {border: 'none', ...sxProps(styles, show)}
    const src = urlContext.getFullUrl(source)

    return React.createElement('iframe', {id: path, src, style: frameStylesProps,})
}
