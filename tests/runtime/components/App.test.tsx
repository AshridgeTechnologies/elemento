/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import {componentJSON, testAppInterface} from '../../testutil/testHelpers'
import {App, Collection, Page, TextElement, AppBar} from '../../../src/runtime/components/index'
import {StoreProvider, useObjectState} from '../../../src/runtime/appData'
import * as Elemento from '../../../src/runtime/index'
import {fireEvent} from '@testing-library/react'
import {testContainer, wait} from '../../testutil/rtlHelpers'
import {AppData} from '../../../src/runtime/components/App'

test('App element produces output containing page', () => {
    const text = () => createElement(TextElement, {path: 'app1.page1.para1'}, 'Hello', 'where are you')
    const mainPage = () => createElement(Page, {path: 'app1.page1'}, text())
    const app = createElement(App, {id: 'app1', pages: {mainPage}})
    const runningApp = createElement(StoreProvider, {children: app})
    expect(componentJSON(runningApp)).toMatchSnapshot()
})

test('App element produces output with max width', () => {
    const text = () => createElement(TextElement, {path: 'app1.page1.para1'}, 'Hello', 'where are you')
    const mainPage = () => createElement(Page, {path: 'app1.page1'}, text())
    const app = createElement(App, {id: 'app1', maxWidth: 500, pages: {mainPage}})
    const runningApp = createElement(StoreProvider, {children: app})
    expect(componentJSON(runningApp)).toMatchSnapshot()
})

test('App element produces output containing page and additional components with app bar at the top', () => {
    const text = () => createElement(TextElement, {path: 'app1.page1.para1'}, 'Hello', 'where are you')
    const mainPage = () => createElement(Page, {path: 'app1.page1'}, text())
    const collection1 = createElement(Collection, {path: 'app1.coll1', display: true})
    const collection2 = createElement(Collection, {path: 'app1.coll2', display: true})
    const appBar1 = createElement(AppBar, {path: 'app1.appBar1', title: 'The App bar'})

    const app = () => {
        useObjectState('app1.coll1', new Collection.State({}))
        useObjectState('app1.coll2', new Collection.State({}))
        return createElement(App, {id: 'app1', pages: {mainPage}, topChildren: appBar1}, collection1, collection2)
    }
    const runningApp = createElement(StoreProvider, {children: createElement(app)})
    expect(componentJSON(runningApp)).toMatchSnapshot()
})

test('App shows first page initially and other page when state changes', async () => {
    const text = (pageName: string) => createElement(TextElement, {path: 'app1.page1.para1'}, 'this is page ' + pageName)

    function MainPage(props: { path: string }) {
        const state = Elemento.useGetObjectState<AppData>('app1._data')
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
    const app = createElement(App, {id: 'app1', pages: {MainPage, OtherPage}})

    const container = testContainer(createElement(StoreProvider, {children: app})) as HTMLElement
    await wait(20)

    expect(container.querySelector('p[id="app1.page1.para1"]')?.textContent).toBe('this is page Main')

    fireEvent.click(container.querySelector('button') as HTMLElement)
    await wait(20)

    expect(container.querySelector('p[id="app1.page1.para1"]')?.textContent).toBe('this is page Other')

})

test('App.State has correct props and functions', () => {
    const state = new App.State({currentPage: 'Page1'})
    expect(state.currentPage).toBe('Page1')
    const updatedState = state._withStateForTest({currentPage: 'Page2'})
    expect(updatedState.currentPage).toBe('Page2')

    const appInterface = testAppInterface(state); state.init(appInterface)
    state.ShowPage('Page3')
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({currentPage: 'Page3'}))

})
