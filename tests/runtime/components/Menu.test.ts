/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {Menu, MenuItem} from '../../../src/runtime/components/index'
import {snapshot} from '../../testutil/testHelpers'
import userEvent from '@testing-library/user-event'
import {testContainer, wait} from '../../testutil/rtlHelpers'

test('Menu element produces output with properties supplied when closed',
    snapshot(createElement(Menu, {
        path: 'app.page1.fileMenu', label: 'File', filled: true, children: [
            createElement(MenuItem, {path: 'app.page1.fileMenu.Open', label: 'Open', action: jest.fn}),
            createElement(MenuItem, {path: 'app.page1.fileMenu.Close', label: 'Close', action: jest.fn()})
        ]
    }))
)

test('Menu element produces output with properties supplied when open', async () => {
        let container = testContainer(createElement(Menu, {
            path: 'app.page1.fileMenu', label: 'File', children: [
                createElement(MenuItem, {path: 'app.page1.fileMenu.Open', label: 'Open', action: jest.fn()}),
                createElement(MenuItem, {path: 'app.page1.fileMenu.Close', label: 'Close', action: jest.fn()})
            ]
        }))
        const buttonEl = container.querySelector('button[id="app.page1.fileMenu_button"]')
        const user = userEvent.setup()
        await user.click(buttonEl)

        expect(document.body.innerHTML).toMatchSnapshot()
    }
)

test('Menu element produces output for single menu item when open', async () => {
    let container = testContainer(createElement(Menu, {
            path: 'app.page1.fileMenu', label: 'File'},
                createElement(MenuItem, {path: 'app.page1.fileMenu.Open', label: 'Open', action: jest.fn()})))
        const buttonEl = container.querySelector('button[id="app.page1.fileMenu_button"]')
        const user = userEvent.setup()
        await user.click(buttonEl)

        expect(document.body.innerHTML).toMatchSnapshot()
    }
)

test('Menu item does action when clicked', async () => {
    const doOpen = jest.fn()
    let container = testContainer(createElement(Menu, {
            path: 'app.page1.fileMenu', label: 'File', children: [
                createElement(MenuItem, {path: 'app.page1.fileMenu.Open', label: 'Open', action: doOpen}),
                createElement(MenuItem, {path: 'app.page1.fileMenu.Close', label: 'Close', action: jest.fn()})
            ]
        }))
    const buttonEl = container.querySelector('button[id="app.page1.fileMenu_button"]')
    const user = userEvent.setup()
    await user.click(buttonEl)

    const openEl = document.querySelector('[id="app.page1.fileMenu.Open"]')
    await user.click(openEl!)

    expect(doOpen).toBeCalled()
})

test.skip('Menu item with no action closes when clicked', async () => {
        let container = testContainer(createElement(Menu, {
            path: 'app.page1.fileMenu', label: 'File', children: [
                createElement(MenuItem, {path: 'app.page1.fileMenu.Open', label: 'Open'}),
                createElement(MenuItem, {path: 'app.page1.fileMenu.Close', label: 'Close'})
            ]
        }))
        const buttonEl = container.querySelector('button[id="app.page1.fileMenu_button"]')
        const user = userEvent.setup()
        await user.click(buttonEl)

        const openEl = document.querySelector('[id="app.page1.fileMenu.Open"]')
        await user.click(openEl!)
        await wait(1500)
        expect(document.querySelector('[id="app.page1.fileMenu.Open"]')).toBeNull()
    }
)

