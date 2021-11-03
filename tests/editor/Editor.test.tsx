/**
 * @jest-environment jsdom
 */

import React from 'react'
import Editor from '../../src/editor/Editor.js'
import App from '../../src/model/App.js'
import Page from '../../src/model/Page.js'
import Text from '../../src/model/Text.js'
import {treeItemSelector, treeExpandControlSelector} from './AppStructureTree.test.js'
import {act, render, fireEvent} from '@testing-library/react'

let container: any = null;

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
    await actWait(() =>  ({container} = render(<Editor app={app}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    expect(container.querySelectorAll('div')[1].textContent).toBe("Elemento Studio")
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])
})
