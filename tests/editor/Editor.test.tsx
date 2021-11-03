/**
 * @jest-environment jsdom
 */

import React from 'react'
import Editor from '../../src/editor/Editor.js'
import App from '../../src/model/App.js'
import Page from '../../src/model/Page.js'
import Text from '../../src/model/Text.js'
import {treeItemSelector, treeExpandControlSelector} from './AppStructureTree.test.js'

import {render, unmountComponentAtNode} from "react-dom";
import {act} from "react-dom/test-utils";


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

const wait = (time: number) => new Promise(resolve => setInterval(resolve, time) )

const itemLabels = () => {
    const treeNodesShown = container.querySelectorAll(treeItemSelector)
    return [...treeNodesShown.values()].map( (it: any) => it.textContent)
}
const app = new App('app1', 'App One', [
    new Page('page1','Main Page', [
        new Text('text1_1', 'First Text', '"The first bit of text"'),
        new Text("text1_2", 'Second Text', '"The second bit of text"'),
    ]),
    new Page('page2','Other Page', [
        new Text("text2_1", 'Some Text', '"Some text here"'),
    ])
])

test("renders tree with app elements",  async () => {
    await act(async () => {
        render(<Editor app={app}/>, container)
        await wait(20)
        container.querySelector(treeExpandControlSelector).click()
        await wait(20)
    })

    expect(container.querySelectorAll('div')[1].textContent).toBe("Elemento Studio")
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])
})
