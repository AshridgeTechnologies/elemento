/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import {componentJSON, mockReturn, testAppInterface, valueObj, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {App, AppBar, Collection, Page, TextElement} from '../../../src/runtime/components/index'
import {StoreProvider} from '../../../src/runtime/appData'
import {setObject, useObject} from '../../../src/runtime/appStateHooks'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import '@testing-library/jest-dom'
import UrlContext, {DefaultUrlContext, UrlType} from '../../../src/runtime/UrlContext'
import Url from '../../../src/runtime/Url'
import {AppData} from '../../../src/runtime/components/AppData'
import * as authentication from '../../../src/runtime/components/authentication'
import {addNotification} from '../../../src/runtime/components/notifications'
import {ensureSlash} from '../../../src/runtime/runtimeFunctions'
import renderer from 'react-test-renderer'

jest.mock('../../../src/runtime/components/authentication')

const [appComponent] = wrappedTestElement(App, AppData)

const text = (content: string) => createElement(TextElement, {path: 'app1.page1.para1', content})
const mainPage = () => createElement(Page, {path: 'app1.page1'}, text('Hello\nwhere are you'))
const notLoggedInPage = () => createElement(Page, {path: 'app1.page1'}, text('Please log in'))
const loggedInOnlyPage = ()=> createElement(Page, {path: 'app1.page1'}, text('You are logged in'))
loggedInOnlyPage.notLoggedInPage = 'notLoggedInPage'

const urlForPage = (page: string): UrlType => ({
    location: {
        origin: 'http://foo.com', pathname: '/' + page, query: {}, hash: ''
    }, pathPrefix: null
})

let appContext: UrlContext

function getRealAppContext(initialPath = '/'): [UrlContext] {
    const appContext = new DefaultUrlContext(null, undefined)
    return [appContext]
}

beforeEach(() => {
    appContext = getRealAppContext()[0]
    mockReturn(authentication.isSignedIn, false)
})

test('App element produces output containing page', () => {
    const component = appComponent('app1', {pages: {mainPage}, appContext}, {})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('App element produces output with max width', () => {
    const component = appComponent('app1', {pages: {mainPage}, appContext}, {maxWidth: 500})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('App element inserts favicon link', () => {
    const faviconUrl = 'https://example.com/favicon.svg'
    const component = appComponent('app1', {pages: {mainPage}, appContext}, {faviconUrl})
    renderer.create(component)
    const linkHref = (window.document.head.querySelector('link[rel=icon]') as any).href
    expect(linkHref).toBe(faviconUrl)
})

test('App element produces output containing page and additional components with app bar at the top', () => {
    const collection1 = createElement(Collection, {path: 'app1.coll1', display: true})
    const collection2 = createElement(Collection, {path: 'app1.coll2', display: true})
    const appBar1 = createElement(AppBar, {path: 'app1.appBar1', title: 'The App bar'})

    const app = () => {
        setObject('app1', new App.State({pages: {mainPage}, appContext}))
        setObject('app1.coll1', new Collection.State({}))
        setObject('app1.coll2', new Collection.State({}))
        return createElement(App, {path: 'app1', topChildren: appBar1}, collection1, collection2)
    }
    const runningApp = createElement(StoreProvider, {children: createElement(app)})
    expect(componentJSON(runningApp)).toMatchSnapshot()
})

test('App element shows notifications', async () => {
    const app = () => {
        setObject('app1', new App.State({pages: {mainPage}, appContext}))
        return createElement(App, {path: 'app1'})
    }
    const {el} = testContainer(createElement(StoreProvider, null, createElement(app, {path: 'app1',})))

    addNotification('success', 'Something happened')
    await wait()
    expect(el`.notistack-Snackbar`).toContainHTML('Something happened')
})

test('App element produces output containing not logged in page if it exists and not logged in', () => {
    const appBar1 = createElement(AppBar, {path: 'app1.appBar1', title: 'The App bar'})

    const app = () => {
        setObject('app1', new App.State({pages: {loggedInOnlyPage, notLoggedInPage, mainPage}, appContext}))
        return createElement(App, {path: 'app1', topChildren: appBar1})
    }
    const runningApp = createElement(StoreProvider, {children: createElement(app)})
    expect(JSON.stringify(componentJSON(runningApp))).toContain('Please log in')
    expect(componentJSON(runningApp)).toMatchSnapshot()
})

test('App element produces output containing normal page if logged in', () => {
    mockReturn(authentication.isSignedIn, true)
    const appBar1 = createElement(AppBar, {path: 'app1.appBar1', title: 'The App bar'})

    const app = () => {
        setObject('app1', new App.State({pages: {loggedInOnlyPage, notLoggedInPage, mainPage}, appContext}))
        return createElement(App, {path: 'app1', topChildren: appBar1})
    }
    const runningApp = createElement(StoreProvider, {children: createElement(app)})
    expect(JSON.stringify(componentJSON(runningApp))).toContain('You are logged in')
    expect(componentJSON(runningApp)).toMatchSnapshot()
})

test('App shows first page initially and other page when state changes and only runs startup action once and does not return anything from the startup action', async () => {
    let startupCount = 0
    const [appContext] = getRealAppContext()
    const text = (pageName: string) => createElement(TextElement, {path: 'app1.page1.para1', content: 'this is page ' + pageName} )

    function MainPage(props: any) {
        const appState = useObject('app1')
        return React.createElement(Page, {path: props.path},
            text('Main'),
            React.createElement('button', {
                onClick: () => {
                    (appState as any).ShowPage('OtherPage')
                }
            }),
        )
    }

    const OtherPage = () => createElement(Page, {path: 'app1.page2'}, text('Other'), 'Page 2')
    const app = () => {
        setObject('app1', new App.State({pages: {MainPage, OtherPage}, appContext}))
        return createElement(App, {path: 'app1', startupAction: () => {
                startupCount++
                return () => {
                    throw new Error('Should not be called!')
                }
            }})
    }

    const {el, click, unmount} = testContainer(createElement(StoreProvider, null, createElement(app, {path: 'app1',})))
    expect(el`div[id="app1.page1.para1"]`?.textContent).toBe('this is page Main')
    expect(startupCount).toBe(1)

    await actWait( () => click('button'))
    expect(el`div[id="app1.page1.para1"]`?.textContent).toBe('this is page Other')
    expect(startupCount).toBe(1)
    unmount() // to check nothing returned from the startup action is called
})

test('App element produces output with cookie message', () => {
    const component = appComponent('app1', {pages: {mainPage}, appContext}, {cookieMessage: 'We love cookies'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('App element receives messages sent to window', async () => {
    const messageAction = jest.fn()
    const app = () => {
        setObject('app1', new App.State({pages: {mainPage}, appContext}))
        return createElement(App, {path: 'app1', messageAction})
    }

    const {unmount} = testContainer(createElement(StoreProvider, null, createElement(app, {path: 'app1',})), 'messageActionTest')

    window.postMessage({greeting: 'Hi there app!'}, '*')
    await wait()
    expect(messageAction).toHaveBeenCalledWith(null, {greeting: 'Hi there app!'})

    unmount() // check message listener is removed

    window.postMessage({greeting: 'Hi again app!'}, '*')
    await wait()
    expect(messageAction).toHaveBeenCalledTimes(1)
})

test('App.State can send messages', async () => {
    const Page1 = (_props: any) => null
    const state = new App.State({Page1}, appContext)

    let data: any
    const listener = (event: MessageEvent) => data = event.data
    window.addEventListener('message', listener)

    state.SendMessage('top', {greeting: 'Hi there!'})
    await wait()
    expect(data).toStrictEqual({greeting: 'Hi there!'})
})

test('App.State gets current page and can be updated by ShowPage, not called as an object method, with either name or functions', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page3 = (_props: any) => null
    const pages = {Page1, Page2, Page3}
    const state = new App.State({pages, appContext})
    expect(state.currentPage).toBe(Page1)

    appContext.updateUrl('/unknownPage', null, null)
    const updatedState1 = state._withStateForTest({currentUrl: appContext.getUrl()})
    expect(updatedState1.currentPage).toBe(Page1)

    appContext.updateUrl('/Page2', null, null)
    const updatedState2 = state._withStateForTest({currentUrl: appContext.getUrl()})
    expect(updatedState2.currentPage).toBe(Page2)

    const appInterface = testAppInterface('testPath', state)
    const {ShowPage} = state

    ShowPage('Page2')
    expect(state.latest().currentPage).toBe(Page2)

    ShowPage(Page3)
    expect(state.latest().currentPage).toBe(Page3)

    ShowPage('previous')
    expect(state.latest().currentPage).toBe(Page2)
})

test('App.State page, path, query and hash can be updated by ShowPage', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null
    const pages = {Page1, Page2}
    const updateUrlSpy = jest.spyOn(DefaultUrlContext.prototype, 'updateUrl');
    const state = new App.State({pages, appContext})
    expect(state.currentPage).toBe(Page1)
    appContext.updateUrl('/Page2', null, null)
    const updatedState = state._withStateForTest({currentUrl: appContext.getUrl()})
    expect(updatedState.currentPage).toBe(Page2)

    const appInterface = testAppInterface('testPath', state)
    const {ShowPage} = state
    const theDateStr = '2023-10-22T12:34:56.123Z'
    const theDate = new Date(theDateStr)

    ShowPage('Page2', 'tab1', 'sorted', {a: 123, date: theDate}, 'id123')
    expect(state.latest().currentPage).toBe(Page2)

    ShowPage(Page1, valueObj('tab2'), valueObj(null), valueObj('id123'))
    expect(state.latest().currentPage).toBe(Page1)
    expect(updateUrlSpy).toHaveBeenCalledTimes(3)
    expect(updateUrlSpy).toHaveBeenNthCalledWith(2, '/Page2/tab1/sorted', {a: '123', date: theDateStr}, 'id123')
    expect(updateUrlSpy).toHaveBeenNthCalledWith(3, '/Page1/tab2', null, 'id123')
})

test('App.State uses latest default page version if it changes', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page1updated = (_props: any) => null
    const pages = {Page1, Page2}
    const state = new App.State({pages, appContext})
    expect(state.currentPage).toBe(Page1)

    const updatedState = state.updateFrom(new App.State({pages: {Page1: Page1updated, Page2}, appContext}))
    expect(updatedState.currentPage).toBe(Page1updated)
})

test('App.State uses latest set page version if it changes ', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page1updated = (_props: any) => null, Page2updated = (_props: any) => null
    const pages = {Page1, Page2}
    const [appContext] = getRealAppContext('/Page2')
    const state = new App.State({pages, appContext})
    expect(state.currentPage).toBe(Page2)

    const updatedState = state.updateFrom(new App.State({pages: {Page1: Page1updated, Page2: Page2updated}, appContext}))
    expect(updatedState.currentPage).toBe(Page2updated)
})

test('App.State does next level compare on pages', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page3 = (_props: any) => null
    const pages = {Page1, Page2}
    const samePages = {Page1, Page2}
    const newPages = {Page1, Page2, Page3}
    const state = new App.State({pages, appContext})

    expect(state.updateFrom(new App.State({pages: samePages, appContext}))).toBe(state)
    expect(state.updateFrom(new App.State({pages: newPages, appContext}))).not.toBe(state)
})

test('App.State can get current url object', () => {
    const Page1 = (_props: any) => null
    const pages = {Page1}
    const origin = 'http.example.com'
    const pathname = '/someapp/somewhere/Page1/tabA/12345'
    const query = {a: '10', b: 'foo'}
    const hash = '#id123'
    const pathPrefix = 'someapp/somewhere'
    const appContext: UrlContext = {
        getUrl(): any {
            return { location: {origin, pathname, query, hash}, pathPrefix }
        },
        getFullUrl: jest.fn(),
        getResourceUrl(name: string) {
            return 'resource/url/to/' + name
        },
        updateUrl(_path: string, _query: object, _anchor: string): void {},
    }
    const state = new App.State({pages, appContext})._withStateForTest({currentUrl: urlForPage('Page2')})
    expect(state.CurrentUrl()).toStrictEqual(new Url(origin, pathname, pathPrefix, query, hash))
})

test('App.State can get a File Url', () => {
    const Page1 = (_props: any) => null
    const pages = {Page1}
    const appContext: UrlContext = {
        getUrl: jest.fn(),
        updateUrl: jest.fn(),
        getFullUrl: jest.fn(),
        getResourceUrl(resourceName: string) {
            return 'resource/url/to' + ensureSlash(resourceName)
        }
    }
    const state = new App.State({pages, appContext})._withStateForTest({currentUrl: urlForPage('Page2')})
    expect(state.FileUrl('image1.jpg')).toBe('resource/url/to/image1.jpg')
    expect(state.FileUrl(valueObj('image1.jpg'))).toBe('resource/url/to/image1.jpg')
})

test('App.State responds to app context url changes', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page3 = (_props: any) => null
    const pages = {Page1, Page2, Page3}
    const state = new App.State({pages, appContext})
    expect(state.currentPage).toBe(Page1)
    const appInterface = testAppInterface('testPath', state)

    appContext.updateUrl('/Page2', null, null)
    const state1 = state.latest()
    expect(state1).not.toBe(state)
    expect(state1.currentPage).toBe(Page2)

    appContext.updateUrl('/Page2', {a:10}, 'anchor1')
    const state2 = state.latest()
    expect(state2).not.toBe(state1)
    expect(state2.currentPage).toBe(Page2)
    expect(state2.CurrentUrl().query).toStrictEqual({a:10})
    expect(state2.CurrentUrl().anchor).toBe('anchor1')
})

test('App.State responds to browser history changes', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page3 = (_props: any) => null
    const pages = {Page1, Page2, Page3}
    const [appContext] = getRealAppContext('/Page1/abc')
    const state = new App.State({pages, appContext})
    const appInterface = testAppInterface('testPath', state)
    expect(state.CurrentUrl().page).toBe('Page1')
    expect(state.CurrentUrl().pathSections[0]).toBe('abc')

    appContext.updateUrl('/Page1/xyz', null, null)
    const state1 = state.latest()
    expect(state1).not.toBe(state)
    expect(state1.CurrentUrl().page).toBe('Page1')
    expect(state1.CurrentUrl().pathSections[0]).toBe('xyz')

    // history.back()
    const state2 = state.latest()
    expect(state2).not.toBe(state1)
    expect(state2.CurrentUrl().page).toBe('Page1')
    expect(state2.CurrentUrl().pathSections[0]).toBe('abc')
})
