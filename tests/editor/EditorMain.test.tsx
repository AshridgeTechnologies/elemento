/**
 * @jest-environment jsdom
 */

import React from 'react'
import {treeExpandControlSelector, treeItemSelector} from './Selectors'
import userEvent from '@testing-library/user-event'
import Project from '../../src/model/Project'
import {projectFixture1} from '../testutil/projectFixtures'
import {fireEvent, act} from '@testing-library/react'
import {wait} from '../testutil/rtlHelpers'
import {treeItemLabels} from '../testutil/testHelpers'

let container: HTMLDivElement

beforeEach(() => {
    container = document.createElement('div');
    container.id = 'main';
    document.body.appendChild(container);
})

afterEach(() => {
    if (container !== null) document.body.removeChild(container);
})

jest.setTimeout(20 * 1000 * 1000)

const actWait = async (testFn: () => any) => {
    let result
    await act(async ()=> {
        result = await testFn()
    })
    await act( () => wait(20) )

    return result
}

const clickExpandControl = async (...indexes: number[]) => {
    for (const index of indexes) await actWait(() => fireEvent.click(container.querySelectorAll(treeExpandControlSelector)[index]))
}

const itemLabels = () => treeItemLabels(container)

const itemElements = () => {
    const treeNodesShown = (container as HTMLDivElement).querySelectorAll(`${treeItemSelector}`)
    return Array.from(treeNodesShown)
}

let theProject = projectFixture1()

test('renders editor and updates project', async () => {
    let project
    let setProject: (project:Project) => void
    await actWait(async () => ({project, setProject} = (await import('../../src/editor/EditorMain'))))
    await actWait(async () => setProject(theProject))

    const user = userEvent.setup()
    await clickExpandControl(0, 1, 2)
    await wait(500)
    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'Other Page'])

    // @ts-ignore
    const elementId = project().elements[0].pages[0].elements[0].id
    expect(elementId).toBe('text_1')

    await user.click(itemElements()[4])

    const inputs = Array.from(container.querySelectorAll('input[type="text"]'))
    const nameInput = inputs[1] as HTMLInputElement
    // @ts-ignore
    expect(nameInput.value).toBe('Second Text')

    // @ts-ignore
    expect(project().elements[0].pages[0].elements[1].name).toBe('Second Text')

    await user.clear(nameInput)
    await user.type(nameInput, 'Further Text')
    await actWait( () => {})
    // @ts-ignore
    expect(project().elements[0].pages[0].elements[1].name).toBe('Further Text')
    expect((nameInput).value).toBe('Further Text')
})

test.skip('loads project from JSON string', async () => {
    let project
    let setProject: (project: Project) => void
    await actWait(async () => ({project, setProject} = (await import('../../src/editor/EditorMain'))))
    await actWait(async () => setProjectFromJSONString(JSON.stringify(theProject)))

    const user = userEvent.setup()
    await clickExpandControl(0, 1, 2)
    await wait(500)
    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'Other Page'])

    // @ts-ignore
    const elementId = project().elements[0].elements[0].elements[0].id
    expect(elementId).toBe('text_1')

})