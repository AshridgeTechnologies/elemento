import {createRoot, Root} from 'react-dom/client'
import React from 'react'
import {DefaultAppContext} from './AppContext'
import AppRunner from '../runner/AppRunner'
import {ASSET_DIR} from '../shared/constants'

let root: Root

type ComponentSelectedFn = (id: string) => void

export const run = (elementType: React.FunctionComponent,
                    selectedComponentId: string | undefined = undefined,
                    onComponentSelected: ComponentSelectedFn | undefined = undefined,
                    containerElementId = 'main') => {
    const createContainer = () => {
        const container = document.createElement('div')
        container.id = containerElementId
        document.body.appendChild(container)
        return container
    }

    const container = document.getElementById(containerElementId) ?? createContainer()
    if (!root) {
        root = createRoot(container)
    }
    const appContext = new DefaultAppContext(null)
    // @ts-ignore
    const appRunner = React.createElement(AppRunner, {appFunction: elementType, appContext, resourceUrl: ASSET_DIR, selectedComponentId, onComponentSelected})
    root.render(appRunner)
}

let refreshCount = 0
let selectedComponentIds: string[] = []
let appModule: any

export const runForDev = (url: string) => {
    function runModule() {
        run(appModule.default, selectedComponentIds[0], onComponentSelected)
    }

    async function refreshCode() {
        appModule = await import(url + '?' + (++refreshCount))
        runModule()
    }

    function onComponentSelected(id: string) {
        navigator.serviceWorker.controller?.postMessage({type: 'componentSelected', id})
    }

    navigator.serviceWorker.onmessage = (event) => {
        const message = event.data
        if (message.type === 'refreshCode') {
            refreshCode()
        }
        if (message.type === 'selectedItems') {
            selectedComponentIds = message.ids
            runModule()
        }
    }

    return refreshCode()
}