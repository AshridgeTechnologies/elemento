import {beforeEach, expect, Mock, test, vi} from "vitest"
import {testAppInterface, valueObj} from '../../testutil/testHelpers'
import {ItemSetState} from '../../../src/runtime/components/ItemSet'

const item1 = {a: 1}, item2 = {a: 2}, item3 = {a: 3}, item4 = {a: 4}
const idItem1 = {id: 'x1', a: 1}, idItem2 = {id: 'x2', a: 2}, idItem3 = {id: 'x3', a: 3}, idItem4 = {id: 'x4', a: 4}
const textItem1 = 'a', textItem2 = 'b', textItem3 = 'c', textItem4 = 'd'
const numberItem1 = 11, numberItem2 = 22, numberItem3 = 33, numberItem4 = 44

let selectAction: Mock
beforeEach( ()=> selectAction = vi.fn() )

test('Has correct properties', () => {
    const selectAction = () => {
    }
    const state = new ItemSetState({items: [item1, item2], selectedItems: item1, selectAction})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItems).toStrictEqual([item1])
    expect(state.selectedItem).toStrictEqual(item1)
    expect(state.selectAction).toBe(selectAction)
    expect(state.selectable).toBe('single')
    expect(state.items).toStrictEqual([item1, item2])
})

test('Has correct properties from value objects', () => {
    const state = new ItemSetState({items: valueObj([item1, item2]), selectedItems: valueObj(item1), selectable: valueObj('none')})
    expect(state.items).toStrictEqual([item1, item2])
    expect(state.selectable).toBe('none')
    expect(state.selectAction).toBe(undefined)
    expect(state.selectedItems).toStrictEqual([item1])
    expect(state.selectedItem).toStrictEqual(item1)
})

test('Has empty item array if not defined', () => {
    // @ts-ignore
    const state = new ItemSetState({items: valueObj(undefined), selectedItems: valueObj(item1), selectable: valueObj('none')})
    expect(state.items).toStrictEqual([])
})

test('knows if item is selected', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: item1})
    const appInterface = testAppInterface('testPath', state)

    expect(state.isSelected(0)).toBe(true)
    expect(state.isSelected(1)).toBe(false)

    state.Set(item2)
    expect(state.latest().isSelected(0)).toBe(false)
    expect(state.latest().isSelected(1)).toBe(true)
})

test('knows if item with id is selected', () => {
    const state = new ItemSetState({items: [idItem1, idItem2], selectedItems: idItem1})
    const appInterface = testAppInterface('testPath', state)

    expect(state.isSelected(0)).toBe(true)
    expect(state.isSelected(1)).toBe(false)

    state.Set(idItem2)
    expect(state.latest().isSelected(0)).toBe(false)
    expect(state.latest().isSelected(1)).toBe(true)
})

test('Can Set and Reset selected items, selectAction not called', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: item1, selectAction})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItems).toStrictEqual([item1])

    state.Set(item2)
    expect(state.latest().selectedItems).toStrictEqual([item2])

    state.latest().Reset()
    expect(state.latest().selectedItems).toStrictEqual([item1])

    expect(selectAction).not.toHaveBeenCalled()
})

test('Can Select to add to selected items and Reset', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectedItems: item1, selectAction})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItems).toStrictEqual([item1])

    state.Select(item4)
    expect(state.latest().selectedItems).toStrictEqual([item1, item4])

    state.latest().Select(valueObj([item3, item2]))
    expect(state.latest().selectedItems).toStrictEqual([item1, item4, item3, item2])

    state.latest().Reset()
    expect(state.latest().selectedItems).toStrictEqual([item1])

    expect(selectAction).not.toHaveBeenCalled()
})

test('Duplicates ignored in original selected items and Select items', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectedItems: [item1, item1]})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItems).toStrictEqual([item1])

    state.Select(item4)
    expect(state.latest().selectedItems).toStrictEqual([item1, item4])

    state.latest().Select([item2, item4, item2])
    expect(state.latest().selectedItems).toStrictEqual([item1, item4, item2])
})

test('has no selected item if not supplied', () => {
    const state = new ItemSetState({items: [item1, item2]})
    expect(state.selectedItems).toStrictEqual([])
    expect(state.selectedItemIds).toStrictEqual([])
    expect(state.selectedItem).toBe(null)

    const updatedState = state.withState({selectedItemIds: [1]})
    expect(updatedState.selectedItems).toStrictEqual([item2])
    expect(updatedState.selectedItemIds).toStrictEqual([1])
    expect(updatedState.selectedItem).toBe(item2)
})

test('has single selected item given as object', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: item1})
    expect(state.selectedItems).toStrictEqual([item1])
    expect(state.selectedItemIds).toStrictEqual([0])
    expect(state.selectedItem).toStrictEqual(item1)

    const updatedState = state.withState({selectedItemIds: [1]})
    expect(updatedState.selectedItems).toStrictEqual([item2])
    expect(updatedState.selectedItemIds).toStrictEqual([1])
    expect(updatedState.selectedItem).toBe(item2)
})

test('has single selected item given as value object', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: valueObj(item1)})
    expect(state.selectedItems).toStrictEqual([item1])
    expect(state.selectedItemIds).toStrictEqual([0])
    expect(state.selectedItem).toStrictEqual(item1)
})

test('has single selected item given as index', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: 1})
    expect(state.selectedItems).toStrictEqual([item2])
    expect(state.selectedItemIds).toStrictEqual([1])
    expect(state.selectedItem).toStrictEqual(item2)
})

test('has single selected item given as index string', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: '1'})
    expect(state.selectedItems).toStrictEqual([item2])
    expect(state.selectedItemIds).toStrictEqual([1])
    expect(state.selectedItem).toStrictEqual(item2)
})

test('has single selected item with id given as object', () => {
    const state = new ItemSetState({items: [idItem1, idItem2], selectedItems: idItem1})
    expect(state.selectedItems).toStrictEqual([idItem1])
    expect(state.selectedItemIds).toStrictEqual([idItem1.id])
    expect(state.selectedItem).toStrictEqual(idItem1)
})

test('has single selected item with id given as id', () => {
    const state = new ItemSetState({items: [idItem1, idItem2], selectedItems: idItem2.id})
    expect(state.selectedItems).toStrictEqual([idItem2])
    expect(state.selectedItemIds).toStrictEqual([idItem2.id])
    expect(state.selectedItem).toStrictEqual(idItem2)
})

test('has single selected item with id given as index', () => {
    const state = new ItemSetState({items: [idItem1, idItem2], selectedItems: 0})
    expect(state.selectedItems).toStrictEqual([idItem1])
    expect(state.selectedItemIds).toStrictEqual([idItem1.id])
    expect(state.selectedItem).toStrictEqual(idItem1)
})

test('has single selected text item given as string', () => {
    const state = new ItemSetState({items: [textItem1, textItem2, textItem3], selectedItems: textItem2})
    expect(state.selectedItems).toStrictEqual([textItem2])
    expect(state.selectedItemIds).toStrictEqual([1])
    expect(state.selectedItem).toStrictEqual(textItem2)
})

test('has single selected text item given as index', () => {
    const state = new ItemSetState({items: [textItem1, textItem2, textItem3], selectedItems: 1})
    expect(state.selectedItems).toStrictEqual([textItem2])
    expect(state.selectedItemIds).toStrictEqual([1])
    expect(state.selectedItem).toStrictEqual(textItem2)
})

test('has single selected number item given as index', () => {
    const state = new ItemSetState({items: [numberItem1, numberItem2, numberItem3], selectedItems: 1})
    expect(state.selectedItems).toStrictEqual([numberItem2])
    expect(state.selectedItemIds).toStrictEqual([1])
    expect(state.selectedItem).toStrictEqual(numberItem2)
})

// multiple selected items
test('has multiple selected items given as object with most recent selection as selected item', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectedItems: [item3, item1]})
    expect(state.selectedItems).toStrictEqual([item3, item1])
    expect(state.selectedItemIds).toStrictEqual([2, 0])
    expect(state.selectedItem).toStrictEqual(item1)
})

test('has multiple selected items given as index', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectedItems: [3, 2]})
    expect(state.selectedItemIds).toStrictEqual([3, 2])
    expect(state.selectedItem).toStrictEqual(item3)
})

test('has multiple selected items given as index string', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectedItems: ['1', '2']})
    expect(state.selectedItems).toStrictEqual([item2, item3])
    expect(state.selectedItemIds).toStrictEqual([1, 2])
    expect(state.selectedItem).toStrictEqual(item3)
})

test('has multiple selected items with id given as object', () => {
    const state = new ItemSetState({items: [idItem1, idItem2, idItem3, idItem4], selectedItems: [idItem1, idItem2]})
    expect(state.selectedItems).toStrictEqual([idItem1, idItem2])
    expect(state.selectedItemIds).toStrictEqual([idItem1.id, idItem2.id])
    expect(state.selectedItem).toStrictEqual(idItem2)
})

test('has multiple selected items with id given as id', () => {
    const state = new ItemSetState({items: [idItem1, idItem2], selectedItems: [idItem2.id, idItem1.id]})
    expect(state.selectedItems).toStrictEqual([idItem2, idItem1])
    expect(state.selectedItemIds).toStrictEqual([idItem2.id, idItem1.id])
    expect(state.selectedItem).toStrictEqual(idItem1)
})

test('has multiple selected items with id given as index', () => {
    const state = new ItemSetState({items: [idItem1, idItem2, idItem3, idItem4], selectedItems: [3, 0]})
    expect(state.selectedItems).toStrictEqual([idItem4, idItem1])
    expect(state.selectedItemIds).toStrictEqual([idItem4.id, idItem1.id])
    expect(state.selectedItem).toStrictEqual(idItem1)
})

test('has multiple selected text items given as string', () => {
    const state = new ItemSetState({items: [textItem1, textItem2, textItem3, textItem4], selectedItems: [textItem4, textItem1]})
    expect(state.selectedItems).toStrictEqual([textItem4, textItem1])
    expect(state.selectedItemIds).toStrictEqual([3, 0])
    expect(state.selectedItem).toStrictEqual(textItem1)
})

test('has multiple selected text items given as index', () => {
    const state = new ItemSetState({items: [textItem1, textItem1, textItem2, textItem3, textItem3, textItem4], selectedItems: [2, 3]})
    expect(state.selectedItems).toStrictEqual([textItem2, textItem3])
    expect(state.selectedItemIds).toStrictEqual([2, 3])
    expect(state.selectedItem).toStrictEqual(textItem3)
})

test('has multiple selected number items given as index', () => {
    const state = new ItemSetState({items: [numberItem1, numberItem2, numberItem3, numberItem4], selectedItems: [3, 0]})
    expect(state.selectedItems).toStrictEqual([numberItem4, numberItem1])
    expect(state.selectedItemIds).toStrictEqual([3, 0])
    expect(state.selectedItem).toStrictEqual(numberItem1)
})

test('has multiple selected items of different sorts given in different ways', () => {
    const state = new ItemSetState({items: [item1, item2, idItem1, idItem2, textItem1, textItem2, numberItem1, numberItem2], selectedItems: [7, 0, idItem1.id, textItem2]})
    expect(state.selectedItems).toStrictEqual([numberItem2, item1, idItem1, textItem2])
    expect(state.selectedItemIds).toStrictEqual([7, 0, idItem1.id, 5])
    expect(state.selectedItem).toStrictEqual(textItem2)
})

test('ignores selected items not found in items', () => {
    const item1ButNotSameInstance = {...item1}
    const state = new ItemSetState({items: [item1, item2, idItem1, idItem2, textItem1, textItem2, numberItem1, numberItem2], selectedItems: ['x', 99, item1ButNotSameInstance, textItem2]})
    expect(state.selectedItems).toStrictEqual([textItem2])
    expect(state.selectedItemIds).toStrictEqual([5])
    expect(state.selectedItem).toStrictEqual(textItem2)
})

test('ignores undefined items', () => {
    const state = new ItemSetState({items: [item1, undefined, undefined, idItem2], selectedItems: [item1, 1, 2, idItem2.id]})
    expect(state.selectedItems).toStrictEqual([item1, idItem2])
    expect(state.selectedItemIds).toStrictEqual([0, idItem2.id])
    expect(state.selectedItem).toStrictEqual(idItem2)
})

test('Has new selected item after Set with item', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: item1})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItem).toStrictEqual(item1)

    state.Set(item2)
    expect(state.latest().selectedItems).toStrictEqual([item2])
    expect(state.latest().selectedItemIds).toStrictEqual([1])
})

test('Has new selected item after Set with item index', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: item1})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItem).toStrictEqual(item1)

    state.Set(1)
    expect(state.latest().selectedItems).toStrictEqual([item2])
    expect(state.latest().selectedItemIds).toStrictEqual([1])
})

test('Has new selected item after Set with item index as string', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: item1})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItem).toStrictEqual(item1)

    state.Set('1')
    expect(state.latest().selectedItems).toStrictEqual([item2])
    expect(state.latest().selectedItemIds).toStrictEqual([1])
})

test('Has new selected item after Set with item id', () => {
    const state = new ItemSetState({items: [idItem3, idItem1, idItem2], selectedItems: idItem1})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItem).toStrictEqual(idItem1)

    state.Set(idItem2.id)
    expect(state.latest().selectedItems).toStrictEqual([idItem2])
    expect(state.latest().selectedItemIds).toStrictEqual([idItem2.id])
})

test('Has new selected item after onSelect with item index, replace and selectable single', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: item1, selectAction})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItem).toStrictEqual(item1)

    state.onSelect(1, 1, 'replace')
    expect(state.latest().selectedItems).toStrictEqual([item2])
    expect(state.latest().selectedItemIds).toStrictEqual([1])
    expect(selectAction).toHaveBeenCalledWith(item2, 1, 1)
})

test('Has new single selected item after onSelect with item id, addRemove or fromLast and selectable single', () => {
    const state = new ItemSetState({items: [idItem1, idItem2], selectedItems: idItem1, selectAction, selectable: 'single'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItem).toStrictEqual(idItem1)

    state.onSelect(idItem2.id, 1, 'addRemove')
    expect(state.latest().selectedItems).toStrictEqual([idItem2])
    expect(state.latest().selectedItemIds).toStrictEqual([idItem2.id])
    expect(selectAction).toHaveBeenCalledWith(idItem2, idItem2.id, 1)

    state.latest().onSelect(idItem1.id, 0, 'fromLast')
    expect(state.latest().selectedItems).toStrictEqual([idItem1])
    expect(state.latest().selectedItemIds).toStrictEqual([idItem1.id])
    expect(selectAction).toHaveBeenCalledWith(idItem1, idItem1.id, 0)
})

test('State class adds new single selected item after onSelect and addRemove if selectable is multiple', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectedItems: item1, selectAction, selectable: 'multiple'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItem).toStrictEqual(item1)

    state.onSelect(1, 1, 'addRemove')
    expect(state.latest().selectedItems).toStrictEqual([item1, item2])
    expect(state.latest().selectedItemIds).toStrictEqual([0, 1])
    expect(state.latest().selectedItem).toStrictEqual(item2)
    expect(selectAction).toHaveBeenCalledWith([item2], [1], [1])

    state.latest().onSelect(3, 3, 'addRemove')
    expect(state.latest().selectedItems).toStrictEqual([item1, item2, item4])
    expect(state.latest().selectedItemIds).toStrictEqual([0, 1, 3])
    expect(state.latest().selectedItem).toStrictEqual(item4)
    expect(selectAction).toHaveBeenLastCalledWith([item4], [3], [3])
})

test('State class removes new single selected item in onSelect and addRemove if select is multiple and already selected in properties', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectedItems: [item1, item3], selectAction, selectable: 'multiple'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItems).toStrictEqual([item1, item3])
    expect(state.selectedItemIds).toStrictEqual([0, 2])

    state.onSelect(2, 1, 'addRemove')
    expect(state.latest().selectedItems).toStrictEqual([item1])
    expect(state.latest().selectedItemIds).toStrictEqual([0])
    expect(state.latest().selectedItem).toStrictEqual(item1)
    expect(selectAction).toHaveBeenCalledWith(null, null, null)

    state.latest().onSelect(0, 0, 'addRemove')
    expect(state.latest().selectedItems).toStrictEqual([])
    expect(state.latest().selectedItemIds).toStrictEqual([])
    expect(state.latest().selectedItem).toStrictEqual(null)
    expect(selectAction).toHaveBeenCalledWith(null, null, null)
})

test('State class always adds new single selected item after onSelect if selectable is multipleAuto', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectedItems: item1, selectAction, selectable: 'multipleAuto'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItem).toStrictEqual(item1)

    state.onSelect(1, 1, 'addRemove')
    expect(state.latest().selectedItems).toStrictEqual([item1, item2])
    expect(state.latest().selectedItemIds).toStrictEqual([0, 1])
    expect(state.latest().selectedItem).toStrictEqual(item2)
    expect(selectAction).toHaveBeenCalledWith([item2], [1], [1])

    state.latest().onSelect(3, 3, 'replace')
    expect(state.latest().selectedItems).toStrictEqual([item1, item2, item4])
    expect(state.latest().selectedItemIds).toStrictEqual([0, 1, 3])
    expect(state.latest().selectedItem).toStrictEqual(item4)
    expect(selectAction).toHaveBeenLastCalledWith([item4], [3], [3])
})

test('State class always removes new single selected item in onSelect if selectable is multipleAuto and already selected in properties', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectedItems: [item1, item3], selectAction, selectable: 'multipleAuto'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItems).toStrictEqual([item1, item3])
    expect(state.selectedItemIds).toStrictEqual([0, 2])

    state.onSelect(2, 2, 'replace')
    expect(state.latest().selectedItems).toStrictEqual([item1])
    expect(state.latest().selectedItemIds).toStrictEqual([0])
    expect(state.latest().selectedItem).toStrictEqual(item1)
    expect(selectAction).toHaveBeenCalledWith(null, null, null)

    state.latest().onSelect(0, 0, 'addRemove')
    expect(state.latest().selectedItems).toStrictEqual([])
    expect(state.latest().selectedItemIds).toStrictEqual([])
    expect(state.latest().selectedItem).toStrictEqual(null)
    expect(selectAction).toHaveBeenCalledWith(null, null, null)
})

test('State class sets new block of selected items in onSelect with fromLast if select is multiple', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectedItems: [item1, item2], selectAction, selectable: 'multiple'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItems).toStrictEqual([item1, item2])

    state.onSelect(3, 3, 'fromLast')
    expect(state.latest().selectedItems).toStrictEqual([item2, item3, item4])
    expect(state.latest().selectedItemIds).toStrictEqual([1, 2, 3])
    expect(state.latest().selectedItem).toStrictEqual(item4)
    expect(selectAction).toHaveBeenCalledWith([item2, item3, item4], [1, 2, 3], [1, 2, 3])
})

test('State class sets new block of selected items in onSelect with fromLast and item before last selected', () => {
    const state = new ItemSetState({items: [idItem1, idItem2, idItem3, idItem4], selectedItems: [idItem3, idItem4], selectAction, selectable: 'multiple'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItems).toStrictEqual([idItem3, idItem4])

    state.onSelect(idItem2.id, 1, 'fromLast')
    expect(state.latest().selectedItems).toStrictEqual([idItem4, idItem3, idItem2])
    expect(state.latest().selectedItemIds).toStrictEqual([idItem4.id, idItem3.id, idItem2.id])
    expect(state.latest().selectedItem).toStrictEqual(idItem2)
    expect(selectAction).toHaveBeenCalledWith([idItem4, idItem3, idItem2], [idItem4.id, idItem3.id, idItem2.id], [3, 2, 1])
})

test('State class sets new block of selected items from first item in onSelect with fromLast if select is multiple and none selected', () => {
    const state = new ItemSetState({items: [item1, item2, item3, item4], selectAction, selectable: 'multiple'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItems).toStrictEqual([])

    state.onSelect(2, 2, 'fromLast')
    expect(state.latest().selectedItems).toStrictEqual([item1, item2, item3])
    expect(state.latest().selectedItemIds).toStrictEqual([0, 1, 2])
    expect(state.latest().selectedItem).toStrictEqual(item3)
    expect(selectAction).toHaveBeenCalledWith([item1, item2, item3], [0, 1, 2], [0, 1, 2])
})

test('Has no new selected item after onSelect if selectable is none, but selectAction is called', () => {
    const state = new ItemSetState({items: [item1, item2], selectedItems: item1, selectAction, selectable: 'none'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.selectedItem).toStrictEqual(item1)

    state.onSelect(1, 1, 'replace')
    expect(state.latest().selectedItem).toStrictEqual(item1)
    expect(selectAction).toHaveBeenCalledWith(item2, 1, 1)
})
