/**
 * @vitest-environment jsdom
 */
import {expect, test} from 'vitest'
import {createElement, Fragment} from 'react'
import {ItemSet, ListElement, TextElement} from '../../../src/runtime/components/index'
import {createStateFn, snapshot, wrappedTestElementNew} from '../../testutil/testHelpers'

import {ListElementState} from '../../../src/runtime/components/ListElement'

function ItemSetItem1(props: {path: string, $item: {text: string}, $selected: boolean}) {
    return createElement(Fragment, null, createElement(TextElement, {path: `${props.path}.Text99`, content: [props.$item.text, 'selected', props.$selected.toString()].join('\n')} ))
}

const itemSetData = [{id: 'id1', text: 'where are you?'}, {id: 'id2', text: 'over here!'}]

const [listElement, appStoreHook] = wrappedTestElementNew(ListElement)
const [itemSet, appStoreHookItemSet] = wrappedTestElementNew(ItemSet)

test('ListElement produces output containing fixed ReactElement children ', () => {
    const item1 = createElement(TextElement, {path: `app.page1.list1.Text99` , content: 'Text 99'})
    const item2 = createElement(TextElement, {path: `app.page1.list1.Text100`, content: 'Text 100'})
    snapshot(listElement('app.page1.list1', {styles: {color: 'red'}, width: 200}, [item1, item2]))()
})

test('ListElement produces output containing an item set', () => {
    const itemSet1 = itemSet('app.page1.itemSet1', {}, {itemContentComponent: ItemSetItem1, items: itemSetData, itemStyles: {color: 'blue', width: 150}})
    snapshot(listElement('app.page1.list1', {styles: {color: 'red'}, width: 200}, itemSet1))()
})

test('ListElement produces output containing an item set and fixed children', () => {
    const itemSet1 = itemSet('app.page1.itemSet1', {itemContentComponent: ItemSetItem1, items: itemSetData, itemStyles: {color: 'blue', width: 150}})
    const item1 = createElement(TextElement, {path: `app.page1.list1.Text99` , content: 'Text 99', key: 1})
    const item2 = createElement(TextElement, {path: `app.page1.list1.Text100`, content: 'Text 100', key: 2})
    snapshot(listElement('app.page1.list1', {styles: {color: 'red'}, width: 200}, [item1, itemSet1, item2]))()
})

test('ListElement updates its scrollTop in the app state', async () => {
    //TODO - find a way to test this - seems that as JSDOM is non-visual so doesn't do scrolling
    // const {el} = testContainer(listElement('app.page1.list1', {}, {itemContentComponent: ListItem1, items: listData}))
    // const listItem0El = el`[id="app.page1.list1.#id1.Text99"]`
    // fireEvent.scroll(listItem0El, {target: {scrollTop: 99}})
    // await wait(1000)
    // expect(stateAt('app.page1.list1').scrollTop).toBe(99)
})

test('State class has correct properties', () => {
    const createState = createStateFn(ListElementState)
    const state = createState({})
    expect(state.scrollTop).toBe(0)
    state._setScrollTop(333)
    expect(state.latest().scrollTop).toBe(333)
})
