/**
 * @jest-environment jsdom
 */

import React from 'react'
import {treeExpandControlSelector, treeItemSelector} from './Selectors'
import {act} from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'

let container: HTMLDivElement;

beforeEach(() => {
    container = document.createElement('div');
    container.id = 'main';
    document.body.appendChild(container);
})

afterEach(() => {
    if (container !== null) document.body.removeChild(container);
})

const wait = (time: number) => new Promise(resolve => setInterval(resolve, time) )
const actWait = async (testFn: () => any) => {
    let result
    await act(async ()=> {
        result = await testFn()
        await wait(20)
    })
    return result
}

const itemLabels = () => {
    const treeNodesShown = (container as HTMLDivElement).querySelectorAll(treeItemSelector)
    return Array.from(treeNodesShown).map( (it: any) => it.textContent)
}

const itemElements = () => {
    const treeNodesShown = (container as HTMLDivElement).querySelectorAll(treeItemSelector)
    return Array.from(treeNodesShown)
}

test('renders editor and updates test app', async () => {
    let app
    await actWait(async () => app = (await import('../../src/editor/EditorMain')).app );
    await actWait(() => userEvent.click(container.querySelector(treeExpandControlSelector) as Element))
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])

    // @ts-ignore
    const elementId = app().pages[0].elements[0].id
    expect(elementId).toBe('text1_1')

    userEvent.click(itemElements()[2])

    const inputs = Array.from(container.querySelectorAll('input[type="text"]'))
    const nameInput = inputs[1] as HTMLInputElement
    // @ts-ignore
    expect(nameInput.value).toBe('Second Text')

    // @ts-ignore
    expect(app().pages[0].elements[1].name).toBe('Second Text')

    userEvent.clear(nameInput)
    userEvent.type(nameInput, 'Further Text')
    await actWait( () => {})
    // @ts-ignore
    expect(app().pages[0].elements[1].name).toBe('Further Text')
    expect((nameInput).value).toBe('Further Text')
})