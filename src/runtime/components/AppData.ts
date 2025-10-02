import UrlContext from '../UrlContext'
import {BaseComponentState} from '../state/BaseComponentState'
import Url, {asQueryObject} from '../Url'
import {domElement, PropVal, valueOf, valuesOf} from '../runtimeFunctions'
import {dropWhile, takeWhile} from 'ramda'
import type {FunctionComponent} from 'react'
import {Theme, ThemeOptions} from '@mui/material'
import {createTheme} from '@mui/material/styles'
import {goBack, onUrlChange} from '../navigationHelpers'


export type StateExternalProps = {
    pages: { [key: string]: FunctionComponent },
    urlContext: UrlContext,
    themeOptions: ThemeOptions
}
type StateInternalProps = {
    updateCount?: number,
    subscription?: any
}

export class AppData extends BaseComponentState<StateExternalProps, StateInternalProps> {

    private theme: Theme | undefined
    protected doInit(_previousVersion: this | undefined, _proxyThis: this): void {
        if (!_previousVersion) {
            this.state.subscription = onUrlChange(() => _proxyThis.updateState({updateCount: Date.now()}))  // need state update to cause re-render
        }
    }

    get urlContext() {
        return this.props.urlContext
    }

    currentPage() {
        const pageName = this.CurrentUrl().allPathSections[1]
        const defaultPage = Object.values(this.props.pages)[0]
        return pageName ? this.props.pages[pageName] ?? defaultPage : defaultPage
    }

    pageToDisplay(signedIn: boolean) {
        const notLoggedInPageName = (this.currentPage() as any).notLoggedInPage
        if (signedIn || !notLoggedInPageName) {
            return this.currentPage()
        }

        return this.props.pages[notLoggedInPageName]
    }

    AppWidth = () => domElement(this)?.clientWidth ?? 0
    AppHeight = () => domElement(this)?.clientHeight ?? 0

    Theme = () => this.theme ??= createTheme(this.props.themeOptions)

    CurrentUrl = () => {
        const {location, pathPrefix} = this.urlContext.getUrl()
        const {origin, pathname, query, hash} = location
        return new Url(origin, pathname, pathPrefix, query, hash)
    }

    ShowPage = (page: string | FunctionComponent, ...args: (string | object | null)[]) => {
        const argValues = valuesOf(...args)
        if (page === Url.previous) {
            goBack()
        } else {
            const pageName = typeof page === 'string' ? page : page.name
            const isSegment = (arg: any) => typeof arg === 'string' || typeof arg === 'number'
            const pathSegments = takeWhile(isSegment, argValues)
            const path = '/' + [this._path, pageName, ...pathSegments].join('/')
            const remainingArgs = dropWhile(isSegment, argValues)
            const [query, anchor] = [...remainingArgs, null, null]
            this.urlContext.updateUrl(path, asQueryObject(query as (object | null)), anchor as string)  // subscription to onUrlChange updates state
        }
    }

    FileUrl = (filename: PropVal<string>) => {
        return this.urlContext.getResourceUrl(valueOf(filename))
    }

    SendMessage = (targetName: string | number, message: any) => {
        const targetWindow = globalThis[targetName as keyof typeof globalThis]
        if (!targetWindow) {
            console.warn(`Cannot find window "${targetName}"`)
        }

        targetWindow.postMessage(message, '*')
    }
}
