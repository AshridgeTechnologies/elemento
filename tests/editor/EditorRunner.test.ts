/**
 * @jest-environment jsdom
 */

import 'fake-indexeddb/auto'
import {createElement} from 'react'
import '@testing-library/jest-dom'
import {projectFixture1} from '../testutil/projectFixtures'
import userEvent from '@testing-library/user-event'
import {actWait} from '../testutil/rtlHelpers'
import {fireEvent} from '@testing-library/react'
import EditorRunner from '../../src/editor/EditorRunner'
import {treeExpandControlSelector, treeItemTitleSelector} from './Selectors'
import {
    stopSuppressingRcTreeJSDomError,
    suppressRcTreeJSDomError,
    treeItemLabels,
    waitUntil
} from '../testutil/testHelpers'
import {act, render, screen} from '@testing-library/react/pure'
import {LocalProjectStoreIDB} from '../../src/editor/LocalProjectStore'

jest.setTimeout(20000)
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

test('opens project from list of local projects and updates it and auto-saves', async () => {
    const store = new LocalProjectStoreIDB()
    await store.createProject('XYZ')
    await store.createProject('First project')
    await store.createProject('Project One')
    await store.writeProjectFile('Project One', project)

    await actWait(() => ({container, unmount} = render(createElement(EditorRunner))))
    const user = userEvent.setup()
    await user.click(screen.getByText('File'))
    await actWait(100)
    await user.click(screen.getByText('Open'))
    await actWait(100) // transition for Open Dialog
    await user.click(screen.getByText('Project One'))
    await actWait(300) // wait for project to load

    await clickExpandControl(0, 1, 2)
    await actWait(100)
    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'A Layout', 'Other Page', 'Files'])

    // @ts-ignore
    const elementId = getProject().elements[0].pages[0].elements[0].id
    expect(elementId).toBe('text_1')

    await act( () => {
        user.click(itemElements()[4])
    } )
    await actWait(500)

    const inputs = Array.from(container.querySelectorAll('input[type="text"]'))
    const nameInput = inputs[0] as HTMLInputElement
    // @ts-ignore
    expect(nameInput.value).toBe('Second Text')

    // @ts-ignore
    expect(getProject().elements[0].pages[0].elements[1].name).toBe('Second Text')

    await act( async () => {
        await user.clear(nameInput)
        await user.type(nameInput, 'Further Text')
        await user.keyboard('[Enter]')
    })
    // @ts-ignore
    expect(getProject().elements[0].pages[0].elements[1].name).toBe('Further Text')
    expect((nameInput).value).toBe('Further Text')

    await actWait(2000)  // allow for debounce time on auto-save
    const updatedProject = await store.getProject('Project One') as any
    expect(updatedProject.project.elements[0].pages[0].elements[1].name).toBe('Further Text')
})

test('creates new project and updates it and auto-saves', async () => {
    const store = new LocalProjectStoreIDB()
    await store.createProject('Project X')

    await actWait(() => ({container, unmount} = render(createElement(EditorRunner))))
    const user = userEvent.setup()
    await user.click(screen.getByText('File'))
    await actWait(100)
    await user.click(screen.getByText('New'))
    await actWait(500)
    await waitUntil( () => screen.queryByLabelText('Project Name') !== null)

    const projectNameInput = screen.getByLabelText('Project Name')
    await user.type(projectNameInput, 'Project X')
    await actWait(100)

    const errorText = () => document.querySelector('p.Mui-error')?.textContent
    expect(errorText()).toBe('There is already a project with this name')
    await user.clear(projectNameInput)
    await user.type(projectNameInput, 'Project: /2')
    expect(errorText()).toBe('Name contains invalid characters: :/')

    await user.clear(projectNameInput)
    await user.type(projectNameInput, 'The New Project')
    await user.click(screen.getByText('Create'))

    await actWait(600)  // allow for debounce time on auto-save
    const createdProject = await store.getProject('The New Project') as any
    expect(createdProject.project.elements[0].pages[0].name).toBe('Main Page')
    expect(container.querySelector('.MuiTypography-h6').textContent).toBe('Elemento Studio - The New Project')

    await clickExpandControl(0, 1)
    await actWait()
    expect(itemLabels()).toStrictEqual(['New Project', 'New App', 'Main Page', 'Files'])

    // @ts-ignore
    const elementId = getProject().elements[0].pages[0].id
    expect(elementId).toBe('page_1')

    await act( () => {
        user.click(itemElements()[2])
    } )
    await actWait(500)

    const inputs = Array.from(container.querySelectorAll('input[type="text"]'))
    const nameInput = inputs[0] as HTMLInputElement
    // @ts-ignore
    expect(nameInput.value).toBe('Main Page')

    // @ts-ignore
    expect(getProject().elements[0].pages[0].name).toBe('Main Page')

    await act( async () => {
        await user.clear(nameInput)
        await user.type(nameInput, 'Page One')
        await user.keyboard('[Enter]')
    })
    // @ts-ignore
    expect(getProject().elements[0].pages[0].name).toBe('Page One')
    expect((nameInput).value).toBe('Page One')

    const newPageName = async () => ((await store.getProject('The New Project')) as any).project.elements[0].pages[0].name
    await waitUntil(async () => await newPageName() === 'Page One')
})
