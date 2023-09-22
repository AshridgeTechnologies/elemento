import {createRoot, Root} from 'react-dom/client'
import React, {createElement} from 'react'
import {DefaultAppContext} from './AppContext'
import AppRunner from '../runner/AppRunner'
import {ASSET_DIR} from '../shared/constants'
import {AppStore, AppStoreHook, fixPath} from './appData'
import {StoreApi} from 'zustand'
import AppRunnerFromGitHub from '../runner/AppRunnerFromGitHub'

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
    const resourceUrl = '/studio/preview/' + ASSET_DIR
    // @ts-ignore
    const appRunner = React.createElement(AppRunner, {appFunction: elementType, appContext, resourceUrl, selectedComponentId, onComponentSelected, appStoreHook})
    root.render(appRunner)
}

let refreshCount = 0
let selectedComponentIds: string[] = []
let appModule: any

export const runForDev = (url: string) => {
    const previewMatch = url.match(/studio\/preview\/([\w]+\/)?([-\w]+)\/?$/)
    let codeUrl: string | undefined
    if (previewMatch) {
        const [, prefix = '', appName] = previewMatch
        codeUrl = `/studio/preview/${prefix}${appName}/${appName}.js`
    }
    let appStore: StoreApi<AppStore>
    const appStoreHook: AppStoreHook = {
        setAppStore(sa: StoreApi<AppStore>){
            appStore = sa
            // @ts-ignore
            window.appStore = appStore
        }
    }

    function runModule() {
        run(appModule.default, selectedComponentIds[0], onComponentSelected, appStoreHook)
    }

    async function refreshCode() {
        if (codeUrl) {
            appModule = await import(codeUrl + '?' + (++refreshCount))
            runModule()
        }

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
            const pathInState = fixPath(componentId, undefined)
            const componentState = state.select(pathInState)[pathInState]
            const func = (componentState as any)[functionName]
            func.apply(componentState, args)
        }
    }

    return refreshCode()
}