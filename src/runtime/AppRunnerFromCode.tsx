import React, {FunctionComponent} from 'react'
import * as Elemento from '../../src/runtime'
import AppRunner from './AppRunner'
import AppCodeError from './AppCodeError'

type Properties = {appCode: string, onComponentSelected?: (id: string) => void, selectedComponentId?: string}

export default function AppRunnerFromCode({appCode, onComponentSelected  = () => {}, selectedComponentId}: Properties) {
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
        return React.createElement(AppRunner, {appFunction: appComponent, onComponentSelected, selectedComponentId})
    } catch (error: any) {
        return React.createElement(AppCodeError, {error})
    }
}