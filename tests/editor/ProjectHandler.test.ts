import ProjectHandler from '../../src/editor/ProjectHandler'
import {projectFixture1} from '../testutil/projectFixtures'
import {Project, Text, TextInput} from '../../src/model/index'
import {AppElementAction} from '../../src/editor/Types'
import welcomeProject from '../../src/util/welcomeProject'
import {currentUser} from '../../src/shared/authentication'
import {uploadTextToStorage} from '../../src/shared/storage'

jest.mock('../../src/shared/authentication')
jest.mock('../../src/shared/storage')

const project = projectFixture1()

let handler: ProjectHandler
beforeEach(() => {
    jest.resetAllMocks()
    handler = new ProjectHandler()
    handler.setProject(project)
})

function fileHandle(returnedProject?: Project) {
    const file = {
        async text() {
            return JSON.stringify(returnedProject)
        }
    }

    const writable = {
        async write(data: any) {
            saveFileData = data
        },
        async close() {
        }
    }

    return {
        async getFile() {
            return file
        },
        async createWritable() {
            return writable
        }
    }
}

let saveFilePickerOptions: any
let saveFileData: any
beforeEach(() => {
    saveFileData = undefined
    saveFilePickerOptions = undefined
})

const saveFilePicker = () => async (options: any) => {
    saveFilePickerOptions = options
    return fileHandle()
}

const baseUrl = 'http://some.site'

function filePickerReturning(returnedProject: Project) {
    return () => Promise.resolve([fileHandle(returnedProject)])
}
const filePickerCancelling = () => Promise.reject({name: 'AbortError'})

const filePickerErroring = () => Promise.reject(new Error('Could not access file'))

test('has default project', () => {
    expect(new ProjectHandler().current.id).toBe('project_1')
})

test('can set and get a project', () => {
    // handler.setProject(project) // done in beforeEach
    expect(handler.current).toBe(project)
})

test('can set a property on the project', () => {
    handler.setProperty('text_3', 'content', 'New content')
    expect(handler.current).not.toBe(project)
    expect((handler.current.findElement('text_3') as Text).content).toBe('New content')
})

test('can insert an element on the project', () => {
    const newId = handler.insertElement('text_3', 'TextInput')
    expect(handler.current).not.toBe(project)
    expect((handler.current.findElement(newId) as TextInput).id).toBe(newId)
})

test('can do action on the project', () => {
    handler.elementAction('text_3', 'delete')
    expect(handler.current.findElement('text_3')).toBeNull()
})

test('exception for unknown action on the project', () => {
    expect(() => handler.elementAction('text_3', 'doSomething' as AppElementAction)).toThrow()
    expect(handler.current).toBe(project)
})

test('can open project from JSON file', async () => {
    const showSaveFilePicker = jest.fn()
    const showOpenFilePicker = filePickerReturning(project)

    const handler = new ProjectHandler(welcomeProject(), {showOpenFilePicker, showSaveFilePicker, baseUrl})
    await handler.openFile()
    expect(handler.current).toStrictEqual(project)
})

test('can cancel opening a project', async () => {
    const showSaveFilePicker = jest.fn()

    const initialProject = welcomeProject()
    const handler = new ProjectHandler(initialProject, {showOpenFilePicker: filePickerCancelling, showSaveFilePicker, baseUrl})
    await handler.openFile()
    expect(handler.current).toBe(initialProject)
})

test('can get error from opening a project', async () => {
    const showSaveFilePicker = jest.fn()

    const initialProject = welcomeProject()
    const handler = new ProjectHandler(initialProject, {showOpenFilePicker: filePickerErroring, showSaveFilePicker, baseUrl})
    let error: any
    try {
        await handler.openFile()
    } catch (e) {
        error = e
    }

    expect(handler.current).toBe(initialProject)
    expect( error.message).toBe('Could not access file')
})

test('can Save As a JSON file', async () => {
    const handler = new ProjectHandler(project, {showOpenFilePicker: jest.fn(), showSaveFilePicker: saveFilePicker(), baseUrl})
    await handler.saveFileAs()
    expect(saveFileData).toStrictEqual(JSON.stringify(project))
    expect(saveFilePickerOptions).toStrictEqual({
        types: [
            {
                description: 'Project JSON Files',
                accept: {
                    'application/json': ['.json'],
                },
            },
        ],
    })
})

test('Save does Save As if not previously saved', async () => {
    const handler = new ProjectHandler(project, {showOpenFilePicker: jest.fn(), showSaveFilePicker: saveFilePicker(), baseUrl})
    await handler.save()
    expect(saveFileData).toStrictEqual(JSON.stringify(project))
})

test('can cancel Save As', async () => {
    const handler = new ProjectHandler(project, {showOpenFilePicker: jest.fn(), showSaveFilePicker: filePickerCancelling, baseUrl})
    await handler.saveFileAs()
    expect(saveFileData).toBeUndefined()
    expect(saveFilePickerOptions).toBeUndefined()
})

test('can get error from Save As', async () => {
    const handler = new ProjectHandler(project, {
        showOpenFilePicker: jest.fn(),
        showSaveFilePicker: filePickerErroring,
        baseUrl
    })

    let error: any
    try {
        await handler.saveFileAs()
    } catch (e) {
        error = e
    }
    expect(saveFileData).toBeUndefined()
    expect(saveFilePickerOptions).toBeUndefined()
    expect( error.message).toBe('Could not access file')
})

test('can Save after open', async () => {
    const showSaveFilePicker = jest.fn()
    const showOpenFilePicker = filePickerReturning(project)

    const handler = new ProjectHandler(welcomeProject(), {showOpenFilePicker, showSaveFilePicker, baseUrl})
    await handler.openFile()
    expect(handler.current).toStrictEqual(project)

    handler.setProperty('text_3', 'content', 'New content')
    await handler.save()
    expect(saveFileData).toStrictEqual(JSON.stringify(handler.current))
})

test('can Save directly after a Save As', async () => {
    const handler = new ProjectHandler(project, {showOpenFilePicker: jest.fn(), showSaveFilePicker: saveFilePicker(), baseUrl})
    await handler.saveFileAs()

    handler.setProperty('text_3', 'content', 'New content')
    await handler.save()
    expect(saveFileData).toStrictEqual(JSON.stringify(handler.current))
})

test('publish when logged in', async () => {
    const handler = new ProjectHandler(project, {showOpenFilePicker: jest.fn(), showSaveFilePicker: jest.fn(), baseUrl})
    const userId = 'xxx123'
    const name = 'MyFirstApp'
    const code = 'doIt() { return "Done it" }';
    (currentUser as jest.MockedFunction<any>).mockReturnValue({uid: userId});
    (uploadTextToStorage as jest.MockedFunction<any>).mockResolvedValueOnce({})

    const runUrl = await handler.publish(name, code)
    expect(runUrl).toBe(`${baseUrl}/run/apps/${userId}/${name}`);
    expect(uploadTextToStorage).toHaveBeenCalledWith(`apps/${userId}/${name}`, code, {contentType: 'text/javascript',})
})

test('exception if try to publish when not logged in', async () => {
    const handler = new ProjectHandler(project, {
        showOpenFilePicker: jest.fn(),
        showSaveFilePicker: jest.fn(),
        baseUrl
    });
    (currentUser as jest.MockedFunction<any>).mockReturnValue(null);
    let exception: any
    try {
        await handler.publish('x', 'x')
    } catch (e) {
        exception = e
    }
    expect(exception.message).toBe('Must be logged in to publish')
})