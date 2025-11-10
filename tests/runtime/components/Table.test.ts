/**
 * @vitest-environment jsdom
 */
import {beforeEach, expect, MockedFunction, test, vi} from 'vitest'
import {Table} from '../../../src/runtime/components/index'
import {testAppStoreHook, wait} from '../../testutil/testHelpers'
import {containerFunctions} from '../../testutil/rtlHelpers'
import {DateType, DecimalType, NumberType, RecordType, TextType, TrueFalseType} from '../../../src/runtime/types'
import {render} from '@testing-library/react/pure'
import {VirtuosoMockContext} from 'react-virtuoso'
import React, {createElement} from 'react'
import {isArray} from 'lodash'
import {ComponentStateStore} from '../../../src/runtime/state/BaseComponentState'
import {StoreProvider} from '../../../src/runtime/state/StoreContext'
import userEvent from '@testing-library/user-event'
import BigNumber from 'bignumber.js'

let tableData: any, longTableData: any, tableDataNoIds: any, advancedTableData: any, selectAction: MockedFunction<any>

const tableDataType = new RecordType('tableType', {}, [], [
    new TextType('id'),
    new TextType('text'),
    new NumberType('amount'),
])

const advancedTableDataType= new RecordType('advancedTableType', {}, [], [
    new TextType('id'),
    new DateType('startDate'),
    new DecimalType('amount'),
    new TrueFalseType('complete'),
])

const wrappedTestElement = <StateType>(componentClass: React.FunctionComponent<any>): [any, any] => {

    const appStoreHook = testAppStoreHook()

    const testElementCreatorFn = (path: string, componentProps: any = {}, ...children: React.ReactNode[]) => {
        const component = isArray(children)
            ? createElement(componentClass as any, {path, ...componentProps}, ...children)
            : createElement(componentClass as any, {path, ...componentProps}, children)
        const appStoreToUse = componentProps.appStore ?? new ComponentStateStore()
        appStoreHook.store = appStoreToUse
        return createElement(StoreProvider, {appStore: appStoreToUse, children:component}
        )
    }
    return [testElementCreatorFn, appStoreHook]
}
const [table, appStoreHook] = wrappedTestElement(Table)

const stateAt = (path: string) => appStoreHook.stateAt(path)

beforeEach(() => {
    tableData = [{id: 'id1', text: 'where are you?', amount: 10}, {id: 'id2', text: 'over here!', amount: 20}]
    longTableData = [{id: 'id1', text: 'One', amount: 1}, {id: 'id2', text: 'Two', amount: 2}, {id: 'id3', text: 'Three', amount: 3}, {id: 'id4', text: 'Four', amount: 4}]
    tableDataNoIds = [{Label: 'No 1', text: 'where are you?'}, {Label: 'No 2', text: 'over here!'}]
    advancedTableData = [
        {id: 'id1', startDate: new Date('2020-01-02'), amount: new BigNumber('12.34'), complete: false},
        {id: 'id2', startDate: new Date('2020-01-03'), amount: new BigNumber('99.9'), complete: true},
        {id: 'id3', startDate: null, amount: null, complete: null},
    ]
    selectAction = vi.fn()
})

const renderComponent = (component: any) => {
    return render(component, {
            wrapper: ({children}) => (
                React.createElement(VirtuosoMockContext.Provider, {value: {viewportHeight: 300, itemHeight: 100}}, children)
            )
        }
    )
}

const snapshot = (component: any) => {
    const {container} = renderComponent(component)
    expect(container).toMatchSnapshot()
}

test('correctly renders table', () => {
    snapshot(table('app.page1.table1', {dataType: tableDataType, items: tableData,
        rowStyles: () => ({color: 'red', width: 300})
    }))
})

test('applies styles to outer container where necessary', () => {
    snapshot(table('app.page1.table1', {dataType: tableDataType, items: tableData,
        styles: {height: 'red', width: 300, border: '1px solid black', fontSize: 20}
    }))
})

test('produces output if items have no ids', () => {
    snapshot(table('app.page1.table1', {dataType: tableDataType, items: tableDataNoIds, rowStyles: () => ({color: 'red', width: 200}) }))
})

test('shows single selectedItem as selected', () => {
    snapshot(table('app.page1.table1', {dataType: tableDataType, selectedItems: tableData[1], items: tableData}))
})

test('shows items with no ids', () => {
    snapshot(table('app.page1.table1', {dataType: tableDataType, selectedItems: tableDataNoIds[1], items: tableDataNoIds}))
})

test('shows only first selectedItem as selected if no ids when given zero as index', async () => {
    snapshot(table('app.page1.table1', {items: tableDataNoIds, dataType: tableDataType, selectedItems: 0}))
})

test('produces empty output if items is null but there is a selected item, as may happen when refreshing data', () => {
    snapshot(table('app.page1.table1', {items: null, dataType: tableDataType, selectedItems: tableData[1]}))
})

test('produces output when an item is null', () => {
    const items = [{id: 'id1', text: 'One'}, null, {id: 'id3', text: 'Three'}]
    snapshot(table('app.page1.table1', {items: items, dataType: tableDataType, selectedItems: items[2]}))
})

test('produces output with advanced data types', () => {
    const items = [{id: 'id1', text: 'One'}, null, {id: 'id3', text: 'Three'}]
    snapshot(table('app.page1.table1', {items: advancedTableData, dataType: advancedTableDataType, selectedItems: items[2]}))
})

test('updates its selectedItem in the app state if no select action supplied', async () => {
    const {container} = renderComponent(table('app.page1.table1', {items: tableData, dataType: tableDataType, selectable: 'single'}))
    await wait(10)
    const {user, el} = containerFunctions(container)

    const tableItem0El = el`table tbody tr:first-child td:first-child`
    await user.click(tableItem0El)
    expect(stateAt('app.page1.table1').selectedItem).toStrictEqual(tableData[0])
})

test('updates its selectedItem in the app state and calls select action with correct arguments', async () => {
    const {container} = renderComponent(table('app.page1.table77', {items: tableData, dataType: tableDataType, selectAction}))
    const {el, user}  = containerFunctions(container)
    // expect(stateAt('app.page1.table1').selectedItem).toBe(null)
    const tableItem1El = el`table tbody tr:nth-child(2) td:first-child`
    await user.click(tableItem1El)
    await wait()
    expect(stateAt('app.page1.table77').selectedItem).toStrictEqual(tableData[1])
    expect(selectAction).toHaveBeenCalledWith(tableData[1], 'id2', 1)
})

test('adds to selectedItems in the app state with Control key', async () => {
    const {container} = renderComponent(table('app.page1.table1', {items: longTableData, dataType: tableDataType, selectAction, selectedItems: 1, selectable: 'multiple'}))
    const {el, user}  = containerFunctions(container)
    const tableItem0El = el`table tbody tr:nth-child(1) td:first-child`
    await user.keyboard('[ControlLeft>]')
    await user.click(tableItem0El)
    await wait(50)
    expect(stateAt('app.page1.table1').selectedItems).toStrictEqual([longTableData[1], longTableData[0]])
    expect(selectAction).toHaveBeenCalledWith([longTableData[0]], ['id1'], [0])
})

test('selects a block in the app state with Shift key', async () => {
    const {container} = renderComponent(table('app.page1.table1', {items: longTableData, dataType: tableDataType, selectAction, selectedItems: 2, selectable: 'multiple'}))
    const {el, user}  = containerFunctions(container)
    const tableItem0El = el`table tbody tr:first-child td:first-child`
    await user.keyboard('[ShiftLeft>]')
    await user.click(tableItem0El)
    expect(stateAt('app.page1.table1').selectedItems).toStrictEqual([longTableData[2], longTableData[1], longTableData[0]])
    expect(selectAction).toHaveBeenCalledWith([longTableData[2], longTableData[1], longTableData[0]], ['id3', 'id2', 'id1'], [2, 1, 0])
})

test('updates the selectedItem when it changes', async () => {
    const {container} = renderComponent(table('app.page1.table66', {items: tableData, dataType: tableDataType}))
    const {el, user, renderThe}  = containerFunctions(container)
    const tableItem0El = el`table tbody tr:first-child td:first-child`
    await user.click(tableItem0El)
    expect(stateAt('app.page1.table66').selectedItem).toStrictEqual(tableData[0])

    const updatedTableData = [{id: 'id1', text: 'new text'}, tableData[1]]
    renderThe(table('app.page1.table66', {items: updatedTableData, appStore: appStoreHook.store}))
    await wait(20)
    expect(stateAt('app.page1.table66').selectedItem).toBe(updatedTableData[0])
})

test('does not update its selectedItem if not selectable but does call select action', async () => {
    const {container} = renderComponent(table('app.page1.table1', {items: tableData, dataType: tableDataType, selectable: 'none', selectAction}))
    const tableItem0El = container.querySelector('table tbody tr:first-child td:first-child')
    const user = userEvent.setup()
    await user.click(tableItem0El!)
    await wait(20)
    expect(selectAction).toHaveBeenCalledWith(tableData[0], 'id1', 0)
    expect(stateAt('app.page1.table1').selectedItem).toBe(null)
})
