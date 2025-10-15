/**
 * @vitest-environment jsdom
 */

import {beforeEach, expect, test, vi} from "vitest"
import React, {createElement} from 'react'
import {componentJSON, mockReturn, testAppInterface as testAppInterface, valueObj, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {App, AppBar, Collection, Page, TextElement} from '../../../src/runtime/components/index'
import {use$state} from '../../../src/runtime/state/appStateHooks'
import {actWait, testContainer} from '../../testutil/rtlHelpers'

import UrlContext, {DefaultUrlContext, UrlType} from '../../../src/runtime/UrlContext'
import Url from '../../../src/runtime/Url'
import * as authentication from '../../../src/runtime/components/authentication'
import {addNotification} from '../../../src/runtime/components/notifications'
import {ensureSlash} from '../../../src/runtime/runtimeFunctions'
import renderer from 'react-test-renderer'

import {StoreProvider} from '../../../src/runtime/state/StoreContext'
import AppStateStore from '../../../src/runtime/state/AppStateStore'
import {AppData} from '../../../src/runtime/components/AppData'

vi.mock('../../../src/runtime/components/authentication')

const [appComponent] = wrappedTestElement(App)

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

let urlContext: UrlContext

function getRealUrlcontext(initialPath = '/TheApp'): UrlContext {
    const context = new DefaultUrlContext(null, undefined)
    context.updateUrl(initialPath, null, null)
    return context

}

beforeEach(() => {
    urlContext = getRealUrlcontext()
    mockReturn(authentication.isSignedIn, false)
})

test('App element produces output containing page', () => {
    const component = appComponent('app1', {pages: {mainPage}, urlContext})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('App element produces output with max width', () => {
    const component = appComponent('app1', {pages: {mainPage}, urlContext, maxWidth: 500})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('App element inserts favicon link', () => {
    const faviconUrl = 'https://example.com/favicon.svg'
    const component = appComponent('app1', {pages: {mainPage}, urlContext, faviconUrl})
    renderer.create(component)
    const linkHref = (window.document.head.querySelector('link[rel=icon]') as any).href
    expect(linkHref).toBe(faviconUrl)
})

test('App element produces output containing page and additional components with app bar at the top', async () => {
    const collection1 = createElement(Collection, {path: 'app1.coll1', display: true})
    const collection2 = createElement(Collection, {path: 'app1.coll2', display: true})
    const appBar1 = createElement(AppBar, {path: 'app1.appBar1', title: 'The App bar'})

    const app = () => {
        return createElement(App, {path: 'app1', pages: {mainPage}, urlContext, topChildren: appBar1}, collection1, collection2)
    }
    const runningApp = createElement(StoreProvider, {children: createElement(app)})
    await wait(100)
    expect(componentJSON(runningApp)).toMatchSnapshot()
    await wait(100)
})

test('App element shows notifications', async () => {
    const app = () => {
        return createElement(App, {path: 'app1', pages: {mainPage}, urlContext})
    }
    const {el} = testContainer(createElement(StoreProvider, null, createElement(app, {path: 'app1',})))

    addNotification('success', 'Something happened')
    await wait()
    expect(el`.notistack-Snackbar`).toContainHTML('Something happened')
})

test('App element produces output containing not logged in page if it exists and not logged in', () => {
    const appBar1 = createElement(AppBar, {path: 'app1.appBar1', title: 'The App bar'})

    const app = () => {
        return createElement(App, {path: 'app1', pages: {loggedInOnlyPage, notLoggedInPage, mainPage}, urlContext, topChildren: appBar1})
    }
    const runningApp = createElement(StoreProvider, {children: createElement(app)})
    expect(JSON.stringify(componentJSON(runningApp))).toContain('Please log in')
    expect(componentJSON(runningApp)).toMatchSnapshot()
})

test('App element produces output containing normal page if logged in', () => {
    mockReturn(authentication.isSignedIn, true)
    const appBar1 = createElement(AppBar, {path: 'app1.appBar1', title: 'The App bar'})

    const app = () => {
        return createElement(App, {path: 'app1', pages: {loggedInOnlyPage, notLoggedInPage, mainPage}, urlContext, topChildren: appBar1})
    }
    const runningApp = createElement(StoreProvider, {children: createElement(app)})
    expect(JSON.stringify(componentJSON(runningApp))).toContain('You are logged in')
    expect(componentJSON(runningApp)).toMatchSnapshot()
})

test('App shows first page initially and other page when state changes and only runs startup action once and does not return anything from the startup action', async () => {
    let startupCount = 0
    const urlContext = getRealUrlcontext()
    const text = (pageName: string) => createElement(TextElement, {path: 'app1.page1.para1', content: 'this is page ' + pageName} )

    function MainPage(props: any) {
        const appState = use$state('app1')
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
        return createElement(App, {path: 'app1', pages: {MainPage, OtherPage}, urlContext, startupAction: () => {
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
    const component = appComponent('app1', {pages: {mainPage}, urlContext, cookieMessage: 'We love cookies'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('App element receives messages sent to window', async () => {
    const messageAction = vi.fn()
    const app = () => {
        return createElement(App, {path: 'app1', pages: {mainPage}, urlContext, messageAction})
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
    const state = new App.State({Page1}, urlContext)

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
    const state = new App.State({pages, urlContext})
    expect(state.currentPage).toBe(Page1)

    urlContext.updateUrl('/unknownPage', null, null)
    const updatedState1 = state._withStateForTest({currentUrl: urlContext.getUrl()})
    expect(updatedState1.currentPage).toBe(Page1)

    urlContext.updateUrl('/TheApp/Page2', null, null)
    const updatedState2 = state._withStateForTest({currentUrl: urlContext.getUrl()})
    expect(updatedState2.currentPage).toBe(Page2)

    const appInterface = testAppInterface('testPath', state)
    const {ShowPage} = state

    ShowPage('Page2')
    expect(state.latest().currentPage).toBe(Page2)

    ShowPage(Page3)
    expect(state.latest().currentPage).toBe(Page3)

    // doesn't work in jsdom
    // ShowPage('previous')
    // expect(state.latest().currentPage).toBe(Page2)
})

test('App.State page, path, query and hash can be updated by ShowPage', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null
    const pages = {Page1, Page2}
    const updateUrlSpy = vi.spyOn(DefaultUrlContext.prototype, 'updateUrl');
    const state = new App.State({pages, urlContext})
    expect(state.currentPage).toBe(Page1)
    urlContext.updateUrl('/TheApp/Page2', null, null)
    const updatedState = state._withStateForTest({currentUrl: urlContext.getUrl()})
    expect(updatedState.currentPage).toBe(Page2)

    const appInterface = testAppInterface('testPath', state)
    const {ShowPage} = state
    const theDateStr = '2023-10-22T12:34:56.123Z'
    const theDate = new Date(theDateStr)

    ShowPage('Page2', 'tab1', 'sorted', 99, {a: 123, date: theDate}, 'id123')
    expect(state.latest().currentPage).toBe(Page2)

    ShowPage(Page1, valueObj('tab2'), valueObj(null), valueObj('id123'))
    expect(state.latest().currentPage).toBe(Page1)
    expect(updateUrlSpy).toHaveBeenCalledTimes(3)
    expect(updateUrlSpy).toHaveBeenNthCalledWith(2, '/testPath/Page2/tab1/sorted/99', {a: '123', date: theDateStr}, 'id123')
    expect(updateUrlSpy).toHaveBeenNthCalledWith(3, '/testPath/Page1/tab2', null, 'id123')
})

test('App.State uses latest default page version if it changes', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page1updated = (_props: any) => null
    const pages = {Page1, Page2}
    const state = new App.State({pages, urlContext})
    expect(state.currentPage).toBe(Page1)

    const updatedState = state.withProps({pages: {Page1: Page1updated, Page2}, urlContext})
    expect(updatedState.currentPage).toBe(Page1updated)
})

test('App.State uses latest set page version if it changes ', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page1updated = (_props: any) => null, Page2updated = (_props: any) => null
    const pages = {Page1, Page2}
    const urlContext = getRealUrlcontext('/TheApp/Page2')
    const state = new App.State({pages, urlContext})
    expect(state.currentPage).toBe(Page2)

    const updatedState = state.withProps({pages: {Page1: Page1updated, Page2: Page2updated}, urlContext})
    expect(updatedState.currentPage).toBe(Page2updated)
})

test('App.State does next level compare on pages', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page3 = (_props: any) => null
    const pages = {Page1, Page2}
    const samePages = {Page1, Page2}
    const newPages = {Page1, Page2, Page3}

    const store = new AppStateStore()
    const state = store.getOrCreate('id1', AppData, {pages: pages, urlContext, themeOptions: {}})
    expect(store.getOrCreate('id1', AppData, {pages: samePages, urlContext, themeOptions: {}})).toBe(state)
    expect(store.getOrCreate('id1', AppData, {pages: newPages, urlContext, themeOptions: {}})).not.toBe(state)
})

test('App.State can get current url object', () => {
    const Page1 = (_props: any) => null
    const pages = {Page1}
    const origin = 'http.example.com'
    const pathname = '/someapp/somewhere/Page1/tabA/12345'
    const query = {a: '10', b: 'foo'}
    const hash = '#id123'
    const pathPrefix = 'someapp/somewhere'
    const urlContext: UrlContext = {
        getUrl(): any {
            return { location: {origin, pathname, query, hash}, pathPrefix }
        },
        getFullUrl: vi.fn(),
        getResourceUrl(name: string) {
            return 'resource/url/to/' + name
        },
        updateUrl(_path: string, _query: object, _anchor: string): void {},
    }
    const state = new App.State({pages, urlContext})._withStateForTest({currentUrl: urlForPage('Page2')})
    expect(state.CurrentUrl()).toStrictEqual(new Url(origin, pathname, pathPrefix, query, hash))
})

test('App.State can get a File Url', () => {
    const Page1 = (_props: any) => null
    const pages = {Page1}
    const urlContext: UrlContext = {
        getUrl: vi.fn(),
        updateUrl: vi.fn(),
        getFullUrl: vi.fn(),
        getResourceUrl(resourceName: string) {
            return 'resource/url/to' + ensureSlash(resourceName)
        }
    }
    const state = new App.State({pages, urlContext})._withStateForTest({currentUrl: urlForPage('Page2')})
    expect(state.FileUrl('image1.jpg')).toBe('resource/url/to/image1.jpg')
    expect(state.FileUrl(valueObj('image1.jpg'))).toBe('resource/url/to/image1.jpg')
})

test('App.State responds to app context url changes', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page3 = (_props: any) => null
    const pages = {Page1, Page2, Page3}
    const state = new App.State({pages, urlContext})
    expect(state.currentPage).toBe(Page1)
    const appInterface = testAppInterface('testPath', state)

    urlContext.updateUrl('/TheApp/Page2', null, null)
    const state1 = state.latest()
    expect(state1).not.toBe(state)
    expect(state1.currentPage).toBe(Page2)

    urlContext.updateUrl('/TheApp/Page2', {a:10}, 'anchor1')
    const state2 = state.latest()
    expect(state2).not.toBe(state1)
    expect(state2.currentPage).toBe(Page2)
    expect(state2.CurrentUrl().query).toStrictEqual({a:10})
    expect(state2.CurrentUrl().anchor).toBe('anchor1')
})

test.skip('App.State responds to browser history changes', () => {
    const Page1 = (_props: any) => null, Page2 = (_props: any) => null, Page3 = (_props: any) => null
    const pages = {Page1, Page2, Page3}
    const urlContext = getRealUrlcontext('/testPath/Page1/abc')
    const state = new App.State({pages, urlContext})
    const appInterface = testAppInterface('testPath', state)
    expect(state.CurrentUrl().page).toBe('Page1')
    expect(state.CurrentUrl().pathSections[0]).toBe('abc')

    urlContext.updateUrl('/TheApp/Page1/xyz', null, null)
    const state1 = state.latest()
    expect(state1).not.toBe(state)
    expect(state1.CurrentUrl().page).toBe('Page1')
    expect(state1.CurrentUrl().pathSections[0]).toBe('xyz')

    history.back()
    const state2 = state.latest()
    expect(state2).not.toBe(state1)
    expect(state2.CurrentUrl().page).toBe('Page1')
    expect(state2.CurrentUrl().pathSections[0]).toBe('abc')
})
