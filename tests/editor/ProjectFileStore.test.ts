import {
    filePickerCancelling,
    filePickerErroring,
    filePickerReturning,
    resetSaveFileCallData,
    saveFileData,
    saveFilePicker,
    saveFilePickerOptions
} from '../testutil/testHelpers'
import ProjectFileStore from '../../src/editor/ProjectFileStore'
import {projectFixture1, welcomeProject} from '../testutil/projectFixtures'
import {editorEmptyProject} from '../../src/util/initialProjects'
import Project from '../../src/model/Project'

const project = projectFixture1()
const testProjectHolder = (project: Project) => ({
    project,
    get current() { return this.project },
    setProject(proj: Project) { this.project = proj },
    newProject: jest.fn()
})

test('can start a new project', () => {
    const holder = testProjectHolder(welcomeProject())
    const store = new ProjectFileStore(holder, {showOpenFilePicker: jest.fn(), showSaveFilePicker: jest.fn()})
    store.newProject()
    expect(holder.newProject).toHaveBeenCalled()
})

test('can open project from JSON file', async () => {
    const showSaveFilePicker = jest.fn()
    const showOpenFilePicker = filePickerReturning(project)

    const holder = testProjectHolder(welcomeProject())
    const store = new ProjectFileStore(holder, {showOpenFilePicker, showSaveFilePicker})
    await store.openFile()
    expect(holder.current).toStrictEqual(project)
})

test('can cancel opening a project', async () => {
    const showSaveFilePicker = jest.fn()

    const initialProject = welcomeProject()
    const holder = testProjectHolder(initialProject)
    const store = new ProjectFileStore(holder, {showOpenFilePicker: filePickerCancelling, showSaveFilePicker})
    await store.openFile()
    expect(holder.current).toBe(initialProject)
})

test('can get error from opening a project', async () => {
    const showSaveFilePicker = jest.fn()

    const initialProject = welcomeProject()
    const holder = testProjectHolder(initialProject)
    const store = new ProjectFileStore(holder, {showOpenFilePicker: filePickerErroring, showSaveFilePicker})
    let error: any
    try {
        await store.openFile()
    } catch (e) {
        error = e
    }

    expect(holder.current).toBe(initialProject)
    expect( error.message).toBe('Could not access file')
})

test('can Save As a JSON file', async () => {
    const holder = testProjectHolder(project)
    const store = new ProjectFileStore(holder, {showOpenFilePicker: jest.fn(), showSaveFilePicker: saveFilePicker()})
    await store.saveFileAs()
    expect(saveFileData).toStrictEqual(JSON.stringify(project, null, 2))
    expect(saveFileData).not.toMatch(/componentType/)
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
    const holder = testProjectHolder(project)
    const store = new ProjectFileStore(holder, {showOpenFilePicker: jest.fn(), showSaveFilePicker: saveFilePicker()})
    await store.save()
    expect(saveFileData).toStrictEqual(JSON.stringify(project, null, 2))
})

test('can cancel Save As', async () => {
    resetSaveFileCallData()
    const holder = testProjectHolder(project)
    const store = new ProjectFileStore(holder, {showOpenFilePicker: jest.fn(), showSaveFilePicker: filePickerCancelling})
    await store.saveFileAs()
    expect(saveFileData).toBeUndefined()
    expect(saveFilePickerOptions).toBeUndefined()
})

test('can get error from Save As', async () => {
    resetSaveFileCallData()
    const holder = testProjectHolder(project)
    const store = new ProjectFileStore(holder, {
        showOpenFilePicker: jest.fn(),
        showSaveFilePicker: filePickerErroring
    })

    let error: any
    try {
        await store.saveFileAs()
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

    const holder = testProjectHolder(welcomeProject())
    const store = new ProjectFileStore(holder, {showOpenFilePicker, showSaveFilePicker})
    await store.openFile()
    expect(holder.current).toStrictEqual(project)

    holder.project = holder.project.set('text_3', 'content', 'New content')
    await store.save()
    expect(saveFileData).toStrictEqual(JSON.stringify(holder.current, null, 2))
})

test('can Save directly after a Save As', async () => {
    const holder = testProjectHolder(project)
    const store = new ProjectFileStore(holder, {showOpenFilePicker: jest.fn(), showSaveFilePicker: saveFilePicker()})
    await store.saveFileAs()

    holder.project = holder.project.set('text_3', 'content', 'New content')
    await store.save()
    expect(saveFileData).toStrictEqual(JSON.stringify(holder.current, null, 2))
})

