/**
 * @jest-environment jsdom
 */

import React from 'react'
// import renderer from 'react-test-renderer'
import Editor from '../../src/editor/Editor.js'
import App from '../../src/model/App.js'
import Page from '../../src/model/Page.js'
import Text from '../../src/model/Text.js'

import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";


let container: any = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
})

const wait = (time: number) => new Promise(resolve => setInterval(resolve, time) )
const itemLabels = () => {
    const treeNodesShown = container.querySelectorAll('button.rct-tree-item-button')
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
    })

    expect(container.querySelectorAll('div')[1].textContent).toBe("Elemento Studio")
    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page'])
})

test("can expand and collapse branches",  async () => {
    await act(async () => {
        render(<Editor app={app}/>, container)
        await wait(20)
    })

    await act(async () => {
        const expandControl = container.querySelector('div.rct-tree-item-arrow-hasChildren')
        expandControl.click()
        await wait(20)
    })

    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])

    await act(async () => {
        const collapseControl = container.querySelector('div.rct-tree-item-arrow-hasChildren')
        collapseControl.click()
        await wait(20)
    })

    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page'])

})



