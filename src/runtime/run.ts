import {createRoot, Root} from 'react-dom/client'
import React from 'react'
import AppRunner from '../runner/AppRunner'
import {ASSET_DIR} from '../shared/constants'
import {AppStore, AppStoreHook, fixPath} from './appData'
import {StoreApi} from 'zustand'
import {previewPathComponents} from '../util/helpers'
import AppContext, {AppContextHook} from './AppContext'

let root: Root

type ComponentSelectedFn = (id: string) => void

const run = (urlPath: string,
             projectId: string,
             elementType: React.FunctionComponent,
             selectedComponentId?: string,
             onComponentSelected?: ComponentSelectedFn,
             appStoreHook?: AppStoreHook,
             appContextHook?: AppContextHook,
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
    const resourceUrl = `/studio/preview/${projectId}/${ASSET_DIR}`
    // @ts-ignore
    const appRunner = React.createElement(AppRunner, {appFunction: elementType, pathPrefix: urlPath, resourceUrl, selectedComponentId, onComponentSelected, appStoreHook, appContextHook})
    root.render(appRunner)
}

let refreshCount = 0
let selectedComponentIds: string[] = []
let appModule: any

export const runPreview = (urlPath: string) => {
    const pathComponents = previewPathComponents(urlPath)

    if (!pathComponents) return
    const {projectId, prefix = '', appName, filepath} = pathComponents
    const appPath = prefix + appName
    const codeUrl = `/studio/preview/${projectId}/${appPath}/${appName}.js`
    let appStore: StoreApi<AppStore>
    const appStoreHook: AppStoreHook = {
        setAppStore(sa: StoreApi<AppStore>){
            appStore = sa
            // @ts-ignore
            window.appStore = appStore
        }
    }
    const appContextHook = (appContext: AppContext) => (window as any).appContext = appContext

    let hasSelections = false

    function runModule() {
        run(`/studio/preview/${projectId}/${appName}`, projectId, appModule.default, selectedComponentIds[0], onComponentSelected, appStoreHook, appContextHook, 'main')
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
            if (message.projectId === projectId) {
                refreshCode()
            }
        }
        if (message.type === 'selectedItems') {
            selectedComponentIds = message.ids
            const previousHasSelections = hasSelections
            hasSelections = selectedComponentIds.some(id => id.startsWith(appName + '.'))
            if (hasSelections || (previousHasSelections && !hasSelections)) {
                runModule()
            }
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
