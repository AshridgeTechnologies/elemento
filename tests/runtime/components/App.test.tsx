/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import {componentJSON, testAppInterface, wrappedTestElement} from '../../testutil/testHelpers'
import {App, Collection, Page, TextElement, AppBar} from '../../../src/runtime/components/index'
import {StoreProvider, useObjectState} from '../../../src/runtime/appData'
import * as Elemento from '../../../src/runtime/index'
import {fireEvent} from '@testing-library/react'
import {testContainer, wait} from '../../testutil/rtlHelpers'
import {AppData} from '../../../src/runtime/components/App'
import MockedFunction = jest.MockedFunction

const [appComponent, appStoreHook] = wrappedTestElement(App, AppData)

const stateAt = (path: string) => appStoreHook.stateAt(path)

const text = () => createElement(TextElement, {path: 'app1.page1.para1'}, 'Hello', 'where are you')
const mainPage = () => createElement(Page, {path: 'app1.page1'}, text())

test('App element produces output containing page', () => {
    const component = appComponent('app1', {pages: {mainPage}}, {})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('App element produces output with max width', () => {
    const component = appComponent('app1', {pages: {mainPage}}, {maxWidth: 500})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('App element produces output containing page and additional components with app bar at the top', () => {
    const collection1 = createElement(Collection, {path: 'app1.coll1', display: true})
    const collection2 = createElement(Collection, {path: 'app1.coll2', display: true})
    const appBar1 = createElement(AppBar, {path: 'app1.appBar1', title: 'The App bar'})

    const app = () => {
        useObjectState('app1', new App.State({pages: {mainPage}}))
        useObjectState('app1.coll1', new Collection.State({}))
        useObjectState('app1.coll2', new Collection.State({}))
        return createElement(App, {path: 'app1', topChildren: appBar1}, collection1, collection2)
    }
    const runningApp = createElement(StoreProvider, {children: createElement(app)})
    expect(componentJSON(runningApp)).toMatchSnapshot()
})

test('App shows first page initially and other page when state changes', async () => {
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
        useObjectState('app1', new App.State({pages: {MainPage, OtherPage}}))
        return createElement(App, {path: 'app1'})
    }

    const appElement = createElement(app, {path: 'app1', })

    const container = testContainer(createElement(StoreProvider, {children: appElement})) as HTMLElement
    await wait(20)

    expect(container.querySelector('p[id="app1.page1.para1"]')?.textContent).toBe('this is page Main')

    fireEvent.click(container.querySelector('button') as HTMLElement)
    await wait(20)

    expect(container.querySelector('p[id="app1.page1.para1"]')?.textContent).toBe('this is page Other')
})

test('App.State gets current page and can be updated by ShowPage, not called as an object method, with either name of functions', () => {
    const Page1 = (props: any) => null, Page2 = (props: any) => null
    const pages = {Page1, Page2}
    const state = new App.State({pages})
    expect(state.currentPage).toBe(Page1)
    const updatedState = state._withStateForTest({currentPage: Page2})
    expect(updatedState.currentPage).toBe(Page2)

    const appInterface = testAppInterface(state); state.init(appInterface)
    const {ShowPage} = state

    ShowPage('Page2')
    const newVersion1 = (appInterface.updateVersion as MockedFunction<any>).mock.calls[0][0]
    expect(newVersion1.currentPage).toBe(Page2)

    ShowPage(Page2)
    const newVersion2 = (appInterface.updateVersion as MockedFunction<any>).mock.calls[0][0]
    expect(newVersion2.currentPage).toBe(Page2)
})

test('App.State does next level compare on pages', () => {
    const Page1 = (props: any) => null, Page2 = (props: any) => null, Page3 = (props: any) => null
    const pages = {Page1, Page2}
    const samePages = {Page1, Page2}
    const newPages = {Page1, Page2, Page3}
    const state = new App.State({pages})

    expect(state.updateFrom(new App.State({pages: samePages}))).toBe(state)
    expect(state.updateFrom(new App.State({pages: newPages}))).not.toBe(state)
})
