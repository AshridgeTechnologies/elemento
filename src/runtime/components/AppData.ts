import AppContext, {UrlType} from '../AppContext'
import {BaseComponentState, ComponentState} from './ComponentState'
import {AppStateForObject} from '../appData'
import {shallow} from 'zustand/shallow'
import Url, {asQueryObject} from '../Url'
import {PropVal, valueOf, valuesOf} from '../runtimeFunctions'
import {dropWhile, takeWhile} from 'ramda'
import type {FunctionComponent} from 'react'

type StateExternalProps = {
    pages: { [key: string]: FunctionComponent },
    appContext: AppContext
}
type StateInternalProps = {
    currentUrl?: UrlType, subscription?: any
}

export class AppData extends BaseComponentState<StateExternalProps, StateInternalProps> implements ComponentState<AppData> {

    init(asi: AppStateForObject, path: string): void {
        super.init(asi, path)
        const {subscription} = this.state

        if (!subscription) {
            this.state.subscription = this.appContext.onUrlChange(() => this.latest().updateState({currentUrl: this.appContext.getUrl()}))  // need state update to cause re-render
        }
    }

    updateFrom(newObj: this): this {
        const {pages: thisPages, ...thisProps} = this.props
        const {pages: newPages, ...newProps} = newObj.props
        const pagesEqual = shallow(thisPages, newPages)
        const propsEqual = shallow(thisProps, newProps)
        return pagesEqual && propsEqual ? this : new AppData(newObj.props).withState(this.state) as this
    }

    get appContext() {
        return this.props.appContext
    }

    get currentPage() {
        const pageName = this.CurrentUrl().page
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

    CurrentUrl = () => {
        const {location, pathPrefix} = this.appContext.getUrl()
        const {origin, pathname, query, hash} = location
        return new Url(origin, pathname, pathPrefix, query, hash)
    }

    ShowPage = (page: string | FunctionComponent, ...args: (string | object | null)[]) => {
        const argValues = valuesOf(...args)
        if (page === Url.previous) {
            this.appContext.goBack()
        } else {
            const pageName = typeof page === 'string' ? page : page.name
            const isString = (arg: any) => typeof arg === 'string'
            const pathSegments = takeWhile(isString, argValues)
            const path = '/' + [pageName, ...pathSegments].join('/')
            const remainingArgs = dropWhile(isString, argValues)
            const [query, anchor] = [...remainingArgs, null, null]
            this.appContext.updateUrl(path, asQueryObject(query as (object | null)), anchor as string)  // subscription to onUrlChange updates state
        }
    }

    FileUrl = (filename: PropVal<string>) => {
        return this.appContext.getResourceUrl(valueOf(filename))
    }
}
