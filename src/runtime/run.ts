import {createRoot, Root} from 'react-dom/client'
import React from 'react'
import {DefaultAppContext} from './AppContext'
import AppRunner from '../runner/AppRunner'
import {ASSET_DIR} from '../shared/constants'
import {AppStore, AppStoreHook, fixPath} from './appData'
import {StoreApi} from 'zustand'

let root: Root

type ComponentSelectedFn = (id: string) => void

export const run = (elementType: React.FunctionComponent,
                    selectedComponentId?: string,
                    onComponentSelected?: ComponentSelectedFn,
                    appStoreHook?: AppStoreHook,
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
    const appRunner = React.createElement(AppRunner, {appFunction: elementType, appContext, resourceUrl: ASSET_DIR, selectedComponentId, onComponentSelected, appStoreHook})
    root.render(appRunner)
}

let refreshCount = 0
let selectedComponentIds: string[] = []
let appModule: any

export const runForDev = (url: string) => {
    let appStore: StoreApi<AppStore>
    const appStoreHook: AppStoreHook = {
        setAppStore(sa: StoreApi<AppStore>){
            appStore = sa
        }
    }

    function runModule() {
        run(appModule.default, selectedComponentIds[0], onComponentSelected, appStoreHook)
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
        if (message.type === 'callFunction') {
            const {componentId, functionName, args = []} = message
            const state = appStore.getState()
            const pathInState = fixPath(componentId)
            const componentState = state.select(pathInState)
            const func = (componentState as any)[functionName]
            func.apply(componentState, args)
        }
    }

    return refreshCode()
}