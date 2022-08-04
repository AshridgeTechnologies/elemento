/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {Icon} from '../../../src/runtime/components/index'
import {componentJSON, snapshot, valueObj} from '../../testutil/testHelpers'
import userEvent from '@testing-library/user-event'
import {testContainer, wait} from '../../testutil/rtlHelpers'

const doIt = () => {}

test('Icon element produces button output with properties supplied',
    snapshot(createElement(Icon, {path: 'app.page1.save', iconName: 'star', label: 'Star it', action: () => {doIt()}}))
)

test('Icon element produces empty output with display false',
    snapshot(createElement(Icon, {path: 'app.page1.save', iconName: 'star', action: () => {doIt()}, display: false}))
)

test('Icon element produces icon output with properties supplied',
    snapshot(createElement(Icon, {path: 'app.page1.save', iconName: 'star', label: 'Star it'}))
)

test('Icon element produces empty  output with display false',
    snapshot(createElement(Icon, {path: 'app.page1.save', iconName: 'star', action: () => {doIt()}, display: false}))
)

test('Icon element produces output with properties supplied as state values', async () => {
        const element = createElement(Icon, {path: 'app.page1.save', iconName: valueObj('star'), action: () => {doIt()}, display: valueObj(true)})
        await wait(10)
        expect(componentJSON(element)).toMatchSnapshot()
    }
)

test('Icon element produces output with default values where properties omitted', async () => {
        const element = createElement(Icon, {path: 'app.page1.save', iconName: 'star'})
        await wait(10)
        expect(componentJSON(element)).toMatchSnapshot()
    }
)

test('Icon does action when clicked', async () => {
    const action = jest.fn()
    let container = testContainer(createElement(Icon, {path: 'app.page1.save', iconName: 'star', action}, ))
    const iconEl = container.querySelector('button[id="app.page1.save"]')
    const user = userEvent.setup()
    await user.click(iconEl)
    expect(action).toBeCalled()
} )

