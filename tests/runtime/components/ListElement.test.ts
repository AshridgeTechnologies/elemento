/**
 * @jest-environment jsdom
 */

import {createElement, Fragment} from 'react'
import {ListElement, TextElement} from '../../../src/runtime/components/index'
import {snapshot, testAppInterface, wrappedTestElement} from '../../testutil/testHelpers'
import {testContainer} from '../../testutil/rtlHelpers'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import {ListElementState} from '../../../src/runtime/components/ListElement'
import {highlightClassName, highlightElement} from '../../../src/runtime/runtimeFunctions'

function ListItem1(props: {path: string, $item: {text: string}}) {
    return createElement(Fragment, null, createElement(TextElement, {path: `${props.path}.Text99`}, props.$item.text) )
}

const listData = [{id: 'id1', text: 'where are you?'}, {id: 'id2', text: 'over here!'}]
const listDataNoIds = [{Label: 'No 1', text: 'where are you?'}, {Label: 'No 2', text: 'over here!'}]

const [listElement, appStoreHook] = wrappedTestElement(ListElement, ListElementState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('ListElement produces output containing ReactElement children', () => {
    snapshot(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData, style: 'color: red', width: 200}))()
})

test('ListElement produces output with indexes if items have no ids', () => {
    snapshot(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listDataNoIds, style: 'color: red', width: 200}))()
})

test('ListElement produces output containing ReactElement children', () => {
    snapshot(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData, style: 'color: red', width: 200}))()
})

test('ListElement shows selectedItem as selected', () => {
    snapshot(listElement('app.page1.list1', {selectedItem: listData[1]}, {itemContentComponent: ListItem1, items: listData}))()
})

test('ListElement updates its selectedItem in the app state', async () => {
    let container = testContainer(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData}))
    const listItem0El = container.querySelector('[id="app.page1.list1.#id1.Text99"]')
    const user = userEvent.setup()
    await user.click(listItem0El)
    expect(stateAt('app.page1.list1').selectedItem).toBe(listData[0])
})

test('Can highlight all matching elements in a list', async () => {
    let container = testContainer(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData}))
    highlightElement('app.page1.list1.Text99')

    const listItem0El = container.querySelector('[id="app.page1.list1.#id1.Text99"]')
    const listItem1El = container.querySelector('[id="app.page1.list1.#id2.Text99"]')
    expect(listItem0El).toHaveClass(highlightClassName)
    expect(listItem1El).toHaveClass(highlightClassName)
})

test('State class has correct properties', () => {
    const item1 = {a: 1}, item2 = {a: 2}
    const state = new ListElement.State({selectedItem: item1})
    const appInterface = testAppInterface(); state.init(appInterface)
    expect(state.selectedItem).toBe(item1)
    expect(state._withStateForTest({selectedItem: item2}).selectedItem).toBe(item2)

    state.Reset()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({selectedItem: undefined}))

    state.Set(item2)
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({selectedItem: item2}))
})
