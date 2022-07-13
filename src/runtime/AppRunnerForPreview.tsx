import React, {useEffect, useState} from 'react'
import AppRunnerFromCode from './AppRunnerFromCode'

declare global {
    var setAppCode: (appCode: string) => void
    var getAppCode: () => string | null
    var setComponentSelectedListener: (callback: (id: string) => void) => void
    var highlightElement: (id: string) => void
}

export default function AppRunnerForPreview() {
    const [appCode, setAppCode] = useState<string|null>(null)
    const [onComponentSelected, setOnComponentSelected] = useState<((id: string) => void)|undefined>()
    const [selectedComponentId, setSelectedComponentId] = useState<string|undefined>()

    useEffect( ()=> {
        window.setAppCode = (newAppCode: string) => {
            if (newAppCode !== appCode) {
                setAppCode(newAppCode)
            }
        }
        window.getAppCode = () => appCode
        window.setComponentSelectedListener = (callback: (id: string) => void) => setOnComponentSelected(() => callback)
        window.highlightElement = (id: string) => setSelectedComponentId(id)
    })

    return appCode ? AppRunnerFromCode({appCode, onComponentSelected, selectedComponentId}) : null
}