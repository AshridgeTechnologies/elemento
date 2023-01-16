import 'fake-indexeddb/auto'
import {LocalProjectStoreIDB, projectFileName} from '../../src/editor/LocalProjectStore'
import {projectFixture1} from '../testutil/projectFixtures'
import {FILES_ID} from '../../src/model/Project'

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

test('deletes a file in a project dir', async () => {
    const projectName = 'Test dir for delete'
    await store.createProject(projectName)
    const fileName = 'Main.txt'
    await store.writeTextFile(projectName, fileName, 'stuff')
    await store.deleteFile(projectName, fileName)

    await expect( async () => await store.readTextFile(projectName, fileName)).rejects.toThrow('ENOENT')
})

test('renames a file in a project dir', async () => {
    const projectName = 'Test dir for rename'
    await store.createProject(projectName)
    const fileName = 'Main.txt'
    const fileName2 = 'Main 2.txt'
    await store.writeTextFile(projectName, fileName, 'stuff')
    await store.rename(projectName, fileName, fileName2)

    await expect( async () => await store.readTextFile(projectName, fileName)).rejects.toThrow('ENOENT')
    const textRead = await store.readTextFile(projectName, fileName2)
    expect(textRead).toBe('stuff')})

test('writes project file as formatted JSON', async () => {
    const projectName = 'Test dir 3'
    const project = projectFixture1()
    await store.createProject(projectName)
    await store.writeProjectFile(projectName, project)
    const textRead = await store.readTextFile(projectName, projectFileName)
    expect(textRead).toBe(JSON.stringify(project, null, 2))
})

test('gets asset file names without project file or hidden files in a project', async () => {
    const projectName = 'Test dir 4'
    const project = projectFixture1()
    await store.createProject(projectName)
    await store.writeProjectFile(projectName, project)
    await store.writeTextFile(projectName, 'File 3.jpg', '3')
    await store.writeTextFile(projectName, 'File 1.jpg', '1')
    await store.writeTextFile(projectName, 'File 2.jpg', '2')
    await store.writeTextFile(projectName, '.hiddenFile', '4')
    const projectWorkingCopy = await store.getProject(projectName)
    expect(projectWorkingCopy.assetFileNames).toStrictEqual(['File 1.jpg', 'File 2.jpg', 'File 3.jpg'])
    const elements = projectWorkingCopy.projectWithFiles.findElement(FILES_ID)?.elements as any[]
    expect(elements.map( el => el.name)).toStrictEqual(['File 1.jpg', 'File 2.jpg', 'File 3.jpg'])
})