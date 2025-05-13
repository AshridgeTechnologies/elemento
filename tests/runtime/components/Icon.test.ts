import {expect, test, vi} from "vitest"
/**
 * @vitest-environment jsdom
 */
import {createElement} from 'react'
import {Icon} from '../../../src/runtime/components/index'
import {componentJSON, snapshot, valueObj, wait} from '../../testutil/testHelpers'
import {testContainer} from '../../testutil/rtlHelpers'

const doIt = () => {}

test('Icon element produces button output with properties supplied',
    snapshot(createElement(Icon, {path: 'app.page1.save', iconName: 'star', label: 'Star it', styles: {color: 'red'}, action: () => {doIt()}}))
)

test('Icon element produces empty output with display false',
    snapshot(createElement(Icon, {path: 'app.page1.save', iconName: 'star', action: () => {doIt()}, show: false}))
)

test('Icon element produces icon output with properties supplied',
    snapshot(createElement(Icon, {path: 'app.page1.save', iconName: 'star', label: 'Star it', styles: {color: 'blue'}}))
)

test('Icon element produces empty  output with display false',
    snapshot(createElement(Icon, {path: 'app.page1.save', iconName: 'star', action: () => {doIt()}, show: false}))
)

test('Icon element produces output with properties supplied as state values', async () => {
        const element = createElement(Icon, {path: 'app.page1.save', iconName: valueObj('star'), action: () => {doIt()}, show: valueObj(true)})
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
    const action = vi.fn()
    const {el, user} = testContainer(createElement(Icon, {path: 'app.page1.save', iconName: 'star', action},))
    const iconEl = el`app.page1.save`
    await user.click(iconEl)
    expect(action).toBeCalled()
} )
