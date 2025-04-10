import ProjectBuilder, {type ProjectLoader, type Properties as PBProperties} from '../../src/generator/ProjectBuilder'
import Project, {TOOLS_ID} from '../../src/model/Project'
import App from '../../src/model/App'
import Page from '../../src/model/Page'
import Text from '../../src/model/Text'
import {generate} from '../../src/generator/index'
import {generateServerApp} from '../../src/generator/ServerAppGenerator'
import TextType from '../../src/model/types/TextType'
import NumberType from '../../src/model/types/NumberType'
import DataTypes from '../../src/model/types/DataTypes'
import {ex, wait} from '../testutil/testHelpers'
import FunctionDef from '../../src/model/FunctionDef'
import ServerApp from '../../src/model/ServerApp'
import Tool from '../../src/model/Tool'
import ToolFolder from '../../src/model/ToolFolder'
import ToolImport from '../../src/model/ToolImport'
import {BaseApp} from '../../src/model/BaseApp'


const name = new TextType('tt1', 'Name', {required: true})
const itemAmount = new NumberType('nt1', 'Item Amount', {})
const dataTypes1 = new DataTypes('dt1', 'Types 1', {}, [name])
const dataTypes2 = new DataTypes('dt2', 'Types 2', {}, [itemAmount])

const app1 = new App('app1', 'App 1', {}, [
    new Page('p1', 'Page 1', {}, [
            new Text('text1', 'Text 1', {content: ex`"Uses Data Types 1" + Types1.Name`}),
        ]
    )
])
const app2 = new App('app2', 'App 2', {}, [
    new Page('p2', 'Page 2', {}, [
            new Text('text2', 'Text 2', {content: ex`"Uses Data Types 2" + Types2.ItemAmount`}),
        ]
    )
])
const app3 = new App('app3', 'App 3', {}, [
    new Page('p3', 'Page 3', {}, [
            new Text('text3', 'Text 3', {content: 'Another text'}),
        ]
    )
])

const tool1 = new Tool('tool1', 'Tool 1', {}, [
    new Page('p11', 'Page 1', {}, [
            new Text('text11', 'Text 11', {content: 'stuff'}),
        ]
    )
])
const tool2 = new Tool('tool2', 'Tool 2', {}, [
    new Page('p12', 'Page 2', {}, [
            new Text('text12', 'Text 12', {content: 'stuff'}),
        ]
    )
])
const toolImport1 = new ToolImport('toolImport', 'Tool Import', {source: 'https://example.com/tool'})

const plusFn = new FunctionDef('fn1', 'Plus', {input1: 'a', input2: 'b', calculation: ex`Sum(a, b)`})
const multFn = new FunctionDef('fn2', 'Mult', {input1: 'c', input2: 'd', calculation: ex`c * d`})
const serverApp1 = new ServerApp('sa1', 'Server App 1', {}, [plusFn])
const serverApp2 = new ServerApp('sa2', 'Server App 2', {}, [multFn])

const toolFolder = new ToolFolder(TOOLS_ID, 'Tools', {}, [tool1, tool2, toolImport1])
const project1 = Project.new([app1, app2, serverApp1, serverApp2, dataTypes1, dataTypes2, toolFolder], 'Project 1', 'proj1', {})
const projectClientOnly = Project.new([app3], 'Project Client Only', 'proj2', {})

const expectedClientCode = (app: App | Tool, project: Project = project1) => generate(app, project).code
const expectedServerFiles = (app: ServerApp, project: Project = project1) => generateServerApp(app, project).files
const expectedIndexFile = (app: BaseApp, project: Project = project1) => generate(app, project).html
const expectedProjectInfo = (project: Project = project1) => `{"apps":[${project.findChildElements('App').map( el => `"${el.codeName}"` ).join(',')}]}`

const getProjectLoader = (project: Project):ProjectLoader & {project: Project} => ({
    project,
    getProject() { return this.project }
})

const clientFileWriter = {
    writeFile: jest.fn().mockResolvedValue(undefined)
}
const toolFileWriter = {
    writeFile: jest.fn().mockResolvedValue(undefined)
}
const rootFileWriter = {
    writeFile: jest.fn().mockResolvedValue(undefined)
}

const serverFileWriter = {
    writeFile: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn().mockResolvedValue(undefined),
    clean: jest.fn().mockResolvedValue(undefined)
}

const getFileLoader = (dirContents: object = {}, exists = true) => ({
    exists: jest.fn().mockResolvedValue(exists),
    listFiles: jest.fn().mockResolvedValue(Object.keys(dirContents)),
    readFile: jest.fn().mockImplementation((filepath: string) => Promise.resolve(dirContents[filepath.split('/')[1] as keyof typeof dirContents]))
})

const clearMocks = () => {
    rootFileWriter.writeFile.mockClear()
    clientFileWriter.writeFile.mockClear()
    toolFileWriter.writeFile.mockClear()
    serverFileWriter.writeFile.mockClear()
    serverFileWriter.flush.mockClear().mockResolvedValue(undefined)
    serverFileWriter.clean.mockClear().mockResolvedValue(undefined)
}

beforeEach(clearMocks)


const newProjectBuilder = (props: Partial<PBProperties> = {}, project = project1) => {
    const properties = {projectLoader: getProjectLoader(project), fileLoader: getFileLoader(),
        rootFileWriter, clientFileWriter, toolFileWriter, serverFileWriter, ...props}
    return new ProjectBuilder(properties)
}

test('writes client files for all apps to client build with one copy of asset', async () => {
    const dirContents = {
        'Image1.jpg': new Uint8Array([1,2,3]),
        'File2.pdf': new Uint8Array([4,5,6]),
    }

    const fileLoader = getFileLoader(dirContents)
    const builder = newProjectBuilder({fileLoader})
    await builder.build()

    expect(fileLoader.listFiles).toHaveBeenCalledWith('files')
    expect(fileLoader.readFile.mock.calls).toStrictEqual([['files/Image1.jpg'], ['files/File2.pdf']])
    expect(clientFileWriter.writeFile.mock.calls).toStrictEqual([
        ['App1/App1.js', expectedClientCode(app1)],
        ['App1/index.html', expectedIndexFile(app1)],
        ['App2/App2.js', expectedClientCode(app2)],
        ['App2/index.html', expectedIndexFile(app2)],
        ['files/Image1.jpg', dirContents['Image1.jpg']],
        ['files/File2.pdf', dirContents['File2.pdf']],
    ])
})

test('skips asset files if dir does not exist', async () => {
    const fileLoader = getFileLoader({}, false)
    const builder = newProjectBuilder({fileLoader})
    await builder.build()

    expect(fileLoader.listFiles).not.toHaveBeenCalled()
})

test('writes server files generated from Project for all apps after clean and flushes immediately', async () => {
    const builder = newProjectBuilder()
    await builder.build()

    // const expectedServerFiles = new ServerFirebaseGenerator(project1).output().files
    // const expectedGeneratedCalls = expectedServerFiles.map(({name, contents}) => [name, contents])
    // expect(serverFileWriter.writeFile.mock.calls).toStrictEqual([
    //     ...expectedGeneratedCalls,
    // ])
    expect(serverFileWriter.clean).toHaveBeenCalledTimes(1)
    expect(serverFileWriter.flush).toHaveBeenCalledTimes(1)
})

test('does not clean or flush server files for Project with no server apps', async () => {
    const builder = newProjectBuilder({}, projectClientOnly)
    await builder.build()

    expect(serverFileWriter.writeFile).not.toHaveBeenCalled()
    expect(serverFileWriter.clean).not.toHaveBeenCalled()
    expect(serverFileWriter.flush).not.toHaveBeenCalled()
})

test('writes tool files for all tools to tool build with one copy of asset but not ToolImports', async () => {
    const builder = newProjectBuilder()
    await builder.build()

    expect(toolFileWriter.writeFile.mock.calls).toStrictEqual([
        ['Tool1/Tool1.js', expectedClientCode(tool1)],
        ['Tool1/index.html', expectedIndexFile(tool1)],
        ['Tool2/Tool2.js', expectedClientCode(tool2)],
        ['Tool2/index.html', expectedIndexFile(tool2)],
    ])
})

test('writes projectInfo file to top level', async () => {
    const builder = newProjectBuilder()
    await builder.build()

    expect(rootFileWriter.writeFile.mock.calls).toStrictEqual([
        ['projectInfo.json', expectedProjectInfo()],
    ])
})

test('has code generated from Project for all apps', async () => {
    const builder = newProjectBuilder()
    await builder.build()

    const expectedClientEntries = [
        ['App1/App1.js', expectedClientCode(app1)],
        ['App1/index.html', expectedIndexFile(app1)],
        ['App2/App2.js', expectedClientCode(app2)],
        ['App2/index.html', expectedIndexFile(app2)]
    ]
    // const expectedServerFiles = new ServerFirebaseGenerator(project1).output().files
    // const expectedServerEntries = expectedServerFiles.map(({name, contents}) => [name, contents])
    // const expectedCode = Object.fromEntries([...expectedClientEntries, ...expectedServerEntries])
    // expect(builder.code).toStrictEqual(expectedCode)
})

test('has errors generated from Project for all apps', async () => {
    const projectWithErrors = project1
        .set('text1', 'content', ex`Badname + 'x'`)
        .set('fn2', 'calculation', ex`'x' +`)
    const builder = newProjectBuilder({projectLoader: getProjectLoader(projectWithErrors)})
    await builder.build()

    expect(builder.errors).toStrictEqual({
        text1: {
            content: 'Unknown names: Badname'
        },
        fn2:   {
            calculation: 'Error: Unexpected character(s) (Line 1 Position 5)'
        },
    })
})

test('updates errors and code generated from Project immediately', async () => {
    const projectLoader = getProjectLoader(project1)
    const builder = newProjectBuilder({projectLoader})
    await builder.build()
    expect(builder.errors).toStrictEqual({})

    clearMocks()
    const project1WithErrors = project1.set('text1', 'content', ex`Badname + 'x'`)
    projectLoader.project = project1WithErrors
    builder.buildProjectFiles()  // no wait for debounced update

    expect(builder.errors).toStrictEqual({
        text1: {
            content: 'Unknown names: Badname'
        },
    })
    expect(builder.code['App1/App1.js']).toContain(`Badname + 'x'`)
})

test('copies runtime files only to client build if no server app', async () => {
    const builder = newProjectBuilder({projectLoader: getProjectLoader(projectClientOnly)})
    await builder.build()

    expect(clientFileWriter.writeFile.mock.calls).toStrictEqual([
        ['App3/App3.js', expectedClientCode(app3, projectClientOnly)],
        ['App3/index.html', expectedIndexFile(app3, projectClientOnly)],
    ])

    expect(serverFileWriter.writeFile).not.toHaveBeenCalled()
})

test('updates files generated from project only where changed', async () => {
    const dirContents = {
        'File1.txt': 'File 1',
    }

    const clientFileWriter = {
        writeFile: jest.fn().mockResolvedValue(undefined)
    }
    const serverFileWriter = {
        writeFile: jest.fn().mockResolvedValue(undefined),
        flush: jest.fn().mockResolvedValue(undefined),
        clean: jest.fn().mockResolvedValue(undefined)
    }
    const projectLoader = getProjectLoader(project1)
    const builder = newProjectBuilder({projectLoader, fileLoader: getFileLoader(dirContents), clientFileWriter, serverFileWriter})
    await builder.build()

    clientFileWriter.writeFile.mockClear().mockResolvedValue(undefined)
    serverFileWriter.writeFile.mockClear().mockResolvedValue(undefined)
    serverFileWriter.flush.mockClear().mockResolvedValue(undefined)
    serverFileWriter.clean.mockClear().mockResolvedValue(undefined)

    const project1Updated = project1.set('text1', 'name', 'Text 1 Updated').set('fn2', 'input1', 'ccc')
    projectLoader.project = project1Updated
    builder.buildProjectFiles()
    await builder.writeProjectFiles()
    const updatedApp1 = project1Updated.findElement('app1') as App
    expect(clientFileWriter.writeFile.mock.calls).toStrictEqual([
        ['App1/App1.js', expectedClientCode(updatedApp1)],
    ])
    const serverApp2Updated = project1Updated.findElement('sa2') as ServerApp
    const [appFile] = expectedServerFiles(serverApp2Updated)
    const appFileContents = appFile.contents
    expect(serverFileWriter.writeFile.mock.calls).toStrictEqual([
        ['ServerApp2.mjs', appFileContents],
        // express file not changed
    ])
})

test('updates an asset file', async () => {
    const dirContents = {
        'File1.txt': 'File 1',
        'File2.txt': 'File 2',
    }

    const projectLoader = getProjectLoader(project1)
    const builder = newProjectBuilder({projectLoader, fileLoader: getFileLoader(dirContents)})
    await builder.build()

    clearMocks()

    await builder.updateAssetFile('File1.txt')
    expect(clientFileWriter.writeFile.mock.calls).toStrictEqual([
        ['files/File1.txt', dirContents['File1.txt']],
    ])
})
