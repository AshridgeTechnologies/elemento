import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
/**
 * @vitest-environment jsdom
 */

import 'fake-indexeddb/auto'
import React, {createElement} from 'react'

import {projectFixture1} from '../testutil/projectFixtures'
import userEvent from '@testing-library/user-event'
import {actWait} from '../testutil/rtlHelpers'
import {fireEvent} from '@testing-library/react'
// import EditorRunner from '../../src/editor/EditorRunner'
import {treeExpandControlSelector, treeItemTitleSelector} from './Selectors'
import {stopSuppressingRcTreeJSDomError, suppressRcTreeJSDomError, treeItemLabels} from '../testutil/testHelpers'
import {act, render} from '@testing-library/react/pure'

vi.setConfig({ testTimeout: 20_000 })
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
    const treeNodesShown = (container as HTMLDivElement).querySelectorAll(`${treeItemTitleSelector}`)
    return Array.from(treeNodesShown)
}

function EditorRunner() { return null }
test('dummy', ()=> {})
test.skip('loads project and updates it', async () => {
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

test.skip('has iframe for running app', async () => {

    // await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={project} previewUrl='http://thepreview.co'/>)))
    //
    // const appFrame = container.querySelector('iframe[name="appFrame"]')
    // expect(appFrame.src).toBe('http://thepreview.co/')

    // await(wait(1000))
    // expect(appFrame.appCode).toEqual('some code')
})

test.skip('shows link to run published app if provided', async () => {
    // const theRunUrl = 'http://example.com/run/gh/xyz/123'
    // await actWait(() => ({container, unmount} = render(<EditorTestWrapper project={project} runUrl={theRunUrl}/>)))
    // const runLink = container.querySelector('#runLink')
    // expect(runLink.textContent).toBe(theRunUrl)
    // expect(runLink.href).toBe(theRunUrl)
})
