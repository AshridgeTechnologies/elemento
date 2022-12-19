import React, {FunctionComponent} from 'react'
import * as Elemento from '../runtime/index'
import AppRunner from './AppRunner'
import AppCodeError from './AppCodeError'
import AppContext from '../runtime/AppContext'

type Properties = {appCode: string, appContext: AppContext, onComponentSelected?: (id: string) => void, selectedComponentId?: string}

export default function AppRunnerFromCode({appCode, appContext, onComponentSelected  = () => {}, selectedComponentId}: Properties) {
    // @ts-ignore
    globalThis['Elemento'] = Elemento
    globalThis['React'] = React

    const evalCode = appCode
        .replace(/^ *import React from.*$/m, 'const {React} = globalThis')
        .replace(/^ *import Elemento from.*$/m, 'const {Elemento} = globalThis')
        .replace(/export default/, 'return')
    try {
        const appFunction = new Function(evalCode) // throws if not valid JS code
        const appComponent = appFunction() as FunctionComponent
        return React.createElement(AppRunner, {appFunction: appComponent, appContext, onComponentSelected, selectedComponentId})
    } catch (error: any) {
        return React.createElement(AppCodeError, {error})
    }
}