/**
 * @vitest-environment jsdom
 */
import {expect, test, vi} from 'vitest'
import {createElement} from 'react'
import {ScreenKeyboard} from '../../../src/runtime/components/index'
import {valueObj, wrappedTestElementNew} from '../../testutil/testHelpers'
import {globalFunctions} from '../../../src/runtime/globalFunctions'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {render} from '@testing-library/react'

const {Log} = globalFunctions

const doIt = () => {}

const [screenKeyboard, appStoreHook] = wrappedTestElementNew(ScreenKeyboard)

const stateAt = (path: string) => appStoreHook.stateAt(path)

let container: any

test('ScreenKeyboard element produces output with properties supplied', async () => {
    await actWait( () => ({container} = render(screenKeyboard('app.page1.keyboard', {}))))
    expect(container.innerHTML).toMatchSnapshot()
})

test('ScreenKeyboard element produces output with styles supplied', async () => {
    await actWait(() => ({container} = render(screenKeyboard('app.page1.keyboard', {styles: {width: 300}}))))
    expect(container.innerHTML).toMatchSnapshot()
})

test('ScreenKeyboard element produces output with show false', async () => {
    await actWait(() => ({container} = render(screenKeyboard('app.page1.keyboard', {show: false}))))
    expect(container.innerHTML).toMatchSnapshot()
})

test('ScreenKeyboard element produces output with properties supplied as state values', async () => {
    await actWait(() => ({container} = render(screenKeyboard('app.page1.keyboard', {styles: {width: valueObj(300)}}))))
    expect(container.innerHTML).toMatchSnapshot()
})

test('ScreenKeyboard does key action when clicked and translates keys', async () => {
    let {element, user} = testContainer(screenKeyboard('app.page1.keyboard', {keyAction: ($key: string) => Log("Pressed", $key)}))
    const keyEl = (key: string) => element(`div[data-skbtn="${key}"]`)
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    try {
        await user.click(keyEl('g'))
        expect(log).toHaveBeenLastCalledWith("Pressed", 'g')
        await user.click(keyEl('{ent}'))
        expect(log).toHaveBeenLastCalledWith("Pressed", 'Enter')
        await user.click(keyEl('{backspace}'))
        expect(log).toHaveBeenLastCalledWith("Pressed", 'Backspace')
    } finally {
        log.mockReset();
    }
} )

test('ScreenKeyboard stores value from clicked keys and can Reset', async () => {
    let {element, user} = testContainer(screenKeyboard('app.page1.keyboard', {}))
    const keyEl = (key: string) => element(`div[data-skbtn="${key}"]`)
    await user.click(keyEl('a'))
    await user.click(keyEl('b'))
    await user.click(keyEl('c'))
    expect(stateAt('app.page1.keyboard').value).toBe('abc')
    await user.click(keyEl('{backspace}'))
    expect(stateAt('app.page1.keyboard').value).toBe('ab')

    await actWait( ()=> stateAt('app.page1.keyboard').Reset() )
    expect(stateAt('app.page1.keyboard').value).toBe('')
} )

test('ScreenKeyboard uses real keyboard', async () => {
    let {element, user} = testContainer(
        createElement('div', {className: 'ElPage', tabIndex: 0}, screenKeyboard('app.page1.keyboard', {useRealKeyboard: true}))
    )
    const pageEl = element(`div.ElPage`)
    pageEl.focus()
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    try {
        await user.keyboard('a')
        await user.keyboard('b')
        expect(stateAt('app.page1.keyboard').value).toBe('ab')
        await user.keyboard('{Enter}')
        expect(stateAt('app.page1.keyboard').value).toBe('ab')
        await user.keyboard('{Backspace}')
        expect(stateAt('app.page1.keyboard').value).toBe('a')
    } finally {
        log.mockReset();
    }
} )

