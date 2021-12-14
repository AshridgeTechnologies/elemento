/**
 * @jest-environment jsdom
 */

import React from 'react'
import {act, fireEvent, render, screen} from '@testing-library/react'

import AppStructureTree, {ModelTreeItem} from '../../src/editor/AppStructureTree'
import {treeExpandControlSelector, treeItemSelector} from './Selectors'
import {actWait, treeItemLabels} from '../util/testHelpers'

let container: any

const itemLabels = () => treeItemLabels(container)

const selectedItemLabel = () => {
    const treeNodesSelected = container.querySelectorAll('.rc-tree-list .rc-tree-treenode-selected')
    return [...treeNodesSelected.values()].map( (it: any) => it.textContent)[0]
}

const modelTree = new ModelTreeItem('app1', 'App One', [
    new ModelTreeItem('page1','Main Page', [
        new ModelTreeItem('text1_1', 'First Text'),
        new ModelTreeItem('text1_2', 'Second Text'),
    ]),
    new ModelTreeItem('page2','Other Page', [
        new ModelTreeItem('text2_1', 'Some Text'),
    ])
])

test("renders tree with model elements",  async () => {
    await actWait( () => ({container} = render(<AppStructureTree treeData={modelTree}/>)))
    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page'])
})

test("can expand and collapse branches",  async () => {
    await actWait( () => ({container} = render(<AppStructureTree treeData={modelTree}/>)))

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page'])
})

test('notifies selected item id', async () => {
    let selectedId: string = ''
    const storeSelectedId = (id: string) => selectedId = id

    await actWait(() => ({container} = render(<AppStructureTree treeData={modelTree} onSelect={storeSelectedId}/>)))
    await actWait(() => fireEvent.click(screen.getByText('Main Page')))
    expect(selectedId).toBe('page1')

    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    await actWait(() => fireEvent.click(screen.getByText('Second Text')))
    expect(selectedId).toBe('text1_2')
})

test('shows selected item highlighted', async () => {
    let selectedId: string = ''
    const storeSelectedId = (id: string) => selectedId = id
    await actWait(() => ({container} = render(<AppStructureTree treeData={modelTree} selectedItemId={'text1_2'} onSelect={storeSelectedId}/>)))
    await actWait(() => fireEvent.click(container.querySelector(treeExpandControlSelector)))
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])
    expect(selectedItemLabel()).toBe('Second Text')
})


