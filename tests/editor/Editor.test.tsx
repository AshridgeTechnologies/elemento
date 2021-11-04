/**
 * @jest-environment jsdom
 */

import React from 'react'
import Editor from '../../src/editor/Editor'
import App from '../../src/model/App'
import Page from '../../src/model/Page'
import Text from '../../src/model/Text'
import {treeExpandControlSelector, treeItemSelector} from './Selectors'
import {act, fireEvent, render, screen} from '@testing-library/react'

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
const app = new App('app1', 'App One', {}, [
    new Page('page1','Main Page', {}, [
        new Text('text1_1', 'First Text',  {contentExpr: '"The first bit of text"'}),
        new Text("text1_2", 'Second Text', {contentExpr: '"The second bit of text"'}),
    ]),
    new Page('page2','Other Page', {}, [
        new Text("text2_1", 'Some Text', {contentExpr: '"Some text here"'}),
    ])
])

const onPropertyChange = (id: string, propertyName: string, value: any)=> {}


test("renders tree with app elements",  async () => {
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    expect(container.querySelectorAll('div')[1].textContent).toBe("Elemento Studio")
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])
})

test('shows element selected in tree in property editor', async () => {
    // const {container} = render(<Editor app={app}/>)
    // await wait(20)
    // const expandControl = await waitFor(() => container.querySelector(treeExpandControlSelector))
    // expect(expandControl).not.toBeNull()
    // fireEvent.click(expandControl as Element)

    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])

    fireEvent.click(screen.getByText('Second Text'))

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement
    expect(nameInput.value).toBe('Second Text')

})
