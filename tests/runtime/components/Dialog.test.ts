/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {Dialog, TextElement} from '../../../src/runtime/components'
import {wrappedTestElement} from '../../testutil/testHelpers'
import {DialogState} from '../../../src/runtime/components/Dialog'
import {actWait} from '../../testutil/rtlHelpers'
import {fireEvent, render, within} from '@testing-library/react'
import '@testing-library/jest-dom'

const [dialog, appStoreHook] = wrappedTestElement(Dialog, DialogState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

const text1 = createElement(TextElement, {path: 'app.page1.things.text1', styles: {width: 200, top: 20, left: 30}, content: 'First text'} )
const text2 = createElement(TextElement, {path: 'app.page1.things.text2', styles: {width: 300, bottom: 10, right: 34}, content: 'Second text'} )

test('Dialog element shows dialog when initially closed', () => {
    const element = dialog('app.page1.confirmIt', {}, {styles: {color: 'red'}}, text1, text2)
    const { baseElement } = render(element)
    expect(baseElement).toMatchSnapshot();
})

test('Dialog element shows dialog when initially open',() => {
    const element = dialog('app.page1.confirmIt', {initiallyOpen: true}, {layout: 'vertical', styles: {color: 'red'}}, text1)
    const { baseElement } = render(element)
    expect(baseElement).toMatchSnapshot()
})

test('Dialog can be closed and opened via state object', async () => {
    let queryByText: any
    const element = dialog('app.page1.confirmIt', {}, {}, text1)
    await actWait( () => ({queryByText} = render(element)))
    await actWait( () => appStoreHook.setStateAt('app.page1.confirmIt', new DialogState({})))

    expect(queryByText('First text')).toBe(null)
    expect(stateAt('app.page1.confirmIt').isOpen).toBe(false)

    await actWait( () => stateAt('app.page1.confirmIt').Show() )
    expect(queryByText('First text')).not.toBe(null)
    expect(stateAt('app.page1.confirmIt').isOpen).toBe(true)

    await actWait( () => stateAt('app.page1.confirmIt').Close() )
    expect(queryByText('First text')).not.toBeVisible()
    expect(stateAt('app.page1.confirmIt').isOpen).toBe(false)
})

test('Dialog can be closed by close button', async () => {
    let queryByText: any, getByTestId: any
    const element = dialog('app.page1.confirmIt', {initiallyOpen: true}, {showCloseButton: true}, text1)
    await actWait( () => ({queryByText, getByTestId} = render(element)))

    expect(queryByText('First text')).not.toBe(null)

    await actWait( () => fireEvent.click(getByTestId('dialog_close_button')))
    expect(queryByText('First text')).not.toBeVisible()
    expect(stateAt('app.page1.confirmIt').isOpen).toBe(false)
})
