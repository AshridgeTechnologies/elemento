import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
/**
 * @vitest-environment jsdom
 */

import {GetFromGitHubDialog, GetFromGitHubState} from '../../../src/editor/actions/GetFromGitHub'
import EditorManager from '../../../src/editor/actions/EditorManager'
import {UIManager} from '../../../src/editor/actions/actionHelpers'
import {wait} from '../../testutil/testHelpers'
import {render, screen} from '@testing-library/react'


import {createElement} from 'react'
import {actWait} from '../../testutil/rtlHelpers'
import userEvent from '@testing-library/user-event'

let container: any

let editorManager: EditorManager
let uiManager: UIManager
let onUpdate: (newState: GetFromGitHubState) => void
let state: GetFromGitHubState

let dir1 = {kind: 'directory', name: 'dir1', keys() { return {next() { return {value: undefined} }}}} as unknown as FileSystemDirectoryHandle
let dirNotEmpty = {kind: 'directory', name: 'dir1', keys() { return {next() { return {value: 'subDir1'} }}}} as unknown as FileSystemDirectoryHandle

beforeEach(() => {
    editorManager = {
        getProjectNames: vi.fn().mockResolvedValue(['Project A', 'Project B']),
        getFromGitHub: vi.fn().mockResolvedValue(undefined)
    } as unknown as EditorManager

    uiManager = new UIManager({onClose: vi.fn(), showAlert: vi.fn()})

    onUpdate = vi.fn().mockImplementation( newState => state = newState)
    state = new GetFromGitHubState({editorManager, uiManager}, onUpdate)
})

test('state sets directory', async () => {
    await state.setDirectory(dir1)
    expect(state.directory).toBe(dir1)
})

test('state sets url', () => {
    state.setUrl('http://example.com')
    expect(state.url).toBe('http://example.com')
    expect(state.directory).toBe(null)
})

test('can create when fields entered and no error', async () => {
    expect(state.canDoAction).toBe(false)
    await state.setDirectory(dir1)
    expect(state.canDoAction).toBe(false)
    state.setUrl('https://example.com/user/repo1')
    expect(state.canDoAction).toBe(true)
    await state.setDirectory(dirNotEmpty)
    expect(state.canDoAction).toBe(false)
})

test('calls onGet', async () => {
    await state.setDirectory(dir1)
    state.setUrl('https://example.com/user/repo1')
    await state.onGet()
    expect(editorManager.getFromGitHub).toHaveBeenCalledWith('https://example.com/user/repo1', dir1)
})

test('calls onGet and throws if error', async () => {
    editorManager = {
        getProjectNames: vi.fn().mockResolvedValue([]),
        getFromGitHub: vi.fn().mockRejectedValue(new Error('Cannot do this'))
    } as unknown as EditorManager
    state = new GetFromGitHubState({editorManager, uiManager}, onUpdate)

    state.setDirectory(dir1)
    state.setUrl('https://example.com/user/repo1')
    expect(state.onGet()).rejects.toThrow('Cannot do this')
})

test('dialog works with state', async () => {
    await actWait(() => ({container} = render(createElement(GetFromGitHubDialog, {editorManager, uiManager}))))
    expect(screen.getByRole('dialog')).toHaveTextContent('Get project from GitHub')

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('GitHub URL'), 'https://example.com/user/Project A')
    expect(screen.getByLabelText('GitHub URL')).toHaveValue('https://example.com/user/Project A')

    expect(screen.getByRole('dialog').innerHTML).toMatchSnapshot()

    // await user.type(screen.getByLabelText('Project Name'), '1')
    // await user.click(screen.getByText('Get'))
    // await wait(10)
    // expect(editorManager.getFromGitHub).toHaveBeenCalledWith('https://example.com/user/Project A', 'Project A1')
    // expect(uiManager.onClose).toHaveBeenCalled()
})

test.skip('dialog shows alert if error in action', async () => {
    const originalConsoleError = console.error
    const error = new Error('Cannot do this')

    try {
        console.error = vi.fn()
        editorManager = {
            getProjectNames: vi.fn().mockResolvedValue([]),
            getFromGitHub: vi.fn().mockRejectedValue(error)
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
