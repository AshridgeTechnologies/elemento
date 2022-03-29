/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import {componentJSON} from '../../testutil/testHelpers'
import {App, Page, TextElement} from '../../../src/runtime/components/index'
import {StoreProvider} from '../../../src/runtime/appData'
import * as Elemento from '../../../src/runtime/index'
import {fireEvent} from '@testing-library/react'
import {testContainer} from '../../testutil/rtlHelpers'

test('App element produces output containing page', () => {
    const text = () => createElement(TextElement, {path: 'app1.page1.para1'}, 'Hello', 'where are you')
    const mainPage = () => createElement(Page, {path: 'app1.page1'}, text())
    const app = createElement(App, {id: 'app1', pages: {mainPage}})
    const runningApp = createElement(StoreProvider, {children: app})
    expect(componentJSON(runningApp)).toMatchSnapshot()
})

test('App shows first page initially and other page when state changes', () => {
    const text = (pageName: string) => createElement(TextElement, {path: 'app1.page1.para1'}, 'this is page ' + pageName)
    function MainPage(props: {path: string}) {
        const state = Elemento.useObjectStateWithDefaults('app1', {})
        // @ts-ignore
        return React.createElement(Page, {id: props.path},
            text('Main'),
            React.createElement('button', {onClick: () => {
                    state._update({_data: {currentPage: 'OtherPage'}})
                }}),
        )
    }

    const OtherPage = () => createElement(Page, {path: 'app1.page2'}, text('Other'), 'Page 2')
    const app = createElement(App, {id: 'app1', pages: {MainPage, OtherPage}})

    const container = testContainer(createElement(StoreProvider, {children: app})) as HTMLElement
    expect(container.querySelector('p[id="app1.page1.para1"]')?.textContent).toBe('this is page Main')

    fireEvent.click(container.querySelector('button') as HTMLElement)
    expect(container.querySelector('p[id="app1.page1.para1"]')?.textContent).toBe('this is page Other')

})
