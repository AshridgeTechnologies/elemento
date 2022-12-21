/**
 * @jest-environment jsdom
 */

import React from 'react'
import Editor from '../../src/editor/Editor'
import {act, fireEvent, render, screen, within} from '@testing-library/react/pure'
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
import { actWait } from '../testutil/rtlHelpers'

jest.mock('../../src/shared/authentication')

let container: any = null, unmount: any

const itemLabels = () => treeItemLabels(container)
const clickExpandControl = (...indexes: number[]) => clickExpandControlFn(container)(...indexes)

const project = projectFixture1()

const onChange = ()=> {}
const onAction = jest.fn()
const onMove = jest.fn()
const onSaveToGitHub = jest.fn()
const onGetFromGitHub = jest.fn()
const onUpdateFromGitHub = jest.fn()
const onInsert = ()=> '123'

const onFunctions = {onChange, onAction, onMove, onInsert, onSaveToGitHub, onGetFromGitHub, onUpdateFromGitHub}

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
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} projectStoreName='Stored Project' {...onFunctions} />)))
    await clickExpandControl(0, 1, 2)
    expect(container.querySelector('.MuiTypography-h6').textContent).toBe('Elemento Studio - Stored Project')
    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'A Layout', 'Other Page'])
})

test('shows Text element selected in tree in property editor', async () => {
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions}/>)))
    await clickExpandControl(0, 1, 2)

    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'A Layout', 'Other Page'])

    fireEvent.click(screen.getByText('Second Text'))

    const nameInput = container.querySelector('#name') as HTMLInputElement
    expect(nameInput.value).toBe('Second Text')
})

test('property kind button state does not leak into other properties', async () => {
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions}/>)))
    await clickExpandControl(0, 1, 2)

    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'A Layout', 'Other Page'])

    fireEvent.click(screen.getByText('Second Text'))

    const contentInput = () => container.querySelector('.property-input button') as HTMLInputElement
    expect(contentInput().textContent).toBe('fx=')
    fireEvent.click(contentInput())
    expect(contentInput().textContent).toBe('abc')

    fireEvent.click(screen.getByText('First Text'))
    expect(contentInput().textContent).toBe('fx=')
})

test('shows TextInput element selected in tree in property editor', async () => {
    await actWait(() =>  ({container, unmount} = render(<Editor project={projectFixture2()} {...onFunctions}/>)))
    await clickExpandControl(0, 1, 3)

    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'Other Page', 'Some Text', 'Another Text Input', 'Button 2'])

    fireEvent.click(screen.getByText('Another Text Input'))

    const nameInput = container.querySelector('#name') as HTMLInputElement
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
    await actWait(() =>  ({container, unmount} = render(<Editor project={projectWithErrors} {...onFunctions}/>)))
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

test('shows allowed items in context insert menu of a page item', async () => {
    const optionsShown = () => screen.queryByTestId('insertMenu') && within(screen.getByTestId('insertMenu')).queryAllByRole('menuitem').map( el => el.textContent)

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('Second Text')))
    await actWait(() => fireEvent.click(screen.getByText('Insert before')))

    expect(optionsShown()).toStrictEqual(['Text', 'Text Input', 'Number Input','Select Input', 'True False Input', 'Button', 'Icon', 'User Logon', 'Menu', 'List', 'Data', 'Function', 'Collection', 'Layout'])
})

test('shows allowed items in menu bar insert menu', async () => {
    const optionsShown = () => screen.queryByTestId('insertMenu') && within(screen.getByTestId('insertMenu')).queryAllByRole('menuitem').map( el => el.textContent)
    const warningMessage = () => screen.getByTestId('insertWarning')

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions}/>)))
    fireEvent.click(screen.getByText('Insert'))
    expect(optionsShown()).toBeNull()
    expect(warningMessage().textContent).toMatch(/Please select/)

    await clickExpandControl(0, 1, 2)

    fireEvent.click(screen.getByText('Second Text'))
    fireEvent.click(screen.getByText('Insert'))
    expect(optionsShown()).toStrictEqual(['Text', 'Text Input', 'Number Input','Select Input', 'True False Input', 'Button', 'Icon', 'User Logon', 'Menu', 'List', 'Data',  'Function', 'Collection', 'Layout'])

    fireEvent.click(screen.getByText('Main Page'))
    fireEvent.click(screen.getByText('Insert'))
    expect(optionsShown()).toStrictEqual(['App Bar', 'Page', 'File Data Store', 'Browser Data Store', 'Firestore Data Store', 'Memory Data Store', 'Function', 'Collection', 'Server App Connector'])
})

test.each(['Text', 'TextInput', 'NumberInput','SelectInput', 'TrueFalseInput', 'Button', 'Menu', 'List', 'Data', 'Collection', 'Layout', 'Function'])
    (`notifies insert of %s with item selected in tree and selects new item`, async (elementType) => {
    const notionalNewElementId = 'text_1'
    const onInsert = jest.fn().mockReturnValue(notionalNewElementId)

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onInsert={onInsert}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.click(screen.getByText('Second Text'))
    fireEvent.click(screen.getByText('Insert'))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(elementType)))

    expect(onInsert).toHaveBeenCalledWith('after', 'text_2', elementType)
    const idText = screen.getByTestId('elementId') as HTMLElement
    expect(idText.textContent).toBe(notionalNewElementId)
})

test.each([['Text', 'before'], ['TextInput', 'after']])
    (`notifies context menu insert of %s %s item in tree and selects new item`, async (elementType, position) => {
    const notionalNewElementId = 'text_1'
    const onInsert = jest.fn().mockReturnValue(notionalNewElementId)

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onInsert={onInsert}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.contextMenu(screen.getByText('Second Text'))
    fireEvent.click(screen.getByText(`Insert ${position}`))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(elementType)))

    expect(onInsert).toHaveBeenCalledWith(position, 'text_2', elementType)
    const idText = screen.getByTestId('elementId') as HTMLElement
    expect(idText.textContent).toBe(notionalNewElementId)
})

test.each([['NumberInput', 'inside']])
    (`notifies context menu insert of %s %s item in tree and selects new item`, async (elementType, position) => {
    const notionalNewElementId = 'text_1'
    const onInsert = jest.fn().mockReturnValue(notionalNewElementId)

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onInsert={onInsert}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.contextMenu(screen.getByText('Main Page'))
    fireEvent.click(screen.getByText(`Insert ${position}`))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(elementType)))

    expect(onInsert).toHaveBeenCalledWith(position, 'page_1', elementType)
    const idText = screen.getByTestId('elementId') as HTMLElement
    expect(idText.textContent).toBe(notionalNewElementId)
})

test(`notifies insert of Page with item selected in tree and selects new item`, async () => {
    const notionalNewElementId = 'page_2'
    const onInsert = jest.fn().mockReturnValue(notionalNewElementId)

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onInsert={onInsert}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.click(screen.getByText('Main Page'))
    fireEvent.click(screen.getByText('Insert'))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText('Page'))

    expect(onInsert).toHaveBeenCalledWith('after', 'page_1', 'Page')
})

test(`notifies insert of AppBar with item selected in tree and selects new item`, async () => {
    const notionalNewElementId = 'page_2'
    const onInsert = jest.fn().mockReturnValue(notionalNewElementId)

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onInsert={onInsert}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.click(screen.getByText('Main Page'))
    fireEvent.click(screen.getByText('Insert'))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText('App Bar'))

    expect(onInsert).toHaveBeenCalledWith('after', 'page_1', 'AppBar')
})

test(`notifies insert of DataStore under the App and selects new item`, async () => {
    const notionalNewElementId = 'dataStore_2'
    const onInsert = jest.fn().mockReturnValue(notionalNewElementId)

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onInsert={onInsert}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.click(screen.getByText('Other Page'))
    fireEvent.click(screen.getByText('Insert'))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText('Memory Data Store'))

    expect(onInsert).toHaveBeenCalledWith('after', 'page_2', 'MemoryDataStore')
})

test('notifies open request and closes menu', async () => {
    let onOpen = jest.fn()
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onOpen={onOpen}/>)))
    await actWait(() => fireEvent.click(screen.getByText('File')) )
    await actWait(() => fireEvent.click(screen.getByText('Open')) )
    expect(onOpen).toHaveBeenCalled()
    await actWait()
    expect(screen.queryByText('Open')).toBeNull()
})

test('notifies Get from GitHub request and closes menu', async () => {
    let onGetFromGitHub = jest.fn()
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onGetFromGitHub={onGetFromGitHub}/>)))
    await actWait(() => fireEvent.click(screen.getByText('File')) )
    await actWait(() => fireEvent.click(screen.getByText('Get from GitHub')) )
    expect(onGetFromGitHub).toHaveBeenCalled()
    await actWait()
    expect(screen.queryByText('Get from GitHub')).toBeNull()
})

test('notifies Update from GitHub request and closes menu', async () => {
    let onUpdateFromGitHub = jest.fn()
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onUpdateFromGitHub={onUpdateFromGitHub}/>)))
    await actWait(() => fireEvent.click(screen.getByText('File')) )
    await actWait(() => fireEvent.click(screen.getByText('Update from GitHub')) )
    expect(onUpdateFromGitHub).toHaveBeenCalled()
    await actWait()
    expect(screen.queryByText('Update from GitHub')).toBeNull()
})

test('notifies export request', async () => {
    const onExport = jest.fn()
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onExport={onExport} />)))
    fireEvent.click(screen.getByText('File'))
    fireEvent.click(screen.getByText('Export'))
    expect(onExport).toHaveBeenCalled()
})

test('notifies new request', async () => {
    let onNew = jest.fn()
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onExport={() => {}} onNew={onNew}/>)))
    fireEvent.click(screen.getByText('File'))
    fireEvent.click(screen.getByText('New'))
    expect(onNew).toHaveBeenCalled()
})

test(`notifies tree action with item selected in tree`, async () => {
    const onAction = jest.fn()
    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions} onAction={onAction}/>)))
    await clickExpandControl(0, 1, 2)

    await actWait(() => fireEvent.contextMenu(screen.getByText('Second Text')))
    await actWait(() => fireEvent.click(screen.getByText('Delete')))
    await actWait(() => fireEvent.click(screen.getByText('Yes', {exact: false})))

    expect(onAction).toHaveBeenCalledWith(['text_2'], 'delete')
})

test('has iframe for running app', async () => {

    await actWait(() =>  ({container, unmount} = render(<Editor project={project} {...onFunctions}/>)))

    const appFrame = container.querySelector('iframe[name="appFrame"]')
    expect(appFrame.src).toMatch(/.*\/run\/editorPreview$/)

    // await(wait(1000))
    // expect(appFrame.appCode).toEqual('some code')
})

test('shows link to run published app if provided', async () => {
    const theRunUrl = 'http://example.com/run/gh/xyz/123'
    await actWait(() => ({container, unmount} = render(<Editor project={project} {...onFunctions} runUrl={theRunUrl}/>)))
    const runLink = container.querySelector('#runLink')
    expect(runLink.textContent).toBe(theRunUrl)
    expect(runLink.href).toBe(theRunUrl)
})
