/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import AppStructureTree, {ModelTreeItem} from '../../src/editor/AppStructureTree.js'


let container: any = null;
beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
})

export const treeItemSelector = 'button.rct-tree-item-button'
export const treeExpandControlSelector = 'div.rct-tree-item-arrow-hasChildren'

const wait = (time: number) => new Promise(resolve => setInterval(resolve, time) )
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
    await act(async () => {
        render(<AppStructureTree treeData={modelTree}/>, container)
        await wait(20)
    })

    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page'])
})

test("can expand and collapse branches",  async () => {
    await act(async () => {
        render(<AppStructureTree treeData={modelTree}/>, container)
        await wait(20)
    })

    await act(async () => {
        const expandControl = container.querySelector(treeExpandControlSelector)
        expandControl.click()
        await wait(20)
    })

    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])

    await act(async () => {
        const collapseControl = container.querySelector(treeExpandControlSelector)
        collapseControl.click()
        await wait(20)
    })

    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page'])

})



