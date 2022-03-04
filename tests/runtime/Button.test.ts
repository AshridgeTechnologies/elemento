/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import Button from '../../src/runtime/Button'
import {componentJSON, snapshot, stateVal, testContainer, wait} from '../testutil/testHelpers'
import userEvent from '@testing-library/user-event'
import {globalFunctions} from '../../src/runtime/globalFunctions'

const {Log} = globalFunctions

const doIt = () => {}

test('Button element produces output with properties supplied',
    snapshot(createElement(Button, {path: 'app.page1.save', content: 'Click me!', action: () => {doIt()}}))
)

test('Button element produces output with properties supplied as state values', async () => {
        const element = createElement(Button, {path: 'app.page1.save', content: stateVal('Click me!'), action: () => {doIt()}})
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
    let container = testContainer(createElement(Button, {path: 'app.page1.save', content: 'Save me!', action: () => Log("I'm saved!")}, ))
    const buttonEl = container.querySelector('button[id="app.page1.save"]')
    const user = userEvent.setup()
    const log = jest.spyOn(console, "log").mockImplementation(() => {})
    try {
        await user.click(buttonEl)
        expect(log).toBeCalledWith("I'm saved!")

    } finally {
        log.mockReset();
    }
} )

