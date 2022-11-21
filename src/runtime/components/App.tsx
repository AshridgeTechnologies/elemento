import React, {createElement} from 'react'
import {AppStateForObject, useGetObjectState} from '../appData'
import {Box, Container} from '@mui/material'
import {BaseComponentState, ComponentState} from './ComponentState'
import shallow from 'zustand/shallow'
import AppContext, {UrlType} from '../AppContext'
import Url, {asQueryObject} from '../Url'
import {dropWhile, takeWhile} from 'ramda'
import {valuesOf} from '../runtimeFunctions'

type Properties = {path: string, maxWidth?: string | number, children?: any, topChildren?: any}

const containerBoxCss = {
    height: '100%',
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
    paddingBottom: 1,
    marginTop: 0,
    marginBottom: 0,
}

export default function App({path, maxWidth, children, topChildren}: Properties) {
    const state = useGetObjectState<AppData>('app')
    const {currentPage} = state
    const pagePath = path + '.' + currentPage.name
    const sx = {maxWidth, ...containerBoxCss}

    return <Box id={path} display='flex' flexDirection='column' height='100%' width='100%' className='ElApp'>
        <Box flex='0'>
            {topChildren}
        </Box>
        <Box flex='1' minHeight={0}>
            <Container sx={sx}>
                {createElement(currentPage, {path: pagePath} as React.Attributes) /*we do not know the properties of each page*/}
            </Container>
        </Box>
        <Box flex='0'>
            {children}
        </Box>
    </Box>

}
type StateExternalProps = {
    pages: { [key: string]: React.FunctionComponent },
    appContext: AppContext
}

type StateInternalProps = {
    currentUrl?: UrlType, subscription?: any
}

export class AppData extends BaseComponentState<StateExternalProps, StateInternalProps> implements ComponentState<AppData> {

    init(asi: AppStateForObject): void {
        super.init(asi)
        const {appContext} = this.props
        const {subscription} = this.state

        if (!subscription) {
            this.state.subscription = appContext.onUrlChange(() => this.latest().updateState({currentUrl: appContext.getUrl()}))  // need state update to cause re-render
        }
    }

    updateFrom(newObj: this): this {
        const {pages: thisPages, ...thisProps} = this.props
        const {pages: newPages, ...newProps} = newObj.props
        const pagesEqual = shallow(thisPages, newPages)
        const propsEqual = shallow(thisProps, newProps)
        return pagesEqual && propsEqual ? this : new AppData(newObj.props).withState(this.state) as this
    }

    get currentPage() {
        const pageName = this.CurrentUrl().page
        const defaultPage = Object.values(this.props.pages)[0]
        return pageName ? this.props.pages[pageName] ?? defaultPage : defaultPage
    }

    CurrentUrl = () => {
        const {appContext} = this.props
        const {location, pathPrefix} = appContext.getUrl()
        const {origin, pathname, query, hash} = location
        return new Url(origin, pathname, pathPrefix, query, hash)
    }

    ShowPage = (page: string | React.FunctionComponent, ...args: (string | object | null)[]) => {
        const argValues = valuesOf(...args)
        const {appContext} = this.props
        if (page === Url.previous) {
            appContext.goBack()
        } else {
            const pageName = typeof page === 'string' ? page : page.name
            const isString = (arg: any) => typeof arg === 'string'
            const pathSegments = takeWhile( isString, argValues)
            const path = '/' + [pageName, ...pathSegments].join('/')
            const remainingArgs = dropWhile(isString, argValues)
            const [query, anchor] = [...remainingArgs, null, null]
            appContext.updateUrl(path, asQueryObject(query as (object | null)), anchor as string)  // subscription to onUrlChange updates state
        }
    }
}

App.State = AppData