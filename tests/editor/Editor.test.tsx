/**
 * @jest-environment jsdom
 */

import React from 'react'
import Editor from '../../src/editor/Editor'
import {treeExpandControlSelector, treeItemSelector} from './Selectors'
import {act, fireEvent, render, screen, within} from '@testing-library/react'
import {appFixture1, appFixture2} from '../util/appFixtures'
import {ElementType} from '../../src/model/Types'
import {startCase} from 'lodash'

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
const app = appFixture1()


const onPropertyChange = ()=> {}
const onInsert = ()=> '123'


test("renders tree with app elements",  async () => {
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    expect(container.querySelectorAll('div')[1].textContent).toBe("Elemento Studio")
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])
})

test('shows Text element selected in tree in property editor', async () => {
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])

    fireEvent.click(screen.getByText('Second Text'))

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement
    expect(nameInput.value).toBe('Second Text')
})

test('shows TextInput element selected in tree in property editor', async () => {
    await actWait(() =>  ({container} = render(<Editor app={appFixture2()} onChange={onPropertyChange} onInsert={onInsert}/>)))
    await actWait(() =>  fireEvent.click(container.querySelectorAll(treeExpandControlSelector)[1]))

    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page', 'Some Text', 'Another Text Input'])

    fireEvent.click(screen.getByText('Another Text Input'))

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement
    expect(nameInput.value).toBe('Another Text Input')

    const initialValueInput = screen.getByLabelText('Initial Value') as HTMLInputElement
    expect(initialValueInput.value).toBe('"Type the text"')

    const maxLengthInput = screen.getByLabelText('Max Length') as HTMLInputElement
    expect(maxLengthInput.value).toBe('50')
})


const testInsert = (elementType: ElementType) => test(`notifies insert of ${elementType} with item selected in tree and selects new item`, async () => {
    let onInsertArgs: any
    const notionalNewElementId = 'text_1'
    const onInsert = (selectedItemId: string, elementType: ElementType) => {
        onInsertArgs = [selectedItemId, elementType]
        return notionalNewElementId
    }

    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    fireEvent.click(screen.getByText('Second Text'))
    fireEvent.click(screen.getByText('Insert'))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(elementType)))

    expect(onInsertArgs).toStrictEqual(['text_2', elementType])
    const idInput = screen.getByLabelText('Id') as HTMLInputElement
    expect(idInput.value).toBe(notionalNewElementId)
})

testInsert('Text')
testInsert('TextInput')

test('has iframe for running app', async () => {
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert}/>)))

    const appFrame = container.querySelector('iframe[name="appFrame"]')
    expect(appFrame.src).toMatch(/.*\/runtime\/app.html$/)
})
