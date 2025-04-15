/**
 * @jest-environment jsdom
 */

import React from 'react'
import {act, fireEvent, render, screen} from '@testing-library/react/pure'

import AppStructureTree, {ModelTreeItem} from '../../src/editor/AppStructureTree'
import {treeExpandControlSelector, treeItemTitleSelector, treeNodeSelector, treeWrapperSelector} from './Selectors'
import {
    stopSuppressingRcTreeJSDomError,
    suppressRcTreeJSDomError,
    treeItemClassNames,
    treeItemLabels,
    treeItemTitleClassNames
} from '../testutil/testHelpers'
import {InsertPosition} from '../../src/model/Types'
import lodash from 'lodash'; const {startCase} = lodash;
import {actWait} from '../testutil/rtlHelpers'
import {AppElementAction, ConfirmAction} from '../../src/editor/Types'
import {zipToObject} from 'radash'

let container: any, unmount: any

const clickExpandControlFn = (container: any) => async (...indexes: number[]) => {
    for (const index of indexes) await actWait(() => fireEvent.click(container.querySelectorAll(treeExpandControlSelector)[index]))
}
const clickExpandControl = (...indexes: number[]) => clickExpandControlFn(container)(...indexes)

const itemLabels = () => treeItemLabels(container)

const itemIcons = () => {
    const treeNodesShown = container.querySelectorAll(treeWrapperSelector)
    return [...treeNodesShown.values()].map( (it: any) => it.querySelector('.material-icons').textContent )
}

const itemTitleClassNames = () => treeItemTitleClassNames(container)

const selectedItemLabel = () => {
    const treeNodesSelected = container.querySelectorAll('.rc-tree-list .rc-tree-treenode-selected .rc-tree-title')
    return [...treeNodesSelected.values()].map( (it: any) => it.textContent)[0]
}

const noOp = jest.fn()

const standardActionsAvailable = () => [
    'insert',
    new ConfirmAction('delete'),
    'copy', 'cut', 'pasteAfter', 'pasteBefore', 'pasteInside', 'duplicate'] as AppElementAction[]
const fileActionsAvailable = () => ['upload'] as AppElementAction[]
const toolActionsAvailable = () => ['show', ...standardActionsAvailable()] as AppElementAction[]

const defaultFunctions = {onAction: noOp, insertMenuItemFn: noOp, onInsert: noOp, onMove: noOp, onShow: noOp, actionsAvailableFn: standardActionsAvailable}

const modelTree = new ModelTreeItem('project_1', 'Project One', 'Project', "project_icon", false, false, [
    new ModelTreeItem('app1', 'App One', 'App', "app_icon", false, false, [
        new ModelTreeItem('page_1', 'Main Page', 'Page', "page_icon", false, false, [
            new ModelTreeItem('text1_1', 'First Text', 'Text', "text_icon"),
            new ModelTreeItem('textInput1_2', 'The Text Input', 'TextInput', "text_input_icon", true),
            new ModelTreeItem('numberInput1_2', 'The Number Input', 'NumberInput', "number_input_icon"),
            new ModelTreeItem('selectInput1_2', 'The Select Input', 'SelectInput', "select__icon"),
            new ModelTreeItem('trueFalseInput2_1', 'Some True-false', 'TrueFalseInput', "true_false_icon"),
            new ModelTreeItem('button2_1', 'Some Button', 'Button', "button_icon"),
            new ModelTreeItem('menu_1', 'Some Menu', 'Menu', "menu_icon"),
            new ModelTreeItem('menuItem_1', 'Some Menu Item', 'MenuItem', "menu_item_icon"),
            new ModelTreeItem('list1_1', 'The List', 'List', "list_icon"),
            new ModelTreeItem('data_1_1', 'Some Data', 'Data', "data_icon"),
            new ModelTreeItem('collection_1_1', 'A Collection', 'Collection', "collection_icon"),
            new ModelTreeItem('block_1_1', 'A Block', 'Block', "block_icon"),
            new ModelTreeItem('function_1_1', 'A Function', 'Function', "function_icon"),
        ]),
        new ModelTreeItem('page_2', 'Other Page', 'Page', "page_icon", false, false, [
            new ModelTreeItem('text2_1', 'Some Text', 'Text', "text_icon"),
        ]),
        new ModelTreeItem('memoryDataStore_2', 'The Data Store', 'MemoryDataStore', "mds_icon"),
        new ModelTreeItem('fileDataStore_2', 'The File Data Store', 'FileDataStore', "fds_icon"),
        new ModelTreeItem('appBar1', 'The App Bar', 'AppBar', "appbar_icon")
    ]),
    new ModelTreeItem('_FILES', 'Files', 'FileFolder', "ff_icon", false, false, [
        new ModelTreeItem('file_1', 'Duck.jpg', 'File', "file_icon"),
        new ModelTreeItem('file_2', 'Rules.pdf', 'File', "file_icon"),
    ]),
    new ModelTreeItem('_TOOLS', 'Tools', 'ToolFolder', "tf_icon", false, false, [
        new ModelTreeItem('tool_1', 'Do Stuff', 'Tool', "tool_icon"),
        new ModelTreeItem('tool2_2', 'Check Stuff', 'Tool', "tool_icon"),
    ])
])

const treeWithErrorsAndSearchResults = new ModelTreeItem('project_1', 'Project One', 'Project', "an_icon", false, false, [
    new ModelTreeItem('app1', 'App One', 'App', "an_icon", false, false, [
        new ModelTreeItem('page1', 'Main Page', 'Page', "an_icon", false, true, [
            new ModelTreeItem('text1', 'First Text', 'Text', "an_icon"),
            new ModelTreeItem('textInput1', 'The Text Input', 'TextInput', "an_icon", true, false, [
                new ModelTreeItem('id1', 'An item', 'Text', "an_icon", true, false, [
                    new ModelTreeItem('id2', 'A deeper item', 'Text', "an_icon", false, true)
                ])
            ]),
        ]),
        new ModelTreeItem('page_2', 'Other Page', 'Page', "an_icon", false, false, [
            new ModelTreeItem('text2_1', 'Some Text', 'Text', "an_icon"),
        ])
    ])])

beforeAll(suppressRcTreeJSDomError)
afterAll(stopSuppressingRcTreeJSDomError)

afterEach( async () => await act(() => {
    try{
        unmount && unmount()
    } catch(e: any) {
        if (!e.message?.match(/Cannot read properties of null \(reading 'removeEventListener'\)/)) {
            throw e
        }
    }
}))

describe('ModelTreeItem', () => {
    let item_id2: ModelTreeItem, item_textInput1: ModelTreeItem
    const deepTree = new ModelTreeItem('project_1', 'Project One', 'Project', "an_icon", false, false, [
        new ModelTreeItem('app1', 'App One', 'App', "an_icon", false, false, [
            new ModelTreeItem('page1', 'Main Page', 'Page', "an_icon", false, false, [
                new ModelTreeItem('text1', 'First Text', 'Text', "an_icon"),
                item_textInput1 = new ModelTreeItem('textInput1', 'The Text Input', 'TextInput', "an_icon", false, false, [
                    new ModelTreeItem('id1', 'An item', 'Text', "an_icon", false, false, [
                        item_id2 = new ModelTreeItem('id2', 'A deeper item', 'Text', "an_icon")
                    ])
                ]),
            ]),
            new ModelTreeItem('page_2', 'Other Page', 'Page', "an_icon", false, false, [
                new ModelTreeItem('text2_1', 'Some Text', 'Text', "an_icon"),
            ])
        ])])

    test('finds ancestor keys of the item with a given key', () => {

        expect(deepTree.ancestorKeysOf('project_1')).toStrictEqual([])
        expect(deepTree.ancestorKeysOf('app1')).toStrictEqual(['project_1'])
        expect(deepTree.ancestorKeysOf('page_2')).toStrictEqual(['project_1', 'app1'])
        expect(deepTree.ancestorKeysOf('text1')).toStrictEqual(['project_1', 'app1', 'page1'])
        expect(deepTree.ancestorKeysOf('id1')).toStrictEqual(['project_1', 'app1', 'page1', 'textInput1'])
        expect(deepTree.ancestorKeysOf('id2')).toStrictEqual(['project_1', 'app1', 'page1', 'textInput1', 'id1'])
        expect(deepTree.ancestorKeysOf('non_existent')).toStrictEqual([])
        expect(deepTree.ancestorKeysOf(undefined)).toStrictEqual([])
    })

    test('knows whether it contains the item with a given key', () => {

        expect(deepTree.containsKey('project_1')).toBe(false)
        expect(deepTree.containsKey('app1')).toBe(true)
        expect(deepTree.containsKey('xxx')).toBe(false)
        expect(deepTree.containsKey('page_2')).toBe(true)
        expect(deepTree.containsKey('id2')).toBe(true)

        expect(item_id2.containsKey('id2')).toBe(false)
        expect(item_id2.containsKey('textInput1')).toBe(false)

        expect(item_textInput1.containsKey('textInput1')).toBe(false)
        expect(item_textInput1.containsKey('page1')).toBe(false)
        expect(item_textInput1.containsKey('id1')).toBe(true)
        expect(item_textInput1.containsKey('id2')).toBe(true)
    })

    test('knows whether it or children have errors', () => {
        const errorsForItem = (id: string) => {
            const item = treeWithErrorsAndSearchResults.findItem(id) as ModelTreeItem
            return [item.hasErrors, item.hasChildErrors(), item.className]
        }
        expect(errorsForItem('project_1')).toStrictEqual([false, true, 'rc-tree-child-error'])
        expect(errorsForItem('app1')).toStrictEqual([false, true, 'rc-tree-child-error'])
        expect(errorsForItem('page1')).toStrictEqual([false, true, 'rc-tree-child-error rc-tree-search-result'])
        expect(errorsForItem('text1')).toStrictEqual([false, false, ''])
        expect(errorsForItem('textInput1')).toStrictEqual([true, true, 'rc-tree-error rc-tree-child-error'])
        expect(errorsForItem('id1')).toStrictEqual([true, false, 'rc-tree-error'])
        expect(errorsForItem('id2')).toStrictEqual([false, false, 'rc-tree-search-result'])
        expect(errorsForItem('page_2')).toStrictEqual([false, false, ''])
        expect(errorsForItem('text2_1')).toStrictEqual([false, false, ''])
    })

    test('finds the item with a given key', () => {
        expect(deepTree.findItem('project_1')).toHaveProperty('_title', 'Project One')
        expect(deepTree.findItem('app1')).toHaveProperty('_title', 'App One')
        expect(deepTree.findItem('page_2')).toHaveProperty('_title', 'Other Page')
        expect(deepTree.findItem('id2')).toHaveProperty('_title', 'A deeper item')
        expect(deepTree.findItem('xxx')).toBe(null)
    })
})

test("renders tree with all types of model elements",  async () => {
    ({container, unmount} = render(<AppStructureTree treeData={modelTree} {...defaultFunctions}/>))
    await clickExpandControl(0, 1)
    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'Other Page', 'The Data Store', 'The File Data Store', 'The App Bar', 'Files', 'Duck.jpg', 'Rules.pdf', 'Tools', 'Do Stuff', 'Check Stuff'])
    expect(itemIcons()).toStrictEqual([  "project_icon", "app_icon", "page_icon", "page_icon", "mds_icon", "fds_icon", "appbar_icon", "ff_icon", "file_icon", "file_icon", "tf_icon", "tool_icon", "tool_icon"])
    await clickExpandControl(2)
    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'The Text Input', 'The Number Input', 'The Select Input', 'Some True-false', 'Some Button', 'Some Menu', 'Some Menu Item', 'The List', 'Some Data', 'A Collection', 'A Block', 'A Function', 'Other Page', 'The Data Store', 'The File Data Store', 'The App Bar', 'Files', 'Duck.jpg', 'Rules.pdf', 'Tools', 'Do Stuff', 'Check Stuff'])
    expect(itemIcons()).toStrictEqual(["project_icon", "app_icon", "page_icon", "text_icon", "text_input_icon", "number_input_icon", "select__icon", "true_false_icon", "button_icon", "menu_icon", "menu_item_icon", "list_icon", "data_icon", "collection_icon", "block_icon", "function_icon", "page_icon", "mds_icon", "fds_icon", "appbar_icon", "ff_icon", "file_icon", "file_icon", "tf_icon", "tool_icon", "tool_icon"])
})

test("renders tree with error and search result classes",  async () => {
    ({container, unmount} = render(<AppStructureTree treeData={treeWithErrorsAndSearchResults} {...defaultFunctions}/>))
    await clickExpandControl(0, 1, 2, 4, 5)
    const classNamesByLabel = zipToObject(itemLabels(), itemTitleClassNames())
    const hasSearchResult = (label: string) => classNamesByLabel[label].includes('rc-tree-search-result')
    const hasChildError = (label: string) => classNamesByLabel[label].includes('rc-tree-child-error')
    const hasOwnError = (label: string) => classNamesByLabel[label].includes('rc-tree-error')
    const hasOwnErrorOnly = (label: string) => !hasChildError(label)  && hasOwnError(label)
    const hasChildErrorOnly = (label: string) => hasChildError(label)  && !hasOwnError(label)
    const hasOwnAndChildError = (label: string) => hasChildError(label)  && hasOwnError(label)
    const hasNoError = (label: string) => !hasChildError(label)  && !hasOwnError(label)

    expect(hasChildError('Project One')).toBe(true)
    expect(hasOwnError('Project One')).toBe(false)
    expect(hasChildErrorOnly('Project One')).toBe(true)
    expect(hasChildErrorOnly('App One')).toBe(true)
    expect(hasChildErrorOnly('Main Page')).toBe(true)
    expect(hasOwnAndChildError('The Text Input')).toBe(true)
    expect(hasOwnErrorOnly('An item')).toBe(true)
    expect(hasNoError('A deeper item')).toBe(true)
    expect(hasNoError('Other Page')).toBe(true)
    expect(hasSearchResult('Main Page')).toBe(true)
    expect(hasSearchResult('Other Page')).toBe(false)
    expect(hasSearchResult('A deeper item')).toBe(true)
    expect(hasSearchResult('First Text')).toBe(false)
})

test("can expand and collapse branches and show",  async () => {
    await actWait( () => ({container, unmount} = render(<AppStructureTree treeData={modelTree} {...defaultFunctions}/>)))

    await clickExpandControl(0, 1, 2)
    expect(itemLabels()).toContain('First Text')

    await clickExpandControl(2)
    expect(itemLabels()).not.toContain('First Text')
})

test("always shows Project and App expanded",  async () => {
    await actWait( () => ({container, unmount} = render(<AppStructureTree treeData={modelTree} {...defaultFunctions}/>)))

    expect(itemLabels()).toContain('Main Page')

    await clickExpandControl(0)
    expect(itemLabels()).toContain('Main Page')

    await clickExpandControl(1)
    expect(itemLabels()).toContain('Main Page')
})

test('notifies new selected item id in array', async () => {
    const storeSelectedIds = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={[]} onSelect={storeSelectedIds} {...defaultFunctions}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.click(screen.getByText('The Text Input')))
    expect(storeSelectedIds).toHaveBeenLastCalledWith(['textInput1_2'])
})

test('notifies replacement selected item id in array', async () => {
    const storeSelectedIds = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['page_1']} onSelect={storeSelectedIds} {...defaultFunctions}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.click(screen.getByText('The Text Input')))
    expect(storeSelectedIds).toHaveBeenLastCalledWith(['textInput1_2'])
})

test('notifies replacement selected item id in array when already selected', async () => {
    const storeSelectedIds = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['textInput1_2']} onSelect={storeSelectedIds} {...defaultFunctions}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.click(screen.getByText('The Text Input')))
    expect(storeSelectedIds).toHaveBeenLastCalledWith(['textInput1_2'])
})

test('notifies replacement selected item id when multiple already selected', async () => {
    const storeSelectedIds = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['app1', 'page_1']} onSelect={storeSelectedIds} {...defaultFunctions}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.click(screen.getByText('The Text Input')))
    expect(storeSelectedIds).toHaveBeenLastCalledWith(['textInput1_2'])
})

test('notifies replacement selected item id when multiple already selected including one clicked', async () => {
    const storeSelectedIds = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['page_1', 'textInput1_2']} onSelect={storeSelectedIds} {...defaultFunctions}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.click(screen.getByText('The Text Input')))
    expect(storeSelectedIds).toHaveBeenLastCalledWith(['textInput1_2'])
})

test.each(['metaKey', 'ctrlKey'])('notifies new selected item id in array with %s', async (keyName) => {
    const storeSelectedIds = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={[]} onSelect={storeSelectedIds} {...defaultFunctions}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.click(screen.getByText('The Text Input'), {[keyName]: true}))
    expect(storeSelectedIds).toHaveBeenLastCalledWith(['textInput1_2'])
})

test.each(['metaKey', 'ctrlKey'])('notifies additional selected item id in array with %s', async (keyName) => {
    const storeSelectedIds = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['page_1']} onSelect={storeSelectedIds} {...defaultFunctions}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.click(screen.getByText('The Text Input'), {[keyName]: true}))
    expect(storeSelectedIds).toHaveBeenLastCalledWith(['page_1', 'textInput1_2'])
})

test('unselects already selected item id in array with ctrl key', async () => {
    const storeSelectedIds = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['textInput1_2']} onSelect={storeSelectedIds} {...defaultFunctions}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.click(screen.getByText('The Text Input'), {ctrlKey: true}))
    expect(storeSelectedIds).toHaveBeenLastCalledWith([])
})

test('unselects already selected item id when multiple selected', async () => {
    const storeSelectedIds = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['page_1', 'textInput1_2']} onSelect={storeSelectedIds} {...defaultFunctions}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.click(screen.getByText('The Text Input'), {ctrlKey: true}))
    expect(storeSelectedIds).toHaveBeenLastCalledWith(['page_1'])
})

test('shows selected item highlighted', async () => {
    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['project_1']} onSelect={noOp} {...defaultFunctions}/>)))
    expect(itemLabels()).toContain('Project One')
    expect(selectedItemLabel()).toBe('Project One')
})

test('expands to show selected item highlighted', async () => {
    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['textInput1_2']} onSelect={noOp} {...defaultFunctions}/>)))
    expect(itemLabels()).toContain('First Text')
    expect(selectedItemLabel()).toBe('The Text Input')
})

test('selects collapsed item if it contained the selected item', async () => {
    const onSelect = jest.fn()
    await actWait(() => {
        return ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['textInput1_2']}
                                                       onSelect={onSelect} {...defaultFunctions}/>))
    })
    expect(itemLabels()).toContain('First Text')
    expect(selectedItemLabel()).toBe('The Text Input')
    await clickExpandControl(1)
    expect(onSelect).toHaveBeenCalledWith(['app1'])
})

test.each(['before', 'after', 'inside'])('notifies insert %s with position, item id, element type then closes menu', async (position) => {
    const onInsert = jest.fn()
    const itemsFn = jest.fn().mockReturnValue(['Text', 'Text Input', 'Number Input'])

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} onSelect={jest.fn()} {...defaultFunctions} onInsert={onInsert} insertMenuItemFn={itemsFn}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    await actWait(() => fireEvent.click(screen.getByText(`Insert`)))
    await actWait(() => fireEvent.click(screen.getByText(startCase(position))))
    expect(onInsert).not.toHaveBeenCalled()

    await actWait(() => fireEvent.click(screen.getByText('Text Input')))
    expect(onInsert).toHaveBeenCalledWith(position, 'textInput1_2', 'TextInput')
    expect(screen.queryByText(`Insert ${position}`)).toBeNull()
})

test('only shows insert menu items if there are items to insert in that position', async () => {
    const onInsert = jest.fn()
    const itemsFn = jest.fn().mockImplementation( (position: InsertPosition) => (position === 'after' || position === 'before') ? ['Text'] : [])

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree}{...defaultFunctions} onInsert={onInsert}
                                                                         insertMenuItemFn={itemsFn}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    await actWait(() => fireEvent.click(screen.getByText(`Insert`)))
    expect(screen.queryByText(`Before`, {exact: true})).not.toBeNull()
    expect(screen.queryByText(`After`, {exact: true})).not.toBeNull()
    expect(screen.queryByText(`Inside`, {exact: true})).toBeNull()
})

test('notifies insert Tool', async () => {
    const onInsert = jest.fn()
    const itemsFn = jest.fn().mockReturnValue(['Tool'])

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree}{...defaultFunctions} onInsert={onInsert}
                                                                         insertMenuItemFn={itemsFn}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('Tools')))
    await actWait(() => fireEvent.click(screen.getByText(`Insert`)))
    await actWait(() => fireEvent.click(screen.getByText(`Inside`)))
    expect(onInsert).not.toHaveBeenCalled()

    await actWait(() => fireEvent.click(screen.getByText('Tool')))
    expect(onInsert).toHaveBeenCalledWith('inside', '_TOOLS', 'Tool')
    expect(screen.queryByText(`Insert inside`)).toBeNull()
})

test('notifies show Tool', async () => {
    const onAction = jest.fn()
    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree}{...defaultFunctions}
                                                                         actionsAvailableFn={toolActionsAvailable} onAction={onAction} />)))
    await clickExpandControl(1)
    await actWait(() => fireEvent.contextMenu(screen.getByText('Check Stuff')))
    await actWait(() => fireEvent.click(screen.getByText(`Show`)))
    expect(onAction).toHaveBeenCalledWith(['tool2_2'], 'show')
})

test('notifies copy with clicked item id if not selected', async () => {
    const onAction = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['page_1']}
                                                                         {...defaultFunctions} onAction={onAction} />)))
    await clickExpandControl(0, 1)
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await clickExpandControl(2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    await actWait(() => fireEvent.click(screen.getByText('Copy')))
    expect(onAction).toHaveBeenCalledWith(['textInput1_2'], 'copy')
})

test.each(['copy', 'cut', 'duplicate'])('notifies %s with multiple selected item ids', async (action) => {
    const onAction = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['page_1', 'page_2']}
                                                                         {...defaultFunctions} onAction={onAction} />)))
    await clickExpandControl(0, 1)
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await actWait(() => fireEvent.contextMenu(screen.getByText('Main Page')))
    await actWait(() => fireEvent.click(screen.getByText(startCase(action))))
    expect(onAction).toHaveBeenCalledWith(['page_1', 'page_2'], action)
})

test.each([['pasteAfter', 'Paste After'],['pasteBefore', 'Paste Before'],['pasteInside', 'Paste Inside'],])
        ('notifies %s with id of clicked item', async (action, actionLabel) => {
    const onAction = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} {...defaultFunctions} onAction={onAction}/>)))
    await clickExpandControl(0, 1)
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await clickExpandControl(2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    await actWait(() => fireEvent.click(screen.getByText(actionLabel)))
    expect(onAction).toHaveBeenCalledWith(['textInput1_2'], action)
})

test('notifies delete with clicked item id', async () => {
    const onAction = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} {...defaultFunctions} onAction={onAction}/>)))
    await clickExpandControl(0, 1)
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await clickExpandControl(2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    await actWait(() => fireEvent.click(screen.getByText('Delete')))
    expect(onAction).not.toHaveBeenCalled()

    await actWait(() => fireEvent.click(screen.getByText('Yes', {exact: false})))
    expect(onAction).toHaveBeenCalledWith(['textInput1_2'], 'delete')
    expect(screen.queryByText('Delete')).toBeNull()
})

test('notifies delete with all selected item ids if one is clicked', async () => {
    const onAction = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree}  selectedItemIds={['textInput1_2', 'numberInput1_2']} {...defaultFunctions} onAction={onAction} />)))
    await clickExpandControl(0, 1)
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await clickExpandControl(2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    await actWait(() => fireEvent.click(screen.getByText('Delete')))
    expect(onAction).not.toHaveBeenCalled()

    const yesOption = screen.getByText('Yes', {exact: false})
    expect(yesOption.textContent).toBe('Yes - delete The Text Input, The Number Input')
    await actWait(() => fireEvent.click(yesOption))
    expect(onAction).toHaveBeenCalledWith(['textInput1_2', 'numberInput1_2'], 'delete')
    expect(screen.queryByText('Delete')).toBeNull()
})

test('abandons delete if do not confirm', async () => {
    const onAction = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} {...defaultFunctions} onAction={onAction} />)))
    await clickExpandControl(0, 1)
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await clickExpandControl(2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    await actWait(() => fireEvent.click(screen.getByText('Delete')))
    expect(onAction).not.toHaveBeenCalled()

    await actWait(() => fireEvent.click(screen.getByText('No - go back', {exact: false})))
    expect(onAction).not.toHaveBeenCalled()
    expect(screen.queryByText('Delete')).toBeNull()
})

test('abandons insert if do not select an item', async () => {
    const onInsert = jest.fn()
    const itemsFn = jest.fn().mockReturnValue(['Text', 'Text Input', 'Number Input'])

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} {...defaultFunctions} onInsert={onInsert} insertMenuItemFn={itemsFn} />)))
    await clickExpandControl(0, 1)
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await clickExpandControl(2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    await actWait(() => fireEvent.click(screen.getByText('Insert')))
    expect(onInsert).not.toHaveBeenCalled()

    await actWait(() => fireEvent.click(document.body.querySelector('#insertMenu .MuiBackdrop-root')!))
    expect(onInsert).not.toHaveBeenCalled()

    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    expect(container.querySelector('#insertMenu')).toBeNull()
})

test('notifies upload for files folder with clicked item id if not selected', async () => {
    const onAction = jest.fn()

    await actWait(() => ({container, unmount} = render(<AppStructureTree treeData={modelTree} selectedItemIds={['page_1']}
                                                                         {...defaultFunctions} actionsAvailableFn={fileActionsAvailable} onAction={onAction} />)))
    await clickExpandControl(0, 1)
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await actWait(() => fireEvent.contextMenu(screen.getByText('Files')))
    expect(screen.queryByText('Insert inside')).toBeNull()
    await actWait(() => fireEvent.click(screen.getByText('Upload')))
    expect(onAction).toHaveBeenCalledWith(['_FILES'], 'upload')
})




