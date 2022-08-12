import * as allComponents from './components'
import {globalFunctions} from './globalFunctions'
import appFunctions from './appFunctions'
import {useGetObjectState, useObjectState} from './appData'
import {asArray, codeGenerationError, parentPath} from './runtimeFunctions'
import AppRunner from './AppRunner'

export const components = {
    App: allComponents.App,
    Page: allComponents.Page,
    TextElement: allComponents.TextElement,
}
export {globalFunctions, appFunctions, useObjectState, useGetObjectState, codeGenerationError, asArray, parentPath, AppRunner}

export {default as React} from 'react'
export {default as ReactDOM} from 'react-dom/client'