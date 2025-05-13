import {beforeEach, expect, MockedFunction, test, vi} from "vitest"
/**
 * @vitest-environment jsdom
 */
import {createElement, MouseEventHandler} from 'react'
import {ItemSet, TextElement} from '../../../src/runtime/components/index'
import {inDndContext, snapshot, testAppInterface, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import userEvent from '@testing-library/user-event'

import {ItemSetState} from '../../../src/runtime/components/ItemSet'
import {StylesProps} from '../../../src/runtime/runtimeFunctions'
import renderer from 'react-test-renderer'
import {ItemSetItem} from '../../../src/runtime/components'

function ItemSetItem1(props: {path: string, $item: {text: string}, $selected: boolean, $itemId: string, $index: number, onClick: MouseEventHandler<HTMLDivElement>, styles: StylesProps}) {
    const styles = {color: 'red', width: 300}
    return createElement(ItemSetItem, {path: props.path, onClick: props.onClick, styles, item: props.$item, itemId: props.$itemId, index: props.$index, children:
        createElement(TextElement, {path: `${props.path}.Text99`, content: [props.$item?.text, 'item id ' + props.$itemId, 'index ' + props.$index, 'selected', props.$selected.toString()].join('\n') }) }
    )
}

function ItemSetItemDraggable(props: {path: string, $item: {text: string}, $selected: boolean, $itemId: string, $index: number, onClick: MouseEventHandler<HTMLDivElement>, styles: StylesProps}) {
    const styles = {color: 'red', width: 300}
    return createElement(ItemSetItem, {path: props.path, onClick: props.onClick, canDragItem: true, styles, item: props.$item, itemId: props.$itemId, index: props.$index, children:
        createElement(TextElement, {path: `${props.path}.Text99`, content: [props.$item?.text, 'item id ' + props.$itemId, 'index ' + props.$index, 'selected', props.$selected.toString()].join('\n') }) }
    )
}

const itemSetData = [{id: 'id1', text: 'where are you?'}, {id: 'id2', text: 'over here!'}]
const longItemSetData = [{id: 'id1', text: 'One'}, {id: 'id2', text: 'Two'}, {id: 'id3', text: 'Three'}, {id: 'id4', text: 'Four'}]
const itemSetDataNoIds = [{Label: 'No 1', text: 'where are you?'}, {Label: 'No 2', text: 'over here!'}]

const [itemSet, appStoreHook] = wrappedTestElement(ItemSet, ItemSetState, true)

const stateAt = (path: string) => appStoreHook.stateAt(path)

let selectAction: MockedFunction<any>

beforeEach( ()=> selectAction = vi.fn() )

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

test('shows items with no ids', () => {
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

test('updates its selectedItem in the app state if no select action supplied', async () => {
    const {el, user}  = testContainer(inDndContext(itemSet('app.page1.itemSet1', {items: itemSetData}, {itemContentComponent: ItemSetItem1})))
    const itemSetItem0El = el`[id="app.page1.itemSet1.#id1.Text99"]`
    await user.click(itemSetItem0El)
    expect(stateAt('app.page1.itemSet1').selectedItem).toStrictEqual(itemSetData[0])
})

test('updates its selectedItem in the app state and calls select action with correct arguments', async () => {
    const {el, user}  = testContainer(inDndContext(itemSet('app.page1.itemSet77', {items: itemSetData, selectAction}, {itemContentComponent: ItemSetItem1})))
    // expect(stateAt('app.page1.itemSet1').selectedItem).toBe(null)
    const itemSetItem1El = el`[id="app.page1.itemSet77.#id2.Text99"]`
    await user.click(itemSetItem1El)
    await wait()
    expect(stateAt('app.page1.itemSet77').selectedItem).toStrictEqual(itemSetData[1])
    expect(selectAction).toHaveBeenCalledWith(itemSetData[1], 'id2', 1)
})

test('adds to selectedItems in the app state with Control key', async () => {
    const {el, user}  = testContainer(itemSet('app.page1.itemSet1', {items: longItemSetData, selectAction, selectedItems: 1, selectable: 'multiple'}, {itemContentComponent: ItemSetItem1}), 'container2')
    const itemSetItem0El = el`[id="app.page1.itemSet1.#id1.Text99"]`
    await user.keyboard('[ControlLeft>]')
    await user.click(itemSetItem0El)
    expect(stateAt('app.page1.itemSet1').selectedItems).toStrictEqual([longItemSetData[1], longItemSetData[0]])
    expect(selectAction).toHaveBeenCalledWith([longItemSetData[0]], ['id1'], [0])
})

test('selects a block in the app state with Shift key', async () => {
    const {el, user}  = testContainer(itemSet('app.page1.itemSet1', {items: longItemSetData, selectedItems: 2, selectable: 'multiple', selectAction}, {itemContentComponent: ItemSetItem1}), 'container3')
    const itemSetItem0El = el`[id="app.page1.itemSet1.#id1.Text99"]`
    await user.keyboard('[ShiftLeft>]')
    await user.click(itemSetItem0El)
    expect(stateAt('app.page1.itemSet1').selectedItems).toStrictEqual([longItemSetData[2], longItemSetData[1], longItemSetData[0]])
    expect(selectAction).toHaveBeenCalledWith([longItemSetData[2], longItemSetData[1], longItemSetData[0]], ['id3', 'id2', 'id1'], [2, 1, 0])
})

test('updates the selectedItem when it changes', async () => {
    const {el, user, renderThe}  = testContainer(itemSet('app.page1.itemSet66', {items: itemSetData}, {itemContentComponent: ItemSetItem1}))
    const itemSetItem0El = el`[id="app.page1.itemSet66.#id1.Text99"]`
    await user.click(itemSetItem0El)
    expect(stateAt('app.page1.itemSet66').selectedItem).toStrictEqual(itemSetData[0])

    const updatedItemSetData = [{id: 'id1', text: 'new text'}, itemSetData[1]]
    renderThe(itemSet('app.page1.itemSet66', {items: updatedItemSetData}, {itemContentComponent: ItemSetItem1}))
    await wait(20)
    expect(stateAt('app.page1.itemSet66').selectedItem).toBe(updatedItemSetData[0])
})

test('does not update its selectedItem if not selectable but does call select action', async () => {
    let container = testContainer(itemSet('app.page1.itemSet1', {items: itemSetData, selectable: 'none', selectAction}, {itemContentComponent: ItemSetItem1}), 'container4')
    const itemSetItem0El = container.querySelector('[id="app.page1.itemSet1.#id1.Text99"]')
    const user = userEvent.setup()
    await user.click(itemSetItem0El)
    expect(stateAt('app.page1.itemSet1').selectedItem).toBe(null)
    expect(selectAction).toHaveBeenCalledWith(itemSetData[0], 'id1', 0)
})

test('can set, add to and reset selection', () => {
    const state = new ItemSetState({items: longItemSetData, selectedItems: 1})
    const appInterface = testAppInterface('testPath', state)
    state.Set(['id1', 'id3'])
    expect(state.latest().selectedItems).toStrictEqual([longItemSetData[0], longItemSetData[2]])

    state.Select(longItemSetData[3])
    expect(state.latest().selectedItems).toStrictEqual([longItemSetData[0], longItemSetData[2], longItemSetData[3]])

    state.Reset()
    expect(state.latest().selectedItems).toStrictEqual([longItemSetData[1]])  // back to initial value
})

test('can remove from selection in onSelect', () => {
    const state = new ItemSetState({items: longItemSetData, selectedItems: [1, 2], selectable: 'multiple'})
    const appInterface = testAppInterface('testPath', state)
    state.onSelect('id2', 1, 'addRemove')
    expect(state.latest().selectedItems).toStrictEqual([longItemSetData[2]])

})

test('can add to selection in onSelect', () => {
    const state = new ItemSetState({items: longItemSetData, selectedItems: [1, 2], selectable: 'multiple'})
    const appInterface = testAppInterface('testPath', state)
    state.onSelect('id4', 3, 'addRemove')
    expect(state.latest().selectedItems).toStrictEqual([longItemSetData[1], longItemSetData[2], longItemSetData[3]])
})

test('add to selection with non-existent id does nothing', () => {
    const state = new ItemSetState({items: longItemSetData, selectedItems: [1, 2], selectable: 'multiple'})
    const appInterface = testAppInterface('testPath', state)
    state.onSelect('id99', 99, 'addRemove')
    expect(state.latest().selectedItems).toStrictEqual([longItemSetData[1], longItemSetData[2]])
})

test('can extend selection from last in onSelect', () => {
    const state = new ItemSetState({items: longItemSetData, selectedItems: [0, 1], selectable: 'multiple'})
    const appInterface = testAppInterface('testPath', state)
    state.onSelect(3, 3, 'fromLast')
    expect(state.latest().selectedItems).toStrictEqual([longItemSetData[1], longItemSetData[2], longItemSetData[3]])

})

test('extend selection from last in onSelect with invalid id does nothing', () => {
    const state = new ItemSetState({items: longItemSetData, selectedItems: [0, 1], selectable: 'multiple', selectAction})
    const appInterface = testAppInterface('testPath', state)
    state.onSelect('id99', 99, 'fromLast')
    expect(state.latest().selectedItems).toStrictEqual([longItemSetData[0], longItemSetData[1]])
    expect(selectAction).not.toHaveBeenCalled()
})

test('can extend selection single item even if multiple', () => {
    const state = new ItemSetState({items: longItemSetData, selectedItems: [0, 1], selectable: 'multiple'})
    const appInterface = testAppInterface('testPath', state)
    state.onSelect(3, 3, 'replace')
    expect(state.latest().selectedItems).toStrictEqual([longItemSetData[3]])
})

test('states are equal if items structurally equal', () => {
    const state1 = new ItemSetState({items: [1,2,3], selectable: 'multiple'})
    const state2 = new ItemSetState({items: [1,2,3], selectable: 'multiple'})
    const state3 = new ItemSetState({items: [1,2,3], selectable: 'single'})
    const state4 = new ItemSetState({items: [3, 4, 5], selectable: 'multiple'})

    expect(state1.updateFrom(state2)).toBe(state1)
    expect(state1.updateFrom(state3)).not.toBe(state1)
    expect(state1.updateFrom(state4)).not.toBe(state1)
})
