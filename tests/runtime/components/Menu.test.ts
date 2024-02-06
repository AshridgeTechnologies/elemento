/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {Menu, MenuItem} from '../../../src/runtime/components/index'
import {snapshot, wait} from '../../testutil/testHelpers'
import {testContainer} from '../../testutil/rtlHelpers'

test('Menu element produces output with properties supplied when closed',
    snapshot(createElement(Menu, {
        path: 'app.page1.fileMenu', label: 'File', filled: true, children: [
            createElement(MenuItem, {path: 'app.page1.fileMenu.Open', label: 'Open', action: jest.fn, styles: {color: 'red'} }),
            createElement(MenuItem, {path: 'app.page1.fileMenu.Close', label: 'Close', action: jest.fn(), show: false})
        ]
    }))
)

test('Menu element produces output with properties supplied when open', async () => {
        const {el, user} = testContainer(createElement(Menu, {
            path: 'app.page1.fileMenu', label: 'File', children: [
                createElement(MenuItem, {path: 'app.page1.fileMenu.Open', label: 'Open', action: jest.fn, styles: {color: 'red'} }),
                createElement(MenuItem, {path: 'app.page1.fileMenu.Close', label: 'Close', action: jest.fn(), show: false})
            ]
        }))
        const buttonEl = el`app.page1.fileMenu_button`
        await user.click(buttonEl)
        await wait(10)

        expect(document.body.innerHTML).toMatchSnapshot()
    }
)

test('Menu item does action when clicked', async () => {
    const doOpen = jest.fn()
    const {el, click} = testContainer(createElement(Menu, {
        path: 'app.page1.fileMenu', label: 'File', children: [
            createElement(MenuItem, {path: 'app.page1.fileMenu.Open', label: 'Open', action: doOpen}),
            createElement(MenuItem, {path: 'app.page1.fileMenu.Close', label: 'Close', action: jest.fn()})
        ]
    }))
    const buttonEl = el`app.page1.fileMenu_button`
    await click(buttonEl)

    const openEl = document.querySelector('[id="app.page1.fileMenu.Open"]') as HTMLElement
    await click(openEl!)

    expect(doOpen).toBeCalled()
})

test.skip('Menu item with no action closes when clicked', async () => {
        const {el, click} = testContainer(createElement(Menu, {
            path: 'app.page1.fileMenu', label: 'File', children: [
                createElement(MenuItem, {path: 'app.page1.fileMenu.Open', label: 'Open'}),
                createElement(MenuItem, {path: 'app.page1.fileMenu.Close', label: 'Close'})
            ]
        }))
        const buttonEl = el`app.page1.fileMenu_button`
        click(buttonEl)

        const openEl = el`app.page1.fileMenu.Open`
        click(openEl!)
        await wait(1500)
        expect(document.querySelector('[id="app.page1.fileMenu.Open"]')).toBeNull()
    }
)

