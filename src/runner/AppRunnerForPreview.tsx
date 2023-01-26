import React, {useEffect, useState} from 'react'
import AppRunnerFromCode from './AppRunnerFromCode'
import {equals} from 'ramda'
import {getConfig, setConfig} from '../runtime/components/firebaseApp'
import {getDefaultAppContext} from '../runtime/AppContext'
import {ASSET_DIR} from '../editor/LocalProjectStore'

declare global {
    var setAppCode: (appCode: string) => void
    var getAppCode: () => string | null
    var setFirebaseConfig: (config: object) => void
    var setComponentSelectedListener: (callback: (id: string) => void) => void
    var highlightElement: (id: string) => void
}

export default function AppRunnerForPreview(props: {pathPrefix: string}) {
    const [appCode, setAppCode] = useState<string|null>(null)
    const [onComponentSelected, setOnComponentSelected] = useState<((id: string) => void)|undefined>()
    const [selectedComponentId, setSelectedComponentId] = useState<string|undefined>()

    useEffect( ()=> {
        window.setAppCode = (newAppCode: string) => {
            if (newAppCode !== appCode) {
                setAppCode(newAppCode)
            }
        }
        window.setFirebaseConfig = (newConfig: object) => {
            if (!equals(newConfig, getConfig())) {
                setConfig(newConfig)
            }
        }
        window.getAppCode = () => appCode
        window.setComponentSelectedListener = (callback: (id: string) => void) => setOnComponentSelected(() => callback)
        window.highlightElement = (id: string) => setSelectedComponentId(id)
    })

    const appContext = getDefaultAppContext(props.pathPrefix)
    const resourceUrl = props.pathPrefix + '/' + ASSET_DIR
    return appCode ? AppRunnerFromCode({appCode, appContext, resourceUrl, onComponentSelected, selectedComponentId}) : null
}