/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {Button} from '../../../src/runtime/components/index'
import {componentJSON, snapshot, valueObj, wait} from '../../testutil/testHelpers'
import userEvent from '@testing-library/user-event'
import {globalFunctions} from '../../../src/runtime/globalFunctions'
import {testContainer} from '../../testutil/rtlHelpers'

const {Log} = globalFunctions

const doIt = () => {}

test('Button element produces output with properties supplied',
    snapshot(createElement(Button, {path: 'app.page1.save', content: 'Click me!', appearance: 'outline', action: () => {doIt()}}))
)

test('Button element produces output with styles supplied',
    snapshot(createElement(Button, {path: 'app.page1.save', content: 'Click me!', appearance: 'outline', styles: {width: 300}, action: () => {doIt()}}))
)

test('Button element produces output with icon',
    snapshot(createElement(Button, {path: 'app.page1.save', content: 'Send', iconName: 'send', appearance: 'outline', action: () => {doIt()}}))
)

test('Button element produces output with link style',
    snapshot(createElement(Button, {path: 'app.page1.save', content: 'Click me!', appearance: 'link', action: () => {doIt()}}))
)

test('Button element produces output with link style and styles',
    snapshot(createElement(Button, {path: 'app.page1.save', content: 'Click me!', appearance: 'link', styles: {fontFamily: 'serif'}, action: () => {doIt()}}))
)

test('Button element produces output with show true',
    snapshot(createElement(Button, {path: 'app.page1.save', content: 'Click me!', appearance: 'filled', action: () => {doIt()}, show: true}))
)
test('Button element produces output with show false',
    snapshot(createElement(Button, {path: 'app.page1.save', content: 'Click me!', action: () => {doIt()}, show: false}))
)

test('Button element produces output with enabled true',
    snapshot(createElement(Button, {path: 'app.page1.save', content: 'Click me!', appearance: 'filled', action: () => {doIt()}}))
)
test('Button element produces output with enabled false',
    snapshot(createElement(Button, {path: 'app.page1.save', content: 'Click me!', action: () => {doIt()}, enabled: false}))
)

test('Button element produces output with properties supplied as state values', async () => {
        const element = createElement(Button, {path: 'app.page1.save', content: valueObj('Click me!'), action: () => {doIt()}, show: valueObj(false)})
        await wait(10)
        expect(componentJSON(element)).toMatchSnapshot()
    }
)

test('Button element produces output with default values where properties omitted', async () => {
        const element = createElement(Button, {path: 'app.page1.save', content: 'Click me!'})
        await wait(10)
        expect(componentJSON(element)).toMatchSnapshot()
    }
)

test('Button does action when clicked', async () => {
    let {el, user} = testContainer(createElement(Button, {
        path: 'app.page1.save',
        content: 'Save me!',
        action: () => Log("I'm saved!")
    },))
    const buttonEl = el`button[id="app.page1.save"]`
    const log = jest.spyOn(console, "log").mockImplementation(() => {})
    try {
        await user.click(buttonEl)
        expect(log).toBeCalledWith("I'm saved!")

    } finally {
        log.mockReset();
    }
} )

