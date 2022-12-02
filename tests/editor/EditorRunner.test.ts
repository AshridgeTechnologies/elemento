/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import '@testing-library/jest-dom'
import {projectFixture1} from '../testutil/projectFixtures'
import userEvent from '@testing-library/user-event'
import {actWait} from '../testutil/rtlHelpers'
import {fireEvent} from '@testing-library/react'
import EditorRunner from '../../src/editor/EditorRunner'
import {treeExpandControlSelector, treeItemSelector} from './Selectors'
import {stopSuppressingRcTreeJSDomError, suppressRcTreeJSDomError, treeItemLabels, wait} from '../testutil/testHelpers'
import {act, render} from '@testing-library/react/pure'

// Hack to get Jest 28 to work with ESM firebase
jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(),
}))
jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(),
    onAuthStateChanged: () => function unregister() {},
}))
jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(),
}))

jest.setTimeout(10000)
beforeAll(suppressRcTreeJSDomError)
afterAll(stopSuppressingRcTreeJSDomError)

let container: any, unmount: any

afterEach( async () => await act(() => {
    try{
        unmount && unmount()
    } catch(e: any) {
        if (!e.message?.match(/Cannot read properties of null \(reading 'removeEventListener'\)/)) {
            throw e
        }
    }
}))

const project = projectFixture1()

const clickExpandControl = async (...indexes: number[]) => {
    for (const index of indexes) await actWait(() => fireEvent.click(container.querySelectorAll(treeExpandControlSelector)[index]))
}

const itemLabels = () => treeItemLabels(container)
const itemElements = () => {
    const treeNodesShown = (container as HTMLDivElement).querySelectorAll(`${treeItemSelector}`)
    return Array.from(treeNodesShown)
}

test('loads project and updates it', async () => {
    await actWait(() =>  ({container, unmount} = render(createElement(EditorRunner))))

    await actWait(() => {window.setProject(project)});
    const {getProject} = window
    const user = userEvent.setup()
    await clickExpandControl(0, 1, 2)
    await actWait()
    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'A Layout', 'Other Page'])

    // @ts-ignore
    const elementId = getProject().elements[0].pages[0].elements[0].id
    expect(elementId).toBe('text_1')

    await act( () => user.click(itemElements()[4]) )

    const inputs = Array.from(container.querySelectorAll('input[type="text"]'))
    const nameInput = inputs[0] as HTMLInputElement
    // @ts-ignore
    expect(nameInput.value).toBe('Second Text')

    // @ts-ignore
    expect(getProject().elements[0].pages[0].elements[1].name).toBe('Second Text')

    await act( async () => {
        await user.clear(nameInput)
        await user.type(nameInput, 'Further Text')
    })
    // @ts-ignore
    expect(getProject().elements[0].pages[0].elements[1].name).toBe('Further Text')
    expect((nameInput).value).toBe('Further Text')

})
