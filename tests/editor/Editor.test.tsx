/**
 * @jest-environment jsdom
 */

import React, {useState} from 'react'
import Editor from '../../src/editor/Editor'
import {act, fireEvent, render, screen, within} from '@testing-library/react/pure'
import lodash from 'lodash';
import {
    ex,
    stopSuppressingRcTreeJSDomError,
    suppressRcTreeJSDomError,
    treeItemLabels,
    wait
} from '../testutil/testHelpers'
import Page from '../../src/model/Page'
import TextInput from '../../src/model/TextInput'
import App from '../../src/model/App'
import {projectFixture1, projectFixture2} from '../testutil/projectFixtures'
import Project, {TOOLS_ID} from '../../src/model/Project'
import {treeExpandControlSelector} from './Selectors'
import {actWait} from '../testutil/rtlHelpers'
import DataTypes from '../../src/model/types/DataTypes'
import NumberType from '../../src/model/types/NumberType'
import NumberInput from '../../src/model/NumberInput'
import ServerApp from '../../src/model/ServerApp'
import FunctionDef from '../../src/model/FunctionDef'
import Tool from '../../src/model/Tool'
import {ElementId} from '../../src/model/Types'
import {AppElementAction} from '../../src/editor/Types'

const {startCase} = lodash;

jest.mock('../../src/appsShared/gitHubAuthentication')

let container: any = null, unmount: any

const itemLabels = () => treeItemLabels(container)
const clickExpandControl = (...indexes: number[]) => clickExpandControlFn(container)(...indexes)

const project = projectFixture1()
const [projectWithTools] = project.insert('inside', TOOLS_ID, new Tool('tool_1', 'Tool 1', {}))

const onChange = ()=> {}
const onAction = jest.fn()
const onMove = jest.fn()
const onSaveToGitHub = jest.fn()
const onGetFromGitHub = jest.fn()
const onUpdateFromGitHub = jest.fn()
const onInsert = ()=> '123'

const onFunctions = {onChange, onAction, onMove, onInsert, onSaveToGitHub, onGetFromGitHub, onUpdateFromGitHub}
const errors = {}

let selectedItemIds: string[] = []

const clickExpandControlFn = (container: any) => async (...indexes: number[]) => {
    for (const index of indexes) await actWait(() => fireEvent.click(container.querySelectorAll(treeExpandControlSelector)[index]))
}

function propertiesPanelName() {
    return container.querySelector('#name') as HTMLInputElement
}

beforeAll(suppressRcTreeJSDomError)
afterAll(stopSuppressingRcTreeJSDomError)

beforeEach( ()=> selectedItemIds = [])
afterEach( async () => await act(() => {
    try{
        unmount && unmount()
    } catch(e: any) {
        if (!e.message?.match(/Cannot read properties of null \(reading 'removeEventListener'\)/)) {
            throw e
        }
    }
}))

function EditorTestWrapper(props: any) {
    const [selectedItemIds, onSelectedItemsChange] = useState<string[]>([])
    const project: Project = props.project
    const actionsAvailableFn = (ids: ElementId[]): AppElementAction[] => project.actionsAvailable(ids)
    // @ts-ignore
    return <Editor {...{selectedItemIds, onSelectedItemsChange,actionsAvailableFn}} {...onFunctions} {...{errors}} {...props}/>
}

test('renders tree with app elements',  async () => {
    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={project} projectStoreName='Stored Project' />)))
    await clickExpandControl(0, 1, 2)
    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'A Layout', 'Other Page', 'Tools'])
})

test('shows Text element selected in tree in property editor', async () => {
    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={project}/>)))
    await clickExpandControl(0, 1, 2)

    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'A Layout', 'Other Page', 'Tools'])

    fireEvent.click(screen.getByText('Second Text'))
    await wait(100)
    expect(propertiesPanelName().value).toBe('Second Text')
})

test('property kind button state does not leak into other properties', async () => {
    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={project}/>)))
    await clickExpandControl(0, 1, 2)

    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'First Text', 'Second Text', 'A Layout', 'Other Page', 'Tools'])

    fireEvent.click(screen.getByText('Second Text'))

    const contentInput = () => container.querySelector('.property-input button') as HTMLInputElement
    expect(contentInput().textContent).toBe('fx=')
    fireEvent.click(contentInput())
    expect(contentInput().textContent).toBe('abc')

    fireEvent.click(screen.getByText('First Text'))
    expect(contentInput().textContent).toBe('fx=')
})

test('shows TextInput element selected in tree in property editor', async () => {
    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={projectFixture2()}/>)))
    await clickExpandControl(0, 1, 3)

    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'Other Page', 'Some Text', 'Another Text Input', 'Button 2', 'Files', 'Image 1.jpg', 'Tools'])

    fireEvent.click(screen.getByText('Another Text Input'))

    expect(propertiesPanelName().value).toBe('Another Text Input')

    const initialValueInput = screen.getByLabelText('Initial Value') as HTMLInputElement
    expect(initialValueInput.value).toBe('"Type the text"')

    const maxLengthInput = screen.getByLabelText('Width') as HTMLInputElement
    expect(maxLengthInput.value).toBe('50')
})

test('shows errors for properties of main client app', async () => {
    const projectWithErrors = Project.new([new App('app1', 'App One', {}, [
        new Page('page_1', 'Main Page', {}, [
            new TextInput('textInput_1', 'First Text Input', {
                initialValue: ex`"A text value" + `,
                width: ex`BadName + 30`
            }),
        ]),
    ])], 'Project Bad', 'pr1', {})
    const errors = {
        textInput_1: {
            initialValue: 'Error: Line 1: Unexpected end of input',
            width: 'Unknown names: BadName'
        },
    }

    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={projectWithErrors} errors={errors}/>)))
    await clickExpandControl(0, 1, 2)

    expect(itemLabels()).toStrictEqual(['Project Bad', 'App One', 'Main Page', 'First Text Input', 'Tools'])

    fireEvent.click(screen.getByText('First Text Input'))
    const initialValueInput = screen.getByLabelText('Initial Value') as HTMLInputElement
    expect(initialValueInput.value).toBe('"A text value" + ')
    const initialValueError = container.querySelector(`[id="initialValue-helper-text"]`)
    expect(initialValueError.textContent).toBe('Error: Line 1: Unexpected end of input')

    const widthInput = screen.getByLabelText('Width') as HTMLInputElement
    expect(widthInput.value).toBe('BadName + 30')
    const widthError = container.querySelector(`[id="width-helper-text"]`)
    expect(widthError.textContent).toBe('Unknown names: BadName')
})

test('shows errors for properties of all client apps', async () => {
    const app1 = new App('app1', 'App One', {}, [
        new Page('page_1', 'Main Page', {}, [
            new TextInput('textInput_1', 'First Text Input', {initialValue: ex`"A text value" + `}),
        ]),
    ])

    const app2 = new App('app2', 'App Two', {}, [
        new Page('page_2', 'Main Page', {}, [
            new NumberInput('numberInput_1', 'Number Input', {label: ex`BadName + 'x'`}),
        ]),
    ])

    const projectWithErrors = Project.new([app1, app2], 'Project Bad', 'pr1', {})
    const errors = {
        textInput_1: {
            initialValue: 'Error: Line 1: Unexpected end of input',
        },
        numberInput_1: {
            label: 'Unknown names: BadName',
        },
    }

    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={projectWithErrors} errors={errors}/>)))
    await clickExpandControl(0, 1, 2)
    expect(itemLabels()).toStrictEqual(['Project Bad', 'App One', 'Main Page', 'First Text Input', 'App Two', 'Main Page', 'Tools'])

    fireEvent.click(screen.getByText('First Text Input'))
    const initialValueInput = screen.getByLabelText('Initial Value') as HTMLInputElement
    expect(initialValueInput.value).toBe('"A text value" + ')
    const initialValueError = container.querySelector(`[id="initialValue-helper-text"]`)
    expect(initialValueError.textContent).toBe('Error: Line 1: Unexpected end of input')

    await clickExpandControl(5)
    expect(itemLabels()).toStrictEqual(['Project Bad', 'App One', 'Main Page', 'First Text Input', 'App Two', 'Main Page', 'Number Input', 'Tools'])

    fireEvent.click(screen.getByText('Number Input'))
    const labelInput = screen.getByLabelText('Label') as HTMLInputElement
    expect(labelInput.value).toBe(`BadName + 'x'`)
    const labelError = container.querySelector(`[id="label-helper-text"]`)
    expect(labelError.textContent).toBe('Unknown names: BadName')
})

test('shows errors for properties of all server apps', async () => {
    const serverApp1 = new ServerApp('serverApp1', 'Server App One', {}, [
        new FunctionDef('func1', 'Add What', {calculation: ex`22 + `}),
    ])

    const serverApp2 = new ServerApp('serverApp2', 'Server App Two', {}, [
        new FunctionDef('func2', 'Add Bad', {calculation: ex`BadName + 22`}),
    ])
    const projectWithErrors = Project.new([serverApp1, serverApp2], 'Project Bad', 'pr1', {})
    const errors = {
        func1: {
            calculation: 'Error: Line 1: Unexpected end of input',
        },
        func2: {
            calculation: 'Unknown names: BadName',
        },
    }

    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={projectWithErrors} errors={errors}/>)))
    await clickExpandControl(0, 1)
    expect(itemLabels()).toStrictEqual(['Project Bad', 'Server App One', 'Add What', 'Server App Two', 'Add Bad', 'Tools'])

    fireEvent.click(screen.getByText('Add What'))
    const calculationInput = screen.getByLabelText('Calculation') as HTMLInputElement
    expect(calculationInput.value).toBe('22 + ')
    const calculationError = container.querySelector(`[id="calculation-helper-text"]`)
    expect(calculationError.textContent).toBe('Error: Line 1: Unexpected end of input')

    fireEvent.click(screen.getByText('Add Bad'))
    const calculation2Input = screen.getByLabelText('Calculation') as HTMLInputElement
    expect(calculation2Input.value).toBe('BadName + 22')
    const calculation2Error = container.querySelector(`[id="calculation-helper-text"]`)
    expect(calculation2Error.textContent).toBe('Unknown names: BadName')
})

test('shows errors for properties of type objects', async () => {
    const numberType1 = new NumberType('id1', 'Number 1', {description: 'The amount', min: ex`BadName + 30`, max: ex`5 + `}, )
    const projectWithErrors = Project.new([
        new App('app1', 'App One', {}, [
            new Page('page_1', 'Main Page', {}, []),
        ]),
        new DataTypes('dt1', 'My Types', {}, [numberType1])
    ], 'Project Bad', 'pr1', {})
    const errors = {
        id1: {
            max: 'Error: Line 1: Unexpected end of input',
            min: 'Unknown names: BadName',
        },
    }

    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={projectWithErrors} errors={errors}/>)))
    await clickExpandControl(0, 1, 3)

    expect(itemLabels()).toStrictEqual(['Project Bad', 'App One', 'Main Page', 'My Types', 'Number 1', 'Tools'])

    fireEvent.click(screen.getByText('Number 1'))
    const initialValueInput = screen.getByLabelText('Max') as HTMLInputElement
    expect(initialValueInput.value).toBe('5 + ')
    const initialValueError = container.querySelector(`[id="max-helper-text"]`)
    expect(initialValueError.textContent).toBe('Error: Line 1: Unexpected end of input')

    const maxLengthInput = screen.getByLabelText('Min') as HTMLInputElement
    expect(maxLengthInput.value).toBe('BadName + 30')
    const maxLengthError = container.querySelector(`[id="min-helper-text"]`)
    expect(maxLengthError.textContent).toBe('Unknown names: BadName')
})

test('shows allowed items in context insert menu of a page item', async () => {
    const optionsShown = () => screen.queryByTestId('insertItems') && within(screen.getByTestId('insertItems')).queryAllByRole('menuitem').map( el => el.textContent)

    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={project}/>)))
    await clickExpandControl(0, 1, 2)
    await actWait(() => fireEvent.contextMenu(screen.getByText('Second Text')))
    await actWait(() => fireEvent.click(screen.getByText('Insert')))

    expect(optionsShown()).toStrictEqual(['Text', 'Text Input', 'Number Input','Select Input', 'True False Input', 'Date Input', 'Speech Input', 'Button', 'Form', 'Image', 'Icon', 'User Logon', 'Menu', 'List', 'Data', 'Calculation', 'Function', 'Function Import', 'Collection', 'Layout'])
})

test('notifies upload action from context menu of the files item', async () => {

    // using id of Image 1.jpg to simplify the test
    const notionalNewFileId = 'file_1'
    const onAction = jest.fn().mockImplementation(()=> Promise.resolve(notionalNewFileId))

    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={projectFixture2()} onAction={onAction}/>)))
    expect(itemLabels()).toStrictEqual(['Project One', 'App One', 'Main Page', 'Other Page', 'Files', 'Image 1.jpg', 'Tools'])

    await actWait(() => fireEvent.contextMenu(screen.getByText('Files')))
    await actWait(() => fireEvent.click(screen.getByText('Upload')))

    expect(onAction).toHaveBeenCalledWith(['_FILES'], 'upload')
    expect(propertiesPanelName().value).toBe('Image 1.jpg')
})

test('notifies insert action from context menu of the tools item', async () => {
    const notionalNewElementId = 'tool_1'
    const onInsert = jest.fn().mockReturnValue(notionalNewElementId)

    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={project} onInsert={onInsert}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.contextMenu(screen.getByText('Tools'))
    fireEvent.click(screen.getByText('Insert'))
    fireEvent.click(screen.getByText('Inside'))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText('Tool'))

    expect(onInsert).toHaveBeenCalledWith('inside', '_TOOLS', 'Tool')
})

test.each([['Text', 'before'], ['TextInput', 'after']])
    (`notifies context menu insert of %s %s item in tree and selects new item`, async (elementType, position) => {
    const notionalNewElementId = 'text_1'
    const onInsert = jest.fn().mockReturnValue(notionalNewElementId)

    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={project} onInsert={onInsert}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.contextMenu(screen.getByText('Second Text'))
    fireEvent.click(screen.getByText(`Insert`))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(position)))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(elementType)))

    expect(onInsert).toHaveBeenCalledWith(position, 'text_2', elementType)
    const idText = screen.getByTestId('elementId') as HTMLElement
    expect(idText.textContent).toBe(notionalNewElementId)
})

test.each([['NumberInput', 'inside']])
    (`notifies context menu insert of %s %s item in tree and selects new item`, async (elementType, position) => {
    const notionalNewElementId = 'text_1'
    const onInsert = jest.fn().mockReturnValue(notionalNewElementId)

    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={project} onInsert={onInsert}/>)))
    await clickExpandControl(0, 1, 2)

    fireEvent.contextMenu(screen.getByText('Main Page'))
    fireEvent.click(screen.getByText(`Insert`))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(position)))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(elementType)))

    expect(onInsert).toHaveBeenCalledWith(position, 'page_1', elementType)
    const idText = screen.getByTestId('elementId') as HTMLElement
    expect(idText.textContent).toBe(notionalNewElementId)
})

test(`notifies show action with item id`, async () => {
    const onAction = jest.fn()
    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={projectWithTools} onAction={onAction} />)))
    await clickExpandControl(1)

    await actWait(() => fireEvent.contextMenu(screen.getByText('Tool 1')))
    await actWait(() => fireEvent.click(screen.getByText('Show')))

    expect(onAction).toHaveBeenCalledWith(['tool_1'], 'show')
})

test(`notifies tree action with item selected in tree`, async () => {
    const onAction = jest.fn()
    await actWait(() =>  ({container, unmount} = render(<EditorTestWrapper project={project} onAction={onAction}/>)))
    await clickExpandControl(0, 1, 2)

    await actWait(() => fireEvent.contextMenu(screen.getByText('Second Text')))
    await actWait(() => fireEvent.click(screen.getByText('Delete')))
    await actWait(() => fireEvent.click(screen.getByText('Yes', {exact: false})))

    expect(onAction).toHaveBeenCalledWith(['text_2'], 'delete')
})

