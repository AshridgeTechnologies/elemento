/**
 * @jest-environment jsdom
 */

import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import AppStructureTree, {ModelTreeItem} from '../../src/editor/AppStructureTree'
import {treeExpandControlSelector, treeItemSelector} from './Selectors'
import {actWait, treeItemLabels} from '../util/testHelpers'

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
    new ModelTreeItem('page1','Main Page', 'Page', [
        new ModelTreeItem('text1_1', 'First Text', 'Text'),
        new ModelTreeItem('textInput1_2', 'Second Text', 'TextInput'),
    ]),
    new ModelTreeItem('page2','Other Page', 'Page', [
        new ModelTreeItem('text2_1', 'Some Text', 'Text'),
    ])
])

test("renders tree with model elements",  async () => {
    await actWait( () => ({container} = render(<AppStructureTree treeData={modelTree} onAction={jest.fn()}/>)))
    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page'])
    expect(itemIcons()).toStrictEqual(['WebIcon', 'WebIcon',])
})

test("can expand and collapse branches",  async () => {
    await actWait( () => ({container} = render(<AppStructureTree treeData={modelTree} onAction={jest.fn()}/>)))

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])
    expect(itemIcons()).toStrictEqual(['WebIcon', 'SubjectIcon', 'RectangleOutlinedIcon', 'WebIcon',])

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page'])
})

test('notifies selected item id', async () => {
    const storeSelectedId = jest.fn()

    await actWait(() => ({container} = render(<AppStructureTree treeData={modelTree} onSelect={storeSelectedId} onAction={jest.fn()}/>)))
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))
    expect(storeSelectedId).toHaveBeenCalledWith('page1')

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    await actWait(() => fireEvent.click(screen.getByText('Second Text')))
    expect(storeSelectedId).toHaveBeenCalledWith('page1')
})

test('shows selected item highlighted', async () => {
    await actWait(() => ({container} = render(<AppStructureTree treeData={modelTree} selectedItemId={'textInput1_2'} onSelect={jest.fn()} onAction={jest.fn()}/>)))
    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])
    expect(selectedItemLabel()).toBe('Second Text')
})

test('notifies delete with item id', async () => {
    const onAction = jest.fn()

    await actWait(() => ({container} = render(<AppStructureTree treeData={modelTree} onSelect={jest.fn()} onAction={onAction}/>)))
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    await actWait(() => fireEvent.contextMenu(screen.getByText('Second Text')))
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
    await actWait(() => fireEvent.contextMenu(screen.getByText('Second Text')))
    await actWait(() => fireEvent.click(screen.getByText('Delete')))
    expect(onAction).not.toHaveBeenCalled()

    await actWait(() => fireEvent.click(screen.getByText('No', {exact: false})))
    expect(onAction).not.toHaveBeenCalled()
    expect(screen.queryByText('Delete')).toBeNull()
})



