/**
 * @jest-environment jsdom
 */

import React from 'react'
import {act, render, fireEvent} from '@testing-library/react'

import AppStructureTree, {ModelTreeItem} from '../../src/editor/AppStructureTree.js'

export const treeItemSelector = 'button.rct-tree-item-button'
export const treeExpandControlSelector = 'div.rct-tree-item-arrow-hasChildren'

let container: any

const wait = (time: number) => new Promise(resolve => setInterval(resolve, time) )
const actWait = async (testFn: () => void) => {
    await act(async ()=> {
        testFn()
        await wait(20)
    })
}
const itemLabels = () => {
    const treeNodesShown = container.querySelectorAll(treeItemSelector)
    return [...treeNodesShown.values()].map( (it: any) => it.textContent)
}
const modelTree = new ModelTreeItem('app1', 'App One', [
    new ModelTreeItem('page1','Main Page', [
        new ModelTreeItem('text1_1', 'First Text'),
        new ModelTreeItem("text1_2", 'Second Text'),
    ]),
    new ModelTreeItem('page2','Other Page', [
        new ModelTreeItem("text2_1", 'Some Text'),
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



