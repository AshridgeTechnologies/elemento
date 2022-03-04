/**
 * @jest-environment jsdom
 */

import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import AppStructureTree, {ModelTreeItem} from '../../src/editor/AppStructureTree'
import {treeExpandControlSelector, treeItemSelector} from './Selectors'
import {
    actWait,
    suppressRcTreeJSDomError,
    treeItemLabels
} from '../testutil/testHelpers'

let container: any

const itemLabels = () => treeItemLabels(container)

const itemIcons = () => {
    const treeNodesShown = container.querySelectorAll(treeItemSelector)
    return [...treeNodesShown.values()].map( (it: any) => it.querySelector('svg').getAttribute('data-testid') )
}

const selectedItemLabel = () => {
    const treeNodesSelected = container.querySelectorAll('.rc-tree-list .rc-tree-treenode-selected')
    return [...treeNodesSelected.values()].map( (it: any) => it.textContent)[0]
}

const modelTree = new ModelTreeItem('app1', 'App One', 'App', [
    new ModelTreeItem('page_1','Main Page', 'Page', [
        new ModelTreeItem('text1_1', 'First Text', 'Text'),
        new ModelTreeItem('textInput1_2', 'The Text Input', 'TextInput'),
        new ModelTreeItem('numberInput1_2', 'The Number Input', 'NumberInput'),
        new ModelTreeItem('selectInput1_2', 'The Select Input', 'SelectInput'),
        new ModelTreeItem('trueFalseInput2_1', 'Some True-false', 'TrueFalseInput'),
        new ModelTreeItem('button2_1', 'Some Button', 'Button'),
        new ModelTreeItem('data_1_1', 'Some Data', 'Data'),
    ]),
    new ModelTreeItem('page2','Other Page', 'Page', [
        new ModelTreeItem('text2_1', 'Some Text', 'Text'),
    ])
])

beforeAll(suppressRcTreeJSDomError)

describe('ModelTreeItem', () => {
    test('finds ancestor keys of the item with a given key', () => {
        const deepTree = new ModelTreeItem('app1', 'App One', 'App', [
            new ModelTreeItem('page_1','Main Page', 'Page', [
                new ModelTreeItem('text1_1', 'First Text', 'Text'),
                new ModelTreeItem('textInput1_2', 'The Text Input', 'TextInput', [
                    new ModelTreeItem('id1', 'An item', 'Text', [
                        new ModelTreeItem('id2', 'A deeper item', 'Text')
                    ])
                ]),
            ]),
            new ModelTreeItem('page2','Other Page', 'Page', [
                new ModelTreeItem('text2_1', 'Some Text', 'Text'),
            ])
        ])

        expect(deepTree.ancestorKeysOf('app1')).toStrictEqual([])
        expect(deepTree.ancestorKeysOf('page2')).toStrictEqual(['app1'])
        expect(deepTree.ancestorKeysOf('text1_1')).toStrictEqual(['app1', 'page_1'])
        expect(deepTree.ancestorKeysOf('id1')).toStrictEqual(['app1', 'page_1', 'textInput1_2'])
        expect(deepTree.ancestorKeysOf('id2')).toStrictEqual(['app1', 'page_1', 'textInput1_2', 'id1'])
        expect(deepTree.ancestorKeysOf('non_existent')).toStrictEqual([])
        expect(deepTree.ancestorKeysOf(undefined)).toStrictEqual([])
    })

    test('knows whether it contains the item with a given key', () => {
        let item_id2, item_textInput1
        const deepTree = new ModelTreeItem('app1', 'App One', 'App', [
            new ModelTreeItem('page1','Main Page', 'Page', [
                new ModelTreeItem('text1', 'First Text', 'Text'),
                item_textInput1 = new ModelTreeItem('textInput1', 'The Text Input', 'TextInput', [
                    new ModelTreeItem('id1', 'An item', 'Text', [
                        item_id2 = new ModelTreeItem('id2', 'A deeper item', 'Text')
                    ])
                ]),
            ]),
            new ModelTreeItem('page2','Other Page', 'Page', [
                new ModelTreeItem('text2_1', 'Some Text', 'Text'),
            ])
        ])

        expect(deepTree.containsKey('app1')).toBe(false)
        expect(deepTree.containsKey('page2')).toBe(true)
        expect(deepTree.containsKey('id2')).toBe(true)

        expect(item_id2.containsKey('id2')).toBe(false)
        expect(item_id2.containsKey('textInput1')).toBe(false)

        expect(item_textInput1.containsKey('textInput1')).toBe(false)
        expect(item_textInput1.containsKey('page1')).toBe(false)
        expect(item_textInput1.containsKey('id1')).toBe(true)
        expect(item_textInput1.containsKey('id2')).toBe(true)
    })
})

test("renders tree with all types of model elements",  async () => {
    await actWait( () => ({container} = render(<AppStructureTree treeData={modelTree} onAction={jest.fn()}/>)))
    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page'])
    expect(itemIcons()).toStrictEqual(['WebIcon', 'WebIcon',])

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'The Text Input', 'The Number Input', 'The Select Input', 'Some True-false', 'Some Button', 'Some Data', 'Other Page'])
    expect(itemIcons()).toStrictEqual(['WebIcon', 'SubjectIcon', 'RectangleOutlinedIcon', 'MoneyOutlinedIcon', 'DensitySmallIcon', 'ToggleOnIcon', 'Crop75Icon', 'NoteIcon', 'WebIcon',])

})

test("can expand and collapse branches and show",  async () => {
    await actWait( () => ({container} = render(<AppStructureTree treeData={modelTree} onAction={jest.fn()}/>)))

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(itemLabels()).toContain('First Text')

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(itemLabels()).not.toContain('First Text')
})

test('notifies selected item id', async () => {
    const storeSelectedId = jest.fn()

    await actWait(() => ({container} = render(<AppStructureTree treeData={modelTree} onSelect={storeSelectedId} onAction={jest.fn()}/>)))
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))
    expect(storeSelectedId).toHaveBeenCalledWith('page_1')

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    await actWait(() => fireEvent.click(screen.getByText('The Text Input')))
    expect(storeSelectedId).toHaveBeenCalledWith('page_1')
})

test('shows selected item highlighted', async () => {
    await actWait(() => ({container} = render(<AppStructureTree treeData={modelTree} selectedItemId={'textInput1_2'} onSelect={jest.fn()} onAction={jest.fn()}/>)))
    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(itemLabels()).toContain('First Text')
    expect(selectedItemLabel()).toBe('The Text Input')
})

test('expands to show selected item highlighted', async () => {
    await actWait(() => ({container} = render(<AppStructureTree treeData={modelTree} selectedItemId={'textInput1_2'} onSelect={jest.fn()} onAction={jest.fn()}/>)))
    expect(itemLabels()).toContain('First Text')
    expect(selectedItemLabel()).toBe('The Text Input')
})

test('selects collapsed item if it contained the selected item', async () => {
    const onSelect = jest.fn()
    await actWait(() => {
        return ({container} = render(<AppStructureTree treeData={modelTree} selectedItemId={'textInput1_2'}
                                                       onSelect={onSelect} onAction={jest.fn()}/>))
    })
    expect(itemLabels()).toContain('First Text')
    expect(selectedItemLabel()).toBe('The Text Input')
    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(onSelect).toHaveBeenCalledWith('page_1')
})

test('notifies delete with item id', async () => {
    const onAction = jest.fn()

    await actWait(() => ({container} = render(<AppStructureTree treeData={modelTree} onSelect={jest.fn()} onAction={onAction}/>)))
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    await actWait(() => fireEvent.click(screen.getByText('Delete')))
    expect(onAction).not.toHaveBeenCalled()

    await actWait(() => fireEvent.click(screen.getByText('Yes', {exact: false})))
    expect(onAction).toHaveBeenCalledWith({action: 'delete', id: 'textInput1_2', itemName: 'this item'})
    expect(screen.queryByText('Delete')).toBeNull()
})

test('abandons delete if do not confirm', async () => {
    const onAction = jest.fn()

    await actWait(() => ({container} = render(<AppStructureTree treeData={modelTree} onSelect={jest.fn()} onAction={onAction}/>)))
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    await actWait(() => fireEvent.contextMenu(screen.getByText('The Text Input')))
    await actWait(() => fireEvent.click(screen.getByText('Delete')))
    expect(onAction).not.toHaveBeenCalled()

    await actWait(() => fireEvent.click(screen.getByText('No', {exact: false})))
    expect(onAction).not.toHaveBeenCalled()
    expect(screen.queryByText('Delete')).toBeNull()
})



