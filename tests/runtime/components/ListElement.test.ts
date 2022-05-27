/**
 * @jest-environment jsdom
 */

import {createElement, Fragment} from 'react'
import {ListElement, TextElement} from '../../../src/runtime/components/index'
import {snapshot, testProxy} from '../../testutil/testHelpers'
import {stateProxy, update} from '../../../src/runtime/stateProxy'
import {testContainer} from '../../testutil/rtlHelpers'
import userEvent from '@testing-library/user-event'

function ListItem1(props: {path: string, $item: {text: string}}) {
    return createElement(Fragment, null, createElement(TextElement, {path: `${props.path}.Text99`}, props.$item.text) )
}

const listData = [{Id: 'id1', text: 'where are you?'}, {Id: 'id2', text: 'over here!'}]

test('ListElement produces output containing ReactElement children', () => {
    snapshot(createElement(ListElement, {state: testProxy('app.page1.list1', {}), itemContentComponent: ListItem1, items: listData}))()
})

test('ListElement shows selectedItem as selected', () => {
    snapshot(createElement(ListElement, {state: testProxy('app.page1.list1', {selectedItem: listData[1]}), itemContentComponent: ListItem1, items: listData}))()
})

test('ListElement updates its selectedItem in the app state', async () => {
    const updateFn = jest.fn()
    const proxy = stateProxy('app.page1.list1', {selectedItem: listData[1]}, {_type: ListElement.State}, updateFn)
    let container = testContainer(createElement(ListElement, {state: proxy, itemContentComponent: ListItem1, items: listData}))
    const listItem0El = container.querySelector('[id="app.page1.list1.0.Text99"]')
    const user = userEvent.setup()
    await user.click(listItem0El)
    expect(updateFn).toHaveBeenCalledWith('app.page1.list1', {selectedItem: listData[0]}, false)
} )

test('State class has correct properties', () => {
    const item = {a: 1}
    const state = new ListElement.State({selectedItem: item})
    expect(state.selectedItem).toBe(item)

    expect(state.Reset()).toStrictEqual(update({selectedItem: undefined}))
})
