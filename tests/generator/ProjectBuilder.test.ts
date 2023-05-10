import ProjectBuilder, {type ProjectLoader} from '../../src/generator/ProjectBuilder'
import Project from '../../src/model/Project'
import App from '../../src/model/App'
import Page from '../../src/model/Page'
import Text from '../../src/model/Text'
import {generate} from '../../src/generator/index'
import TextType from '../../src/model/types/TextType'
import NumberType from '../../src/model/types/NumberType'
import DataTypes from '../../src/model/types/DataTypes'
import {ex} from '../testutil/testHelpers'
import FunctionDef from '../../src/model/FunctionDef'
import ServerApp from '../../src/model/ServerApp'
import ServerFirebaseGenerator from '../../src/generator/ServerFirebaseGenerator'


const name = new TextType('id1', 'Name', {required: true})
const itemAmount = new NumberType('id2', 'Item Amount', {})
const dataTypes1 = new DataTypes('dt1', 'Types 1', {}, [name])
const dataTypes2 = new DataTypes('dt2', 'Types 2', {}, [itemAmount])

const app1 = new App('app1', 'App 1', {}, [
    new Page('p1', 'Page 1', {}, [
            new Text('id1', 'Text 1', {content: ex`"Uses Data Types 1" + Types1.Name`}),
        ]
    )
])
const app2 = new App('app2', 'App 2', {}, [
    new Page('p2', 'Page 2', {}, [
            new Text('id2', 'Text 2', {content: ex`"Uses Data Types 2" + Types2.ItemAmount`}),
        ]
    )
])
const app3 = new App('app3', 'App 3', {}, [
    new Page('p3', 'Page 3', {}, [
            new Text('id3', 'Text 3', {content: 'Another text'}),
        ]
    )
])

const plusFn = new FunctionDef('fn1', 'Plus', {input1: 'a', input2: 'b', calculation: ex`Sum(a, b)`})
const multFn = new FunctionDef('fn2', 'Mult', {input1: 'c', input2: 'd', calculation: ex`c * d`})
const serverApp1 = new ServerApp('sa1', 'Server App 1', {}, [plusFn])
const serverApp2 = new ServerApp('sa2', 'Server App 2', {}, [multFn])

const project1 = new Project('proj1', 'Project 1', {}, [app1, app2, serverApp1, serverApp2, dataTypes1, dataTypes2])
const projectClientOnly = new Project('proj2', 'Project Client Only', {}, [app3])

const expectedClientCode = (app: App, project: Project = project1) => generate(app, project).code
const expectedIndexFile = (app: App, project: Project = project1) => generate(app, project).html

const projectLoader = (project: Project):ProjectLoader => ({
    getProject: jest.fn().mockResolvedValue(project)
})

const clientFileWriter = {
    writeFile: jest.fn()
}
const serverFileWriter = {
    writeFile: jest.fn()
}
const fileLoader = {
    listFiles: jest.fn().mockResolvedValue([]),
    readFile: jest.fn()
}

const runtimeLoader = {
    getFile: jest.fn().mockImplementation((filename: string) => Promise.resolve(`Contents of ${filename}`))
}

beforeEach(() => {
    clientFileWriter.writeFile.mockClear()
    serverFileWriter.writeFile.mockClear()
    runtimeLoader.getFile.mockClear()
})

test('writes client files for all apps to client build with one copy of asset', async () => {
    const dirContents = {
        'Image1.jpg': new Uint8Array([1,2,3]),
        'File2.pdf': new Uint8Array([4,5,6]),
    }
    // Local override of global fileLoader
    const fileLoader = {
        listFiles: jest.fn().mockResolvedValue(Object.keys(dirContents)),
        readFile: jest.fn().mockImplementation((filepath: string) => Promise.resolve(dirContents[filepath.split('/')[1] as keyof typeof dirContents]))
    }

    const builder = new ProjectBuilder({projectLoader: projectLoader(project1), fileLoader, runtimeLoader, clientFileWriter, serverFileWriter})
    await builder.build()

    expect(fileLoader.listFiles).toHaveBeenCalledWith('files')
    expect(fileLoader.readFile.mock.calls).toStrictEqual([['files/Image1.jpg'], ['files/File2.pdf']])
    expect(clientFileWriter.writeFile.mock.calls).toStrictEqual([
        ['App1.js', expectedClientCode(app1)],
        ['index.html', expectedIndexFile(app1)],
        ['App2.js', expectedClientCode(app2)],
        ['App2.html', expectedIndexFile(app2)],
        ['runtime.js', 'Contents of runtime.js'],
        ['runtime.js.map', 'Contents of runtime.js.map'],
        ['files/Image1.jpg', dirContents['Image1.jpg']],
        ['files/File2.pdf', dirContents['File2.pdf']],
    ])
})

test('writes server files generated from Project for all apps', async () => {
    const builder = new ProjectBuilder({projectLoader: projectLoader(project1), fileLoader, runtimeLoader, clientFileWriter, serverFileWriter})
    await builder.build()

    const expectedServerFiles = new ServerFirebaseGenerator(project1).output().files
    const expectedGeneratedCalls = expectedServerFiles.map(({name, contents}) => [name, contents])
    expect(runtimeLoader.getFile.mock.calls).toStrictEqual([['runtime.js'], ['runtime.js.map'], ['serverRuntime.js'], ['serverRuntime.js.map'] ])
    expect(serverFileWriter.writeFile.mock.calls).toStrictEqual([
        ...expectedGeneratedCalls,
        ['serverRuntime.js', 'Contents of serverRuntime.js'],
        ['serverRuntime.js.map', 'Contents of serverRuntime.js.map'],
    ])
})

test('copies runtime files only to client build if no server app', async () => {
    const builder = new ProjectBuilder({
        projectLoader: projectLoader(projectClientOnly),
        fileLoader,
        runtimeLoader,
        clientFileWriter,
        serverFileWriter
    })
    await builder.build()

    expect(runtimeLoader.getFile.mock.calls).toStrictEqual([['runtime.js'], ['runtime.js.map'] ])
    expect(clientFileWriter.writeFile.mock.calls).toStrictEqual([
        ['App3.js', expectedClientCode(app3, projectClientOnly)],
        ['index.html', expectedIndexFile(app3, projectClientOnly)],
        ['runtime.js', 'Contents of runtime.js'],
        ['runtime.js.map', 'Contents of runtime.js.map'],
    ])

    expect(jest.fn()).not.toHaveBeenCalled()
})