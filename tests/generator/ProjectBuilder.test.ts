import ProjectBuilder, {type FileWriter, type ProjectLoader} from '../../src/generator/ProjectBuilder'
import Project from '../../src/model/Project'
import App from '../../src/model/App'
import Page from '../../src/model/Page'
import Text from '../../src/model/Text'
import {ex} from '../testutil/testHelpers'
import {generate} from '../../src/generator/index'
import MockedFunction = jest.MockedFunction

const app1 = new App('app1', 'App 1', {}, [
    new Page('p1', 'Page 1', {}, [
            new Text('id1', 'Text 1', {content: 'Hi there!'}),
        ]
    )
])
const app2 = new App('app2', 'App 2', {}, [
    new Page('p2', 'Page 1', {}, [
            new Text('id2', 'Text 1', {content: 'Hi again!'}),
        ]
    )
])

const project1 = new Project('proj1', 'Project 1', {}, [app1, app2])
const expectedClientCode = (app: App) => generate(app, project1).code

const expectedIndexFile = (app: App) => generate(app, project1).html

test('writes client files generated from Project for all apps', async () => {
    const writeFileMock: MockedFunction<any> = jest.fn()
    const projectLoader = {
        getProject: jest.fn().mockResolvedValue(project1)
    } as ProjectLoader
    const fileWriter = {
        writeFile: writeFileMock
    } as FileWriter
    const builder = new ProjectBuilder({projectLoader, fileWriter})
    await builder.build()

    expect(writeFileMock.mock.calls).toStrictEqual([
        ['App1.js', expectedClientCode(app1)],
        ['index.html', expectedIndexFile(app1)],
        ['App2.js', expectedClientCode(app2)],
        ['App2.html', expectedIndexFile(app2)]
    ])
})