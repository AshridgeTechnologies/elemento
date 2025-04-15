import AppContext from '../AppContext'
import {BaseComponentState, ComponentState} from './ComponentState'
import {AppStateForObject} from '../appData'
import {shallow} from 'zustand/shallow'
import Url, {asQueryObject} from '../Url'
import {PropVal, valueOf, valuesOf} from '../runtimeFunctions'
import {dropWhile, takeWhile} from 'ramda'
import type {FunctionComponent} from 'react'
import {Theme, ThemeOptions} from '@mui/material'
import {createTheme} from '@mui/material/styles'
import {goBack, onUrlChange} from '../navigationHelpers'

type StateExternalProps = {
    pages: { [key: string]: FunctionComponent },
    appContext: AppContext,
    themeOptions: ThemeOptions
}
type StateInternalProps = {
    updateCount?: number,
    subscription?: any
}

export class AppData extends BaseComponentState<StateExternalProps, StateInternalProps> implements ComponentState<AppData> {

    private theme: Theme | undefined
    init(asi: AppStateForObject, path: string): void {
        super.init(asi, path)
        const {subscription} = this.state

        if (!subscription) {
            this.state.subscription = onUrlChange(() => this.latest().updateState({updateCount: (this.latest().state.updateCount ?? 0) + 1}))  // need state update to cause re-render
        }
    }

    protected isEqualTo(newObj: this) {
        const {pages: thisPages, ...thisProps} = this.props
        const {pages: newPages, ...newProps} = newObj.props
        const pagesEqual = shallow(thisPages, newPages)
        const propsEqual = shallow(thisProps, newProps)
        return pagesEqual && propsEqual
    }

    get appContext() {
        return this.props.appContext
    }

    get currentPage() {
        const pageName = this.CurrentUrl().allPathSections[1]
        const defaultPage = Object.values(this.props.pages)[0]
        return pageName ? this.props.pages[pageName] ?? defaultPage : defaultPage
    }

    pageToDisplay(signedIn: boolean) {
        const notLoggedInPageName = (this.currentPage as any).notLoggedInPage
        if (signedIn || !notLoggedInPageName) {
            return this.currentPage
        }

        return this.props.pages[notLoggedInPageName]
    }

    AppWidth = () => this.domElement?.clientWidth ?? 0
    AppHeight = () => this.domElement?.clientHeight ?? 0

    Theme = () => this.theme ??= createTheme(this.props.themeOptions)

    CurrentUrl = () => {
        const {location, pathPrefix} = this.appContext.getUrl()
        const {origin, pathname, query, hash} = location
        return new Url(origin, pathname, pathPrefix, query, hash)
    }

    ShowPage = (page: string | FunctionComponent, ...args: (string | object | null)[]) => {
        const argValues = valuesOf(...args)
        if (page === Url.previous) {
            goBack()
        } else {
            const pageName = typeof page === 'string' ? page : page.name
            const isString = (arg: any) => typeof arg === 'string'
            const pathSegments = takeWhile(isString, argValues)
            const path = '/' + [this._path, pageName, ...pathSegments].join('/')
            const remainingArgs = dropWhile(isString, argValues)
            const [query, anchor] = [...remainingArgs, null, null]
            this.appContext.updateUrl(path, asQueryObject(query as (object | null)), anchor as string)  // subscription to onUrlChange updates state
        }
    }

    FileUrl = (filename: PropVal<string>) => {
        return this.appContext.getResourceUrl(valueOf(filename))
    }

    SendMessage = (targetName: string | number, message: any) => {
        const targetWindow = globalThis[targetName as keyof typeof globalThis]
        if (!targetWindow) {
            console.warn(`Cannot find window "${targetName}"`)
        }

        targetWindow.postMessage(message, '*')
    }
}
