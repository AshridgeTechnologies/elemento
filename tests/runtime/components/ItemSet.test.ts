/**
 * @jest-environment jsdom
 */

import {createElement, MouseEventHandler} from 'react'
import {ItemSet, TextElement} from '../../../src/runtime/components/index'
import {inDndContext, snapshot, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import {ItemSetState} from '../../../src/runtime/components/ItemSet'
import {highlightClassName, highlightElement, StylesProps} from '../../../src/runtime/runtimeFunctions'
import renderer from 'react-test-renderer'
import {ItemSetItem} from '../../../src/runtime/components'

function ItemSetItem1(props: {path: string, $item: {text: string}, $selected: boolean, $itemId: string, onClick: MouseEventHandler<HTMLDivElement>, styles: StylesProps}) {
    const styles = {color: 'red', width: 300}
    return createElement(ItemSetItem, {path: props.path, onClick: props.onClick, styles, item: props.$item, itemId: props.$itemId, children:
        createElement(TextElement, {path: `${props.path}.Text99`, content: [props.$item?.text, 'item id ' + props.$itemId, 'selected', props.$selected.toString()].join('\n') }) }
    )
}

function ItemSetItemDraggable(props: {path: string, $item: {text: string}, $selected: boolean, $itemId: string, onClick: MouseEventHandler<HTMLDivElement>, styles: StylesProps}) {
    const styles = {color: 'red', width: 300}
    return createElement(ItemSetItem, {path: props.path, onClick: props.onClick, canDragItem: true, styles, item: props.$item, itemId: props.$itemId, children:
        createElement(TextElement, {path: `${props.path}.Text99`, content: [props.$item?.text, 'item id ' + props.$itemId, 'selected', props.$selected.toString()].join('\n') }) }
    )
}

const itemSetData = [{id: 'id1', text: 'where are you?'}, {id: 'id2', text: 'over here!'}]
const longItemSetData = [{id: 'id1', text: 'One'}, {id: 'id2', text: 'Two'}, {id: 'id3', text: 'Three'}, {id: 'id4', text: 'Four'}]
const itemSetDataNoIds = [{Label: 'No 1', text: 'where are you?'}, {Label: 'No 2', text: 'over here!'}]

const [itemSet, appStoreHook] = wrappedTestElement(ItemSet, ItemSetState, true)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('produces output containing ReactElement children', () => {
    snapshot(itemSet('app.page1.itemSet1', {items: itemSetData}, {itemContentComponent: ItemSetItem1, itemStyles: {color: 'red', width: 300}}))()
})

test('produces output containing ReactElement children if draggable', () => {
    snapshot(itemSet('app.page1.itemSet1', {items: itemSetData}, {itemContentComponent: ItemSetItemDraggable, itemStyles: {color: 'red', width: 300}}))()
})

test('produces output with indexes if items have no ids', () => {
    snapshot(itemSet('app.page1.itemSet1', {items: itemSetDataNoIds}, {itemContentComponent: ItemSetItem1, itemStyles: {color: 'red', width: 200}}))()
})

test('shows single selectedItem as selected', async () => {
    snapshot(itemSet('app.page1.itemSet1', {selectedItems: itemSetData[1], items: itemSetData}, {itemContentComponent: ItemSetItem1}))()
})

test('shows null items', () => {
    snapshot(itemSet('app.page1.itemSet1', {selectedItems: itemSetDataNoIds[1], items: itemSetDataNoIds}, {itemContentComponent: ItemSetItem1}))()
})

test('shows only first selectedItem as selected if no ids when given zero as index', async () => {
    let el: any
    await actWait(async () => {
        el = renderer.create(itemSet('app.page1.itemSet1', {selectedItems: 0, items: itemSetDataNoIds}, {
            itemContentComponent: ItemSetItem1
        }))
    })

    expect(el.toJSON()).toMatchSnapshot()
})

test('produces empty output if items is null but there is a selected item, as may happen when refreshing data', () => {
    snapshot(itemSet('app.page1.itemSet1', {selectedItem: itemSetData[1], items: null}, {itemContentComponent: ItemSetItem1}))()
})

test('produces output when an item is null', () => {
    const items = [{id: 'id1', text: 'One'}, null, {id: 'id3', text: 'Three'}]
    snapshot(itemSet('app.page1.itemSet1', {selectedItem: itemSetData[1], items}, {itemContentComponent: ItemSetItem1}))()
})

test('updates its selectedItem in the app state', async () => {
    const {el, user}  = testContainer(inDndContext(itemSet('app.page1.itemSet1', {items: itemSetData}, {itemContentComponent: ItemSetItem1})))
    const itemSetItem0El = el`[id="app.page1.itemSet1.#id1.Text99"]`
    await user.click(itemSetItem0El)
    expect(stateAt('app.page1.itemSet1').selectedItem).toStrictEqual(itemSetData[0])
})

test('adds to selectedItems in the app state with Control key', async () => {
    const {el, user}  = testContainer(itemSet('app.page1.itemSet1', {items: longItemSetData, selectedItems: 1, selectable: 'multiple'}, {itemContentComponent: ItemSetItem1}), 'container2')
    const itemSetItem0El = el`[id="app.page1.itemSet1.#id1.Text99"]`
    await user.keyboard('[ControlLeft>]')
    await user.click(itemSetItem0El)
    expect(stateAt('app.page1.itemSet1').selectedItems).toStrictEqual([longItemSetData[1], longItemSetData[0]])
})

test('selects a block in the app state with Shift key', async () => {
    const {el, user}  = testContainer(itemSet('app.page1.itemSet1', {items: longItemSetData, selectedItems: 2, selectable: 'multiple'}, {itemContentComponent: ItemSetItem1}), 'container3')
    const itemSetItem0El = el`[id="app.page1.itemSet1.#id1.Text99"]`
    await user.keyboard('[ShiftLeft>]')
    await user.click(itemSetItem0El)
    expect(stateAt('app.page1.itemSet1').selectedItems).toStrictEqual([longItemSetData[2], longItemSetData[1], longItemSetData[0]])
})

test('updates the selectedItem when it changes', async () => {
    const {el, user, renderThe}  = testContainer(itemSet('app.page1.itemSet1', {items: itemSetData}, {itemContentComponent: ItemSetItem1}))
    const itemSetItem0El = el`[id="app.page1.itemSet1.#id1.Text99"]`
    await user.click(itemSetItem0El)
    expect(stateAt('app.page1.itemSet1').selectedItem).toStrictEqual(itemSetData[0])

    const updatedItemSetData = [{id: 'id1', text: 'new text'}, itemSetData[1]]
    renderThe(itemSet('app.page1.itemSet1', {items: updatedItemSetData}, {itemContentComponent: ItemSetItem1}))
    await wait(20)
    expect(stateAt('app.page1.itemSet1').selectedItem).toBe(updatedItemSetData[0])
})

test('does not update its selectedItem if not selectable', async () => {
    let container = testContainer(itemSet('app.page1.itemSet1', {items: itemSetData, selectable: 'none'}, {itemContentComponent: ItemSetItem1}), 'container4')
    const itemSetItem0El = container.querySelector('[id="app.page1.itemSet1.#id1.Text99"]')
    const user = userEvent.setup()
    await user.click(itemSetItem0El)
    expect(stateAt('app.page1.itemSet1').selectedItem).toBe(null)
})

test('Can highlight all matching elements in a itemSet', async () => {
    const {el} = testContainer(itemSet('app.page1.itemSet1', {items: itemSetData}, {itemContentComponent: ItemSetItem1}))
    highlightElement('app.page1.itemSet1.Text99')

    const itemSetItem0El = el`[id="app.page1.itemSet1.#id1.Text99"]`
    const itemSetItem1El = el`[id="app.page1.itemSet1.#id2.Text99"]`
    expect(itemSetItem0El).toHaveClass(highlightClassName)
    expect(itemSetItem1El).toHaveClass(highlightClassName)
})
