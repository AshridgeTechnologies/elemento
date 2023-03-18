/**
 * @jest-environment jsdom
 */

import {GetFromGitHubDialog, GetFromGitHubState} from '../../../src/editor/actions/GetFromGitHub'
import EditorManager from '../../../src/editor/actions/EditorManager'
import {UIManager} from '../../../src/editor/actions/actionHelpers'
import {wait} from '../../testutil/testHelpers'
import {render, screen} from '@testing-library/react'
import '@testing-library/jest-dom'

import {createElement} from 'react'
import {actWait} from '../../testutil/rtlHelpers'
import userEvent from '@testing-library/user-event'

let container: any

let editorManager: EditorManager
let uiManager: UIManager
let onUpdate: (newState: GetFromGitHubState) => void
let state: GetFromGitHubState

beforeEach(() => {
    editorManager = {
        getProjectNames: jest.fn().mockResolvedValue(['Project A', 'Project B']),
        getFromGitHub: jest.fn().mockResolvedValue(undefined)
    } as unknown as EditorManager

    uiManager = new UIManager({onClose: jest.fn(), showAlert: jest.fn(), editorId: 'editor1'})

    onUpdate = jest.fn().mockImplementation( newState => state = newState)
    state = new GetFromGitHubState({editorManager}, onUpdate)
})


test('state sets project name', () => {
    state.setProjectName('Proj One')
    expect(state.directory).toBe('Proj One')
})

test('state sets url and leaves project name empty if not found', () => {
    state.setUrl('http://example.com')
    expect(state.url).toBe('http://example.com')
    expect(state.directory).toBe('')
})

test('state sets url and updates project name if empty or same as url', () => {
    state.setUrl('https://example.com/user/repo1')
    expect(state.url).toBe('https://example.com/user/repo1')
    expect(state.directory).toBe('repo1')
    state.setUrl('https://example.com/user/repo12')
    expect(state.url).toBe('https://example.com/user/repo12')
    expect(state.directory).toBe('repo12')
})

test('state sets url and leaves project name if different to url', () => {
    state.setProjectName('Proj One')
    state.setUrl('https://example.com/user/repo1')
    expect(state.url).toBe('https://example.com/user/repo1')
    expect(state.directory).toBe('Proj One')
})

test('validates project name not same as an existing name', async () => {
    await wait(10) // wait for xisting project names to load
    state.setProjectName('Proj One')
    expect(state.directoryError).toBeNull()
    state.setProjectName('Project B')
    expect(state.directoryError).toBe('There is already a project with this name')
})

test('can create when fields entered and no error', async () => {
    await wait(10) // wait for existing project names to load

    expect(state.canDoAction).toBe(false)
    state.setProjectName('Proj One')
    expect(state.canDoAction).toBe(false)
    state.setUrl('https://example.com/user/repo1')
    expect(state.canDoAction).toBe(true)
    state.setProjectName('Project B')
    expect(state.canDoAction).toBe(false)
})

test('calls onGet', async () => {
    state.setProjectName('Proj One')
    state.setUrl('https://example.com/user/repo1')
    state.onGet()
    expect(editorManager.getFromGitHub).toHaveBeenCalledWith('https://example.com/user/repo1', 'Proj One')
})

test('calls onGet and throws if error', async () => {
    editorManager = {
        getProjectNames: jest.fn().mockResolvedValue([]),
        getFromGitHub: jest.fn().mockRejectedValue(new Error('Cannot do this'))
    } as unknown as EditorManager
    state = new GetFromGitHubState({editorManager}, onUpdate)

    state.setProjectName('Proj One')
    state.setUrl('https://example.com/user/repo1')
    expect(state.onGet()).rejects.toThrow('Cannot do this')
})

test('dialog works with state', async () => {
    await actWait(() => ({container} = render(createElement(GetFromGitHubDialog, {editorManager, uiManager}))))
    expect(screen.getByRole('dialog')).toHaveTextContent('Get project from GitHub')

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('GitHub URL'), 'https://example.com/user/Project A')
    expect(screen.getByLabelText('Project Name')).toHaveValue('Project A')
    expect(screen.getByRole('dialog')).toHaveTextContent('There is already a project with this name')

    expect(screen.getByRole('dialog').innerHTML).toMatchSnapshot()

    await user.type(screen.getByLabelText('Project Name'), '1')
    await user.click(screen.getByText('Get'))
    await wait(10)
    expect(editorManager.getFromGitHub).toHaveBeenCalledWith('https://example.com/user/Project A', 'Project A1')
    expect(uiManager.onClose).toHaveBeenCalled()
})

test('dialog shows alert if error in action', async () => {
    const originalConsoleError = console.error
    const error = new Error('Cannot do this')

    try {
        console.error = jest.fn()
        editorManager = {
            getProjectNames: jest.fn().mockResolvedValue([]),
            getFromGitHub: jest.fn().mockRejectedValue(error)
        } as unknown as EditorManager

        await actWait(() => ({container} = render(createElement(GetFromGitHubDialog, {editorManager, uiManager}))))
        const user = userEvent.setup()
        await user.type(screen.getByLabelText('GitHub URL'), 'https://example.com/user/Project One')
        await user.click(screen.getByText('Get'))
        expect(uiManager.showAlert).toHaveBeenCalledWith('Get project from GitHub', `Error: Cannot do this`, null, 'error')
        expect(uiManager.onClose).toHaveBeenCalled()
    } finally {
        expect(console.error).toHaveBeenCalledWith('Error in Get project from GitHub', error)
        console.error = originalConsoleError
    }
})
