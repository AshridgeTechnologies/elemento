import 'fake-indexeddb/auto'
import {LocalProjectStoreIDB, projectFileName} from '../../src/editor/LocalProjectStore'
import {projectFixture1} from '../testutil/projectFixtures'

let store: LocalProjectStoreIDB
globalThis.navigator = {} as any

beforeEach(() => {
    store = new LocalProjectStoreIDB()
})

afterEach(async () =>  {
    //await store['db'].delete()
})

test('creates and gets project names, sorted', async () => {
    await store.createProject('XYZ')
    await store.createProject('First project')
    await store.createProject('Project One')

    const projectNames = await store.getProjectNames()
    expect(projectNames).toStrictEqual(['First project', 'Project One', 'XYZ'])
})

test('writes and reads files at top level in a project dir', async () => {
    const projectName = 'Test dir 1'
    const fileText = 'This is the main file\nwith two lines'
    await store.createProject(projectName)
    const fileName = 'Main.txt'
    await store.writeTextFile(projectName, fileName, fileText)
    const textRead = await store.readTextFile(projectName, fileName)
    expect(textRead).toBe(fileText)
})
test('writes and reads project file in a project dir', async () => {
    const projectName = 'Test dir 2'
    const project = projectFixture1()
    await store.createProject(projectName)
    await store.writeProjectFile(projectName, project)
    const projectRead = (await store.getProject(projectName)).project
    expect(projectRead).toStrictEqual(project)
})

test('writes project file as formatted JSON', async () => {
    const projectName = 'Test dir 3'
    const project = projectFixture1()
    await store.createProject(projectName)
    await store.writeProjectFile(projectName, project)
    const textRead = await store.readTextFile(projectName, projectFileName)
    expect(textRead).toBe(JSON.stringify(project, null, 2))
})
