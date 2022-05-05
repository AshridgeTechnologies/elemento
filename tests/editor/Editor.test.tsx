/**
 * @jest-environment jsdom
 */

import React from 'react'
import Editor from '../../src/editor/Editor'
import {act, fireEvent, render, screen, within} from '@testing-library/react/pure'
import {ElementType} from '../../src/model/Types'
import {startCase} from 'lodash'
import {ex, stopSuppressingRcTreeJSDomError, suppressRcTreeJSDomError, treeItemLabels} from '../testutil/testHelpers'
import Page from '../../src/model/Page'
import TextInput from '../../src/model/TextInput'
import App from '../../src/model/App'
import {projectFixture1, projectFixture2} from '../testutil/projectFixtures'
import Project from '../../src/model/Project'
import {treeExpandControlSelector} from './Selectors'
import {generate} from '../../src/generator/Generator'

import * as authentication from '../../src/shared/authentication'

jest.mock('../../src/shared/authentication')

let container: any = null, unmount: any

const itemLabels = () => treeItemLabels(container)
const clickExpandControl = (...indexes: number[]) => clickExpandControlFn(container)(...indexes)

const project = projectFixture1()

const onPropertyChange = ()=> {}
const onAction = jest.fn()
const onInsert = ()=> '123'

const wait = (time: number): Promise<void> => new Promise(resolve => setInterval(resolve, time))
const actWait = async (testFn: () => void) => {
    await act(async () => {
        testFn()
        await wait(20)
    })
}
const clickExpandControlFn = (container: any) => async (...indexes: number[]) => {
    for (const index of indexes) await actWait(() => fireEvent.click(container.querySelectorAll(treeExpandControlSelector)[index]))
}

beforeAll(suppressRcTreeJSDomError)
afterAll(stopSuppressingRcTreeJSDomError)

function mockSignedInValue(signedInValue: boolean) {
    const mock_useSignedInState = authentication.useSignedInState as jest.MockedFunction<any>
    mock_useSignedInState.mockReturnValue(signedInValue)
}

afterEach( async () => await act(() => {
    try{
        unmount && unmount()
    } catch(e: any) {
        if (!e.message?.match(/Cannot read properties of null \(reading 'removeEventListener'\)/)) {
            throw e
        }
    }
}))

test("renders tree with app elements",  async () => {
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await clickExpandControl(0, 1, 2)
    expect(container.querySelector('.MuiTypography-h6').textContent).toBe("Elemento Studio")
    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'Other Page'])
})

test('shows Text element selected in tree in property editor', async () => {
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await clickExpandControl(0, 1, 2)

    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'Other Page'])

    fireEvent.click(screen.getByText('Second Text'))

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement
    expect(nameInput.value).toBe('Second Text')
})

test('property kind button state does not leak into other properties', async () => {
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await clickExpandControl(0, 1, 2)

    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'Other Page'])

    fireEvent.click(screen.getByText('Second Text'))

    const contentInput = () => container.querySelector('.property-input button') as HTMLInputElement
    expect(contentInput().textContent).toBe('fx=')
    fireEvent.click(contentInput())
    expect(contentInput().textContent).toBe('abc')

    fireEvent.click(screen.getByText('First Text'))
    expect(contentInput().textContent).toBe('fx=')
})

test('shows TextInput element selected in tree in property editor', async () => {
    await actWait(() =>  ({container, unmount} = render(<Editor project={projectFixture2()} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await clickExpandControl(0, 1, 3)

    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'Other Page', 'Some Text', 'Another Text Input', 'Button 2'])

    fireEvent.click(screen.getByText('Another Text Input'))

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement
    expect(nameInput.value).toBe('Another Text Input')

    const initialValueInput = screen.getByLabelText('Initial Value') as HTMLInputElement
    expect(initialValueInput.value).toBe('"Type the text"')

    const maxLengthInput = screen.getByLabelText('Max Length') as HTMLInputElement
    expect(maxLengthInput.value).toBe('50')
})

test('shows errors for properties', async () => {
    const projectWithErrors = new Project('pr1', 'Project Bad', {}, [new App('app1', 'App One', {}, [
        new Page('page_1', 'Main Page', {}, [
            new TextInput('textInput_1', 'First Text Input', {initialValue: ex`"A text value" + `, maxLength: ex`BadName + 30`}),
        ]),
    ]) ])
    await actWait(() =>  ({container, unmount} = render(<Editor project={projectWithErrors} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    // await actWait(() =>  fireEvent.click(container.querySelectorAll(treeExpandControlSelector)[0]))
    await clickExpandControl(0, 1, 2)

    expect(itemLabels()).toStrictEqual(['Project Bad', 'App One', 'Main Page', 'First Text Input'])

    fireEvent.click(screen.getByText('First Text Input'))
    const initialValueInput = screen.getByLabelText('Initial Value') as HTMLInputElement
    expect(initialValueInput.value).toBe('"A text value" + ')
    const initialValueError = container.querySelector(`[id="initialValue-helper-text"]`)
    expect(initialValueError.textContent).toBe('Error: Line 1: Unexpected end of input')

    const maxLengthInput = screen.getByLabelText('Max Length') as HTMLInputElement
    expect(maxLengthInput.value).toBe('BadName + 30')
    const maxLengthError = container.querySelector(`[id="maxLength-helper-text"]`)
    expect(maxLengthError.textContent).toBe('Unknown names: BadName')
})

test('shows allowed items in insert menu', async () => {
    const optionsShown = () => screen.queryByTestId('insertMenu') && within(screen.getByTestId('insertMenu')).queryAllByRole('menuitem').map( el => el.textContent)
    const warningMessage = () => screen.getByTestId('insertWarning')

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    fireEvent.click(screen.getByText('Insert'))
    expect(optionsShown()).toBeNull()
    expect(warningMessage().textContent).toMatch(/Please select/)

    await clickExpandControl(0, 1, 2)

    fireEvent.click(screen.getByText('Second Text'))
    fireEvent.click(screen.getByText('Insert'))
    expect(optionsShown()).toStrictEqual(['Text', 'Text Input', 'Number Input','Select Input', 'True False Input', 'Button', 'List', 'Data', 'Collection'])

    fireEvent.click(screen.getByText('Main Page'))
    fireEvent.click(screen.getByText('Insert'))
    expect(optionsShown()).toStrictEqual(['Text', 'Text Input', 'Number Input','Select Input', 'True False Input', 'Button', 'List', 'Data', 'Collection', 'Page'])
})

test.each(['Text', 'TextInput', 'NumberInput','SelectInput', 'TrueFalseInput', 'Button', 'List', 'Data', 'Collection'])
    (`notifies insert of %s with item selected in tree and selects new item`, async (elementType) => {
    let onInsertArgs: any
    const notionalNewElementId = 'text_1'
    const onInsert = (selectedItemId: string, elementType: ElementType) => {
        onInsertArgs = [selectedItemId, elementType]
        return notionalNewElementId
    }

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.click(screen.getByText('Second Text'))
    fireEvent.click(screen.getByText('Insert'))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(elementType)))

    expect(onInsertArgs).toStrictEqual(['text_2', elementType])
    const idInput = screen.getByLabelText('Id') as HTMLInputElement
    expect(idInput.value).toBe(notionalNewElementId)
})

test(`notifies insert of Page with item selected in tree and selects new item`, async () => {
    let onInsertArgs: any
    const notionalNewElementId = 'page_2'
    const onInsert = (selectedItemId: string, elementType: ElementType) => {
        onInsertArgs = [selectedItemId, elementType]
        return notionalNewElementId
    }

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.click(screen.getByText('Main Page'))
    fireEvent.click(screen.getByText('Insert'))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText('Page'))

    expect(onInsertArgs).toStrictEqual(['page_1', 'Page'])
    // const idInput = screen.getByLabelText('Id') as HTMLInputElement
    // expect(idInput.value).toBe(notionalNewElementId)
})

test('notifies open request', async () => {
    let opened: boolean = false
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction} onOpen={() => opened = true}/>)))
    fireEvent.click(screen.getByText('File'))
    fireEvent.click(screen.getByText('Open'))
    expect(opened).toBe(true)
})

test('notifies save request', async () => {
    let saved: boolean = false
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction} onSave={() => saved = true}/>)))
    fireEvent.click(screen.getByText('File'))
    fireEvent.click(screen.getByText('Save'))
    expect(saved).toBe(true)
})

test('notifies publish request if logged in', async () => {
    const onPublish = jest.fn()
    const editor = () => <Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}
                                 onPublish={onPublish}/>
    mockSignedInValue(true)
    await actWait(() =>  ({container, unmount} = render(editor())))
    fireEvent.click(screen.getByText('File'))
    fireEvent.click(screen.getByText('Publish'))
    expect(onPublish).toHaveBeenCalledWith({name: 'App One', code: generate(project.elementArray()[0] as App).code})
})

test('publish disabled if not logged in', async () => {
    const onPublish = jest.fn()
    const editor = () => <Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}
                                 onPublish={onPublish}/>
    mockSignedInValue(false)
    await actWait(() =>  ({container, unmount} = render(editor())))
    fireEvent.click(screen.getByText('File'))
    fireEvent.click(screen.getByText('Publish - please Login'))
    expect(onPublish).not.toHaveBeenCalled()
})

test(`notifies tree action with item selected in tree`, async () => {
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await clickExpandControl(0, 1, 2)

    await actWait(() => fireEvent.contextMenu(screen.getByText('Second Text')))
    await actWait(() => fireEvent.click(screen.getByText('Delete')))
    await actWait(() => fireEvent.click(screen.getByText('Yes', {exact: false})))

    expect(onAction).toHaveBeenCalledWith('text_2', 'delete')
})

test('has iframe for running app', async () => {
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))

    const appFrame = container.querySelector('iframe[name="appFrame"]')
    expect(appFrame.src).toMatch(/.*\/run\/editorPreview$/)
})
