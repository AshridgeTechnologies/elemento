/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import {componentJSON, testAppInterface, valueObj, wrappedTestElement} from '../../testutil/testHelpers'
import {App, AppBar, Collection, Page, TextElement} from '../../../src/runtime/components/index'
import {StoreProvider, useObjectState} from '../../../src/runtime/appData'
import * as Elemento from '../../../src/runtime/index'
import {fireEvent} from '@testing-library/react'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {AppData} from '../../../src/runtime/components/App'
import AppContext, {DefaultAppContext, UrlType} from '../../../src/runtime/AppContext'
import Url from '../../../src/runtime/Url'
import {createMemoryHistory, MemoryHistory} from 'history'
import MockedFunction = jest.MockedFunction

const [appComponent, appStoreHook] = wrappedTestElement(App, AppData)

const text = () => createElement(TextElement, {path: 'app1.page1.para1'}, 'Hello', 'where are you')
const mainPage = () => createElement(Page, {path: 'app1.page1'}, text())
const urlForPage = (page: string): UrlType => ({
    location: {
        origin: 'http://foo.com', pathname: '/' + page, query: {}, hash: ''
    }, pathPrefix: null
})

let appContext: AppContext

function getRealAppContext(initialPath = '/'): [AppContext, MemoryHistory] {
    const history = createMemoryHistory({initialEntries: [initialPath],})
    const appContext = new DefaultAppContext(null, history, 'http://foo.com')
    return [appContext, history]
}

beforeEach(() => {
    appContext = getRealAppContext()[0]
})

test('App element produces output containing page', () => {
    const component = appComponent('app1', {pages: {mainPage}, appContext}, {})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('App element produces output with max width', () => {
    const component = appComponent('app1', {pages: {mainPage}, appContext}, {maxWidth: 500})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('App element produces output containing page and additional components with app bar at the top', () => {
    const collection1 = createElement(Collection, {path: 'app1.coll1', display: true})
    const collection2 = createElement(Collection, {path: 'app1.coll2', display: true})
    const appBar1 = createElement(AppBar, {path: 'app1.appBar1', title: 'The App bar'})

    const app = () => {
        useObjectState('app1', new App.State({pages: {mainPage}, appContext}))
        useObjectState('app1.coll1', new Collection.State({}))
        useObjectState('app1.coll2', new Collection.State({}))
        return createElement(App, {path: 'app1', topChildren: appBar1}, collection1, collection2)
    }
    const runningApp = createElement(StoreProvider, {children: createElement(app)})
    expect(componentJSON(runningApp)).toMatchSnapshot()
})


test('App shows first page initially and other page when state changes', async () => {

    const [appContext] = getRealAppContext()
    const text = (pageName: string) => createElement(TextElement, {path: 'app1.page1.para1'}, 'this is page ' + pageName)

    function MainPage(props: any) {
        const state = Elemento.useGetObjectState<AppData>('app')
        return React.createElement(Page, {path: props.path},
            text('Main'),
            React.createElement('button', {
                onClick: () => {
                    state.ShowPage('OtherPage')
                }
            }),
        )
    }

    const OtherPage = () => createElement(Page, {path: 'app1.page2'}, text('Other'), 'Page 2')
    const app = () => {
        useObjectState('app1', new App.State({pages: {MainPage, OtherPage}, appContext}))
        return createElement(App, {path: 'app1'})
    }

    const {el, click} = testContainer(createElement(StoreProvider, null, createElement(app, {path: 'app1',})))
    expect(el`p[id="app1.page1.para1"`?.textContent).toBe('this is page Main')

    await actWait( () => click('button'))
    expect(el`p[id="app1.page1.para1`?.textContent).toBe('this is page Other')
})

test('App.State gets current page and can be updated by ShowPage, not called as an object method, with either name or functions', () => {
    const Page1 = (props: any) => null, Page2 = (props: any) => null, Page3 = (props: any) => null
    const pages = {Page1, Page2, Page3}
    const state = new App.State({pages, appContext})
    expect(state.currentPage).toBe(Page1)

    appContext.updateUrl('/unknownPage', null, null)
    const updatedState1 = state._withStateForTest({currentUrl: appContext.getUrl()})
    expect(updatedState1.currentPage).toBe(Page1)

    appContext.updateUrl('/Page2', null, null)
    const updatedState2 = state._withStateForTest({currentUrl: appContext.getUrl()})
    expect(updatedState2.currentPage).toBe(Page2)

    const appInterface = testAppInterface(state); state.init(appInterface)
    const {ShowPage} = state

    ShowPage('Page2')
    const newVersion1 = (appInterface.updateVersion as MockedFunction<any>).mock.calls[0][0]
    expect(newVersion1.currentPage).toBe(Page2)

    ShowPage(Page3)
    const newVersion2 = (appInterface.updateVersion as MockedFunction<any>).mock.calls[1][0]
    expect(newVersion2.currentPage).toBe(Page3)

    ShowPage('goback')
    const newVersion3 = (appInterface.updateVersion as MockedFunction<any>).mock.calls[2][0]
    expect(newVersion3.currentPage).toBe(Page2)
})

test('App.State page, path, query and hash can be updated by ShowPage', () => {
    const Page1 = (props: any) => null, Page2 = (props: any) => null
    const pages = {Page1, Page2}
    const updateUrlSpy = jest.spyOn(DefaultAppContext.prototype, 'updateUrl');
    const state = new App.State({pages, appContext})
    expect(state.currentPage).toBe(Page1)
    appContext.updateUrl('/Page2', null, null)
    const updatedState = state._withStateForTest({currentUrl: appContext.getUrl()})
    expect(updatedState.currentPage).toBe(Page2)

    const appInterface = testAppInterface(state); state.init(appInterface)
    const {ShowPage} = state
    const theDateStr = '2023-10-22T12:34:56.123Z'
    const theDate = new Date(theDateStr)

    ShowPage('Page2', 'tab1', 'sorted', {a: 123, date: theDate}, 'id123')
    const newVersion1 = (appInterface.updateVersion as MockedFunction<any>).mock.calls[0][0]
    expect(newVersion1.currentPage).toBe(Page2)

    ShowPage(Page1, valueObj('tab2'), valueObj(null), valueObj('id123'))
    const newVersion2 = (appInterface.updateVersion as MockedFunction<any>).mock.calls[1][0]
    expect(newVersion2.currentPage).toBe(Page1)
    expect(updateUrlSpy).toHaveBeenCalledTimes(3)
    expect(updateUrlSpy).toHaveBeenNthCalledWith(2, '/Page2/tab1/sorted', {a: '123', date: theDateStr}, 'id123')
    expect(updateUrlSpy).toHaveBeenNthCalledWith(3, '/Page1/tab2', null, 'id123')
})

test('App.State uses latest default page version if it changes', () => {
    const Page1 = (props: any) => null, Page2 = (props: any) => null, Page1updated = (props: any) => null, Page2updated = (props: any) => null
    const pages = {Page1, Page2}
    const state = new App.State({pages, appContext})
    expect(state.currentPage).toBe(Page1)

    const updatedState = state.updateFrom(new App.State({pages: {Page1: Page1updated, Page2}, appContext}))
    expect(updatedState.currentPage).toBe(Page1updated)
})

test('App.State uses latest set page version if it changes ', () => {
    const Page1 = (props: any) => null, Page2 = (props: any) => null, Page1updated = (props: any) => null, Page2updated = (props: any) => null
    const pages = {Page1, Page2}
    const [appContext] = getRealAppContext('/Page2')
    const state = new App.State({pages, appContext})
    expect(state.currentPage).toBe(Page2)

    const updatedState = state.updateFrom(new App.State({pages: {Page1: Page1updated, Page2: Page2updated}, appContext}))
    expect(updatedState.currentPage).toBe(Page2updated)
})

test('App.State does next level compare on pages', () => {
    const Page1 = (props: any) => null, Page2 = (props: any) => null, Page3 = (props: any) => null
    const pages = {Page1, Page2}
    const samePages = {Page1, Page2}
    const newPages = {Page1, Page2, Page3}
    const state = new App.State({pages, appContext})

    expect(state.updateFrom(new App.State({pages: samePages, appContext}))).toBe(state)
    expect(state.updateFrom(new App.State({pages: newPages, appContext}))).not.toBe(state)
})

test('App.State can get current url object', () => {
    const Page1 = (props: any) => null
    const pages = {Page1}
    const origin = 'http.example.com'
    const pathname = '/someapp/somewhere/Page1/tabA/12345'
    const query = {a: '10', b: 'foo'}
    const hash = '#id123'
    const pathPrefix = 'someapp/somewhere'
    const appContext = {
        getUrl(): any {
            return { location: {origin, pathname, query, hash}, pathPrefix }
        },
        updateUrl(path: string, query: object, anchor: string): void {},
        onUrlChange: jest.fn(),
        goBack: jest.fn()
    }
    const state = new App.State({pages, appContext})._withStateForTest({currentUrl: urlForPage('Page2')
})
    expect(state.CurrentUrl()).toStrictEqual(new Url(origin, pathname, pathPrefix, query, hash))
})

test('App.State responds to app context url changes', () => {
    const Page1 = (props: any) => null, Page2 = (props: any) => null, Page3 = (props: any) => null
    const pages = {Page1, Page2, Page3}
    const state0 = new App.State({pages, appContext})
    expect(state0.currentPage).toBe(Page1)
    const appInterface = testAppInterface(state0); state0.init(appInterface)

    appContext.updateUrl('/Page2', null, null)
    const state1 = state0.latest()
    expect(state1).not.toBe(state0)
    expect(state1.currentPage).toBe(Page2)

    appContext.updateUrl('/Page2', {a:10}, 'anchor1')
    const state2 = state0.latest()
    expect(state2).not.toBe(state1)
    expect(state2.currentPage).toBe(Page2)
    expect(state2.CurrentUrl().query).toStrictEqual({a:10})
    expect(state2.CurrentUrl().anchor).toBe('anchor1')
})

test('App.State responds to browser history changes', () => {
    const Page1 = (props: any) => null, Page2 = (props: any) => null, Page3 = (props: any) => null
    const pages = {Page1, Page2, Page3}
    const [appContext, history] = getRealAppContext('/Page1/abc')
    const state0 = new App.State({pages, appContext})
    const appInterface = testAppInterface(state0); state0.init(appInterface)
    expect(state0.CurrentUrl().page).toBe('Page1')
    expect(state0.CurrentUrl().pathSections[0]).toBe('abc')

    appContext.updateUrl('/Page1/xyz', null, null)
    const state1 = state0.latest()
    expect(state1).not.toBe(state0)
    expect(state1.CurrentUrl().page).toBe('Page1')
    expect(state1.CurrentUrl().pathSections[0]).toBe('xyz')

    history.back()
    const state2 = state0.latest()
    expect(state2).not.toBe(state1)
    expect(state2.CurrentUrl().page).toBe('Page1')
    expect(state2.CurrentUrl().pathSections[0]).toBe('abc')
})