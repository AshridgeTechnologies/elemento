import React, {useContext} from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {AppContextContext} from '../../runner/AppRunner'
import {sxProps} from './ComponentHelpers'
import AppContext from '../AppContext'

type Properties = Readonly<{
    path: string,
    source?: PropVal<string>,
    show?: PropVal<boolean>,
    styles?: StylesPropVals
}>

export default function Frame({path, ...props}: Properties) {
    const appContext = useContext(AppContextContext) as AppContext
    const {source, show, styles = {}} = valueOfProps(props)
    const frameStylesProps = {border: 'none', ...sxProps(styles, show)}
    const src = appContext.getFullUrl(source)

    return React.createElement('iframe', {id: path, src, style: frameStylesProps,})
}
