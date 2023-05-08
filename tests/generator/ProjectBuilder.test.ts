import ProjectBuilder, {type FileWriter, type ProjectLoader} from '../../src/generator/ProjectBuilder'
import Project from '../../src/model/Project'
import App from '../../src/model/App'
import Page from '../../src/model/Page'
import Text from '../../src/model/Text'
import {generate} from '../../src/generator/index'
import MockedFunction = jest.MockedFunction
import TextType from '../../src/model/types/TextType'
import NumberType from '../../src/model/types/NumberType'
import DataTypes from '../../src/model/types/DataTypes'
import {ex} from '../testutil/testHelpers'
import FunctionDef from '../../src/model/FunctionDef'
import ServerApp from '../../src/model/ServerApp'
import {generateServerApp} from '../../src/generator/Generator'

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
    new Page('p2', 'Page 1', {}, [
            new Text('id2', 'Text 1', {content: ex`"Uses Data Types 2" + Types2.ItemAmount`}),
        ]
    )
])

const plusFn = new FunctionDef('fn1', 'Plus', {input1: 'a', input2: 'b', calculation: ex`Sum(a, b)`})
const multFn = new FunctionDef('fn2', 'Mult', {input1: 'c', input2: 'd', calculation: ex`c * d`})
const serverApp1 = new ServerApp('sa1', 'Server App 1', {}, [plusFn])
const serverApp2 = new ServerApp('sa2', 'Server App 2', {}, [multFn])

const project1 = new Project('proj1', 'Project 1', {}, [app1, app2, serverApp1, serverApp2, dataTypes1, dataTypes2])

const expectedClientCode = (app: App) => generate(app, project1).code
const expectedIndexFile = (app: App) => generate(app, project1).html

const projectLoader = {
    getProject: jest.fn().mockResolvedValue(project1)
} as ProjectLoader
const dummyWriter = {
    writeFile: jest.fn()
} as FileWriter

test('writes client files generated from Project for all apps', async () => {
    const clientWriterMock: MockedFunction<any> = jest.fn()
    const clientFileWriter = {
        writeFile: clientWriterMock
    } as FileWriter
    const builder = new ProjectBuilder({projectLoader, clientFileWriter, serverFileWriter: dummyWriter})
    await builder.build()

    expect(clientWriterMock.mock.calls).toStrictEqual([
        ['App1.js', expectedClientCode(app1)],
        ['index.html', expectedIndexFile(app1)],
        ['App2.js', expectedClientCode(app2)],
        ['App2.html', expectedIndexFile(app2)]
    ])
})

test.skip('writes server files generated from Project for all apps', async () => {
    const serverWriterMock: MockedFunction<any> = jest.fn()
    const serverFileWriter = {
        writeFile: serverWriterMock
    } as FileWriter
    const builder = new ProjectBuilder({projectLoader, clientFileWriter: dummyWriter, serverFileWriter})
    await builder.build()

    const expectedServerFiles = generateServerApp(serverApp1).files
    const expectedWriterCalls = expectedServerFiles.map(({name, contents}) => [name, contents])
    expect(serverWriterMock.mock.calls).toStrictEqual(expectedWriterCalls)
})
