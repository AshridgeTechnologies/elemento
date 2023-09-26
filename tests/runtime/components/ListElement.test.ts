/**
 * @jest-environment jsdom
 */

import {createElement, Fragment} from 'react'
import {ListElement, TextElement} from '../../../src/runtime/components/index'
import {snapshot, testAppInterface, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {testContainer} from '../../testutil/rtlHelpers'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import {ListElementState} from '../../../src/runtime/components/ListElement'
import {highlightClassName, highlightElement} from '../../../src/runtime/runtimeFunctions'
import {fireEvent} from '@testing-library/react/pure'

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

test('ListElement shows selectedItem as selected from id', () => {
    snapshot(listElement('app.page1.list1', {selectedItem: listData[1].id}, {itemContentComponent: ListItem1, items: listData}))()
})

test('ListElement updates its selectedItem in the app state', async () => {
    const {el, user}  = testContainer(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData}))
    const listItem0El = el`[id="app.page1.list1.#id1.Text99"]`
    await user.click(listItem0El)
    expect(stateAt('app.page1.list1').selectedItem).toBe(listData[0])
})

test('ListElement updates the selectedItem when it changes', async () => {
    const {el, user, renderThe}  = testContainer(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData}))
    const listItem0El = el`[id="app.page1.list1.#id1.Text99"]`
    await user.click(listItem0El)
    expect(stateAt('app.page1.list1').selectedItem).toBe(listData[0])

    const updatedListData = [{id: 'id1', text: 'new text'}, listData[1]]
    renderThe(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: updatedListData}))
    await wait(20)
    expect(stateAt('app.page1.list1').selectedItem).toBe(updatedListData[0])
})

test('ListElement does not update its selectedItem if not selectable', async () => {
    let container = testContainer(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData, selectable: false}), 'container2')
    const listItem0El = container.querySelector('[id="app.page1.list1.#id1.Text99"]')
    const user = userEvent.setup()
    await user.click(listItem0El)
    expect(stateAt('app.page1.list1').selectedItem).toBe(null)
})

test('ListElement updates its scrollTop in the app state', async () => {
    //TODO - find a way to test this - seems that as JSDOM is non-visual so doesn't do scrolling
    // const {el} = testContainer(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData}))
    // const listItem0El = el`[id="app.page1.list1.#id1.Text99"]`
    // fireEvent.scroll(listItem0El, {target: {scrollTop: 99}})
    // await wait(1000)
    // expect(stateAt('app.page1.list1').scrollTop).toBe(99)
})

test('selectAction is called with selected item', async () => {
    const selectAction = jest.fn()
    const {el, user} = testContainer(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData, selectAction}), 'container3')
    const listItem0El = el`[id="app.page1.list1.#id1.Text99"]`
    await user.click(listItem0El)
    expect(selectAction).toHaveBeenCalledWith(listData[0])
})

test('selectAction is called with selected item even if not selectable', async () => {
    const selectAction = jest.fn()
    const {el, user} = testContainer(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData,
        selectable: false, selectAction}), 'container4')
    const listItem0El = el`[id="app.page1.list1.#id1.Text99"]`
    await user.click(listItem0El)
    expect(selectAction).toHaveBeenCalledWith(listData[0])
    expect(stateAt('app.page1.list1').selectedItem).toBe(null)
})

test('Can highlight all matching elements in a list', async () => {
    const {el} = testContainer(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData}))
    highlightElement('app.page1.list1.Text99')

    const listItem0El = el`[id="app.page1.list1.#id1.Text99"]`
    const listItem1El = el`[id="app.page1.list1.#id2.Text99"]`
    expect(listItem0El).toHaveClass(highlightClassName)
    expect(listItem1El).toHaveClass(highlightClassName)
})

test('State class has correct properties', () => {
    const item1 = {a: 1}, item2 = {a: 2}
    const state = new ListElementState({selectedItem: item1})
    const appInterface = testAppInterface(state); state.init(appInterface, 'testPath')
    expect(state.selectedItem).toBe(item1)
    const updatedState = state._withStateForTest({selectedItem: item2, scrollTop: 222})
    expect(updatedState.selectedItem).toBe(item2)
    expect(updatedState.scrollTop).toBe(222)

    state.Reset()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({selectedItem: undefined}))

    state.Set(item2)
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({selectedItem: item2}))

    state._setScrollTop(333)
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({selectedItem: item2, scrollTop: 333}))
})
