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
});
const wait = (time: number) => new Promise(resolve => setInterval(resolve, time) )

test("renders tree with app elements",  async () => {
    const app = new App('app1', 'App One', [
        new Page('page1','Main Page', [
            new Text('text1_1', 'First Text', '"The first bit of text"'),
            new Text("text1_2", 'Second Text', '"The second bit of text"'),
        ]),
        new Page('page2','Other Page', [
            new Text("text2_1", 'Some Text', '"Some text here"'),
        ])
    ])

    await act(async () => {
        render(<Editor app={app}/>, container)
        await wait(20)
    })

    expect(container.querySelectorAll('div')[1].textContent).toBe("Elemento Studio")
    const treeNodesShown = container.querySelectorAll('li[role="treeitem"]')
    const itemLabels = [...treeNodesShown.values()].map( (it: any) => it.textContent)
    expect(itemLabels).toStrictEqual(['Main Page', 'Other Page'])
});

