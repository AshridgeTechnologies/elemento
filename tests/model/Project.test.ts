import Text from '../../src/model/Text'
import Button from '../../src/model/Button'
import Page from '../../src/model/Page'
import App from '../../src/model/App'
import AppBar from '../../src/model/AppBar'
import {asJSON, ex} from '../testutil/testHelpers'
import TextInput from '../../src/model/TextInput'
import {loadJSON} from '../../src/model/loadJSON'
import Project, {COMPONENTS_ID, TOOLS_ID} from '../../src/model/Project'
import Block from '../../src/model/Block'
import FileFolder from '../../src/model/FileFolder'
import File from '../../src/model/File'
import {ConfirmAction} from '../../src/editor/Types'
import ToolFolder from '../../src/model/ToolFolder'
import Tool from '../../src/model/Tool'
import ToolImport from '../../src/model/ToolImport'
import ServerApp from '../../src/model/ServerApp'
import ComponentFolder from '../../src/model/ComponentFolder'
import ComponentDef from '../../src/model/ComponentDef'
import ComponentInstance from '../../src/model/ComponentInstance'
import Collection from '../../src/model/Collection'

const newToolFolder = new ToolFolder(TOOLS_ID, 'Tools', {})
const newComponentFolder = new ComponentFolder(COMPONENTS_ID, 'Components', {})

const standardActions = [
    'insert',
    new ConfirmAction('delete'),
    'copy', 'cut', 'pasteAfter', 'pasteBefore', 'pasteInside', 'duplicate',
    'undo', 'redo'
]

test('Project has correct properties', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const page2 = new Page('p2', 'Page 2', {}, [])
    const app = new App('t1', 'test1', {}, [page1, page2])
    const project = Project.new([app])

    expect(project.id).toBe('project_1')
    expect(project.name).toBe('New Project')
    expect(project.elements!.map( c => c.id )).toStrictEqual(['t1', TOOLS_ID, COMPONENTS_ID])
})

test('can find project itself by id', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const app = new App('a1', 'test1', {}, [page1])
    const project = Project.new([app])

    expect(project.findElement('project_1')).toBe(project)
})

test('can find app by id', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const app = new App('a1', 'test1', {}, [page1])
    const project = Project.new([app])

    expect(project.findElement('a1')).toBe(app)
})

test('can find page by id', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const page2 = new Page('p2', 'Page 2', {}, [])
    const app = new App('t1', 'test1', {}, [page1, page2])
    const project = Project.new([app])

    expect(project.findElement('p2')).toBe(page2)
})

let testProject = function () {
    const text1 = new Text('t1', 'Text 1', {content: ex``})
    const text2 = new Text('t2', 'Text 3', {content: ex``})
    const layout1 = new Block('lay1', 'Layout 1', {}, [text2])
    const page1 = new Page('p1', 'Page 1', {}, [
        text1, layout1,
    ])
    const text3 = new Text('t3', 'Text 1', {content: ex``})
    const text4 = new Text('t4', 'Text 4', {content: ex``})
    const text5 = new Text('t5', 'Text 3', {content: ex`Same name as text2`})
    const comp1 = new ComponentInstance('ci1', 'Comp 1', {componentType: 'CompType1'})
    const page2 = new Page('p2', 'Page 2', {}, [
        text3, text4, text5, comp1
    ])

    const button1 = new Button('b1', 'Button 1', {})
    const appBar = new AppBar('ab1', 'AppBar 1', {}, [button1])
    const app = new App('app1', 'App 1', {}, [page1, page2, appBar])
    const compDef1 = new ComponentDef('cd1', 'Comp Type 1', {input1: 'source', input2: 'destination', input4: 'route'})
    const compFolder = new ComponentFolder(COMPONENTS_ID, 'Components', {}, [compDef1])
    const project = Project.new([app, compFolder])
    return {text1, text2, page1, text3, text4, text5, comp1, layout1, page2, app, appBar, button1, compDef1, project}
}

test('can find element by id', ()=> {
    const {text4, project} = testProject()
    expect(project.findElement('t4')).toBe(text4)
})

test('can find parent of element by id', ()=> {
    const {project} = testProject()
    expect(project.findParent('pr1')).toBe(null)
    expect(project.findParent('app1')).toBe(project)
    expect(project.findParent('t4')).toBe(project.findElement('p2'))
    expect(project.findParent('xxx')).toBe(null)
})

test('path of project itself is empty string', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const app = new App('a1', 'test1', {}, [page1])
    const project = Project.new([app])

    expect(project.findElementPath('project_1')).toBe('')
})

test('can find path of page by id', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const page2 = new Page('p2', 'Page 2', {}, [])
    const app = new App('app1', 'App 1', {}, [page1, page2])
    const project = Project.new([app])

    expect(project.findElementPath('p2')).toBe('App1.Page2')
})

test('can find path of element on a page by id', ()=> {
    const {text4, project} = testProject()
    expect(project.findElementPath(text4.id)).toBe('App1.Page2.Text4')
})

test('can find path of element in a layout by id', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const innerBlock = new Block('lay2', 'Layout 2', {}, [text2])
    const block = new Block('lay1', 'Layout 1', {}, [text1, innerBlock])
    const page = new Page('p1', 'Page 1', {}, [block])
    const app = new App('app1', 'App 1', {}, [page])
    const project = Project.new([app])

    expect(project.findElementPath(text1.id)).toBe('App1.Page1.Text1')
    expect(project.findElementPath(text2.id)).toBe('App1.Page1.Text2')
})

test('can find element by path', () => {
    const {text4, project} = testProject()
    expect(project.findElementByPath('App1.Page2.Text4')).toBe(text4)
})

test('can find element by path where two elements have the same name', () => {
    const {text5, project} = testProject()
    expect(project.findElementByPath('App1.Page2.Text3')).toBe(text5)
})

test('can find child elements by type', () => {
    const text1 = new Text('t1', 'Text 1', {content: ex``})
    const page1 = new Page('p1', 'Page 1', {}, [text1,])

    const app = new App('app1', 'App 1', {}, [page1])
    const serverApp1 = new ServerApp('sa1', 'Live', {})
    const serverApp2 = new ServerApp('sa2', 'Live 2', {})
    const project = Project.new([app, serverApp1, serverApp2])
    expect(project.findChildElements(ServerApp)).toStrictEqual([serverApp1, serverApp2])
})

test('knows if has server apps', () => {
    const text1 = new Text('t1', 'Text 1', {content: ex``})
    const page1 = new Page('p1', 'Page 1', {}, [text1,])

    const app = new App('app1', 'App 1', {}, [page1])
    const serverApp1 = new ServerApp('sa1', 'Live', {})
    const projectClientOnly = Project.new([app])
    const projectWithServerApps = Project.new([app, serverApp1])
    expect(projectClientOnly.hasServerApps).toBe(false)
    expect(projectWithServerApps.hasServerApps).toBe(true)

})

test('can find elements under project by selector function', () => {
    const {project, text2, text5} = testProject()
    expect(project.findElementsBy( el => el.name === 'Text 3')).toStrictEqual([text2, text5])
})

test('can find elements under page by selector function', () => {
    const {page1, text2} = testProject()
    expect(page1.findElementsBy( el => el.name === 'Text 3')).toStrictEqual([text2])
})

test('can find elements including page by selector function', () => {
    const {page1, text2} = testProject()
    expect(page1.findElementsBy( el => el.name === 'Text 3' || el.kind === 'Page')).toStrictEqual([page1, text2])
})

test('can find property definitions of built-in and user-defined elements', () => {
    const {project, text1, comp1} = testProject()
    expect(project.propertyDefsOf(text1).map( def => def.name)).toStrictEqual(['content', 'allowHtml', 'show', 'styles'])
    expect(project.propertyDefsOf(comp1).map( def => def.name)).toStrictEqual(['source', 'destination', 'route', 'show', 'styles'])
})

test('creates an updated object with a property set to a new value', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('t4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])

    const app = new App('a1', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = Project.new([app])

    const updatedProject = project.set('project_1', 'name', 'Proj 1A')
    expect(updatedProject.name).toBe('Proj 1A')
    expect(updatedProject.elements).toStrictEqual(project.elements)
    expect(project.name).toBe('New Project')

    const updatedProject2 = updatedProject.set('project_1', 'elements', [app, app2])
    expect(updatedProject2.name).toBe('Proj 1A')
    expect(updatedProject2.elements!).toStrictEqual([app, app2, newToolFolder, newComponentFolder])
    expect(updatedProject.name).toBe('Proj 1A')
    expect(updatedProject.elements!).toStrictEqual([app, newToolFolder, newComponentFolder])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const app = new App('a1', 'App 1', {}, [page1])
    const project = Project.new([app])
    const updatedProject = project.set('x1', 'name', 'Proj 1A')
    expect(updatedProject).toBe(project)
})

test('creates an updated object if a property in a contained object is changed and keeps unchanged objects', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('t4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])

    const app = new App('a1', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = Project.new([app, app2])

    const updatedProject = project.set('t4', 'content', '"Further text"')
    expect(updatedProject.name).toBe('New Project')
    expect(updatedProject.elements?.length).toBe(4)
    expect(updatedProject.elements![0]).toBe(app)
    expect(updatedProject.elements![1]).not.toBe(app2)
    expect((((updatedProject.elements![1] as App).pages[0].elementArray()[1]) as Text).content).toBe('"Further text"')
    expect((updatedProject.elements![1] as App).pages[0].elementArray()[0]).toBe(text3)
})

test('insert menu items includes built-in and user-defined components', () => {
    const {project, page1, compDef1} = testProject()
    const insertItems = project.insertMenuItems('inside', page1.id)
    expect(insertItems).toContain('TextInput')
    expect(insertItems).toContain(compDef1.codeName)
})

describe('Insert new element', () => {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('text_2', 'Text 2', {content: ex`"Some text"`})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('text_7', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const app = new App('app', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = Project.new([app, app2])

    test('creates an updated object on insert before element in a page and preserves unchanged objects', ()=> {

        const [updatedProject, newElement] = project.insertNew('before', text1.id, 'Text', {})
        expect((updatedProject.elements![0] as App).pages[0].elements!.map( el => el.name)).toStrictEqual(['Text 8', 'Text 1', 'Text 2'])
        expect(newElement).toBe((updatedProject.elements![0] as App).pages[0].elements![0])
        expect(newElement!.id).toBe('text_8')
        expect(newElement!.name).toBe('Text 8')
        expect((newElement as Text).content).toBe('Your text here')
        expect((updatedProject.elements![0] as App).pages[1]).toBe(app.pages[1])
    })

    test('creates an updated object on insert element in a page and preserves unchanged objects', ()=> {

        const [updatedProject, newElement] = project.insertNew('after', text1.id, 'Text', {})
        expect((updatedProject.elements![0] as App).pages[0].elements!.map( el => el.name)).toStrictEqual(['Text 1', 'Text 8', 'Text 2'])
        expect(newElement).toBe((updatedProject.elements![0] as App).pages[0].elements![1])
        expect(newElement!.id).toBe('text_8')
        expect(newElement!.name).toBe('Text 8')
        expect((newElement as Text).content).toBe('Your text here')
        expect((updatedProject.elements![0] as App).pages[1]).toBe(app.pages[1])
    })

    test('creates an updated object on insert element inside a page and preserves unchanged objects', ()=> {
        const [updatedProject, newElement] = project.insertNew('inside', page1.id, 'Text', {})
        expect((updatedProject.elements![0] as App).pages[0].elements!.map( el => el.name)).toStrictEqual(['Text 1', 'Text 2', 'Text 8', ])
        expect(newElement).toBe((updatedProject.elements![0] as App).pages[0].elements![2])
        expect(newElement!.id).toBe('text_8')
        expect(newElement!.name).toBe('Text 8')
        expect((newElement as Text).content).toBe('Your text here')
        expect((updatedProject.elements![0] as App).pages[0]).not.toBe(app.pages[0])
        expect((updatedProject.elements![0] as App).pages[1]).toBe(app.pages[1])
    })

    test('creates an updated object on insert page and preserves unchanged objects', () => {
        const [updatedProject, newElement] = project.insertNew('after', page1.id, 'Page', {})
        expect((updatedProject.elements![0] as App).pages.map( el => el.name)).toStrictEqual(['Page 1', 'Page 3'])
        expect(newElement).toBe((updatedProject.elements![0] as App).pages[1])
        expect(newElement!.id).toBe('page_3')
        expect(newElement!.name).toBe('Page 3')
        expect((updatedProject.elements![0] as App).pages[0]).toBe(app.pages[0])
        expect((updatedProject.elements![1] as App).pages[0]).toBe(app2.pages[0])
    })

    test('exception on illegal insert page inside page', () => {
        expect( ()=> project.insertNew('inside', page1.id, 'App', {})).toThrow(/Cannot insert elements of types App inside Page/)
    })
})

describe('Insert element', () => {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('text_2', 'Text 2', {content: ex`"Some text"`})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('text_7', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const app = new App('app', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = Project.new([app, app2])

    test('creates an updated object on insert before element in a page and preserves unchanged objects', () => {

        const insertedElement = new Text('originalId', 'Text 99', {content: 'Hi!'})
        const [updatedProject, newElements] = project.insert('before', text1.id, insertedElement)
        const newElement = newElements[0]
        expect((updatedProject.elements![0] as App).pages[0].elements!.map(el => el.name)).toStrictEqual(['Text 99', 'Text 1', 'Text 2'])
        expect(newElement).not.toBe(insertedElement)
        expect(newElement).toBe((updatedProject.elements![0] as App).pages[0].elements![0])
        expect(newElement.id).toBe('text_8')
        expect(newElement.name).toBe('Text 99')
        expect((newElement as Text).content).toBe('Hi!')
        expect((updatedProject.elements![0] as App).pages[1]).toBe(app.pages[1])
    })
})

describe('Move element', () => {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('text_2', 'Text 2', {content: ex`"Some text"`})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('text_4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const app = new App('app', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = Project.new([app, app2])

    test('moves single element after another in the same page', () => {
        const originalPage1 = project.findElement('page_1')
        const updatedProject = project.move('after', 'text_4', ['text_3'])
        expect(updatedProject.findElement('page_1')).toBe(originalPage1)
        expect(updatedProject.findElement('page_2')?.elements).toStrictEqual([text4, text3])
    })

    test('moves single element after another in a different page', () => {
        const updatedProject = project.move('after', 'text_3', ['text_1'])
        expect(updatedProject.findElement('page_1')?.elements).toStrictEqual([text2])
        expect(updatedProject.findElement('page_2')?.elements).toStrictEqual([text3, text1, text4])
    })

    test('moves single element inside another at the start', () => {
        const updatedProject = project.move('inside', 'page_2', ['text_2'])
        expect(updatedProject.findElement('page_1')?.elements).toStrictEqual([text1])
        expect(updatedProject.findElement('page_2')?.elements).toStrictEqual([text2, text3, text4])
    })

    test('moves multiple elements element inside another at the start', () => {
        const updatedProject = project.move('inside', 'page_2', ['text_1', 'text_2'])
        expect(updatedProject.findElement('page_1')?.elements).toStrictEqual([])
        expect(updatedProject.findElement('page_2')?.elements).toStrictEqual([text1, text2, text3, text4])
    })

    test('moves multiple elements element after another', () => {
        const updatedProject = project.move('after', 'text_3', ['text_1', 'text_2'])
        expect(updatedProject.findElement('page_1')?.elements).toStrictEqual([])
        expect(updatedProject.findElement('page_2')?.elements).toStrictEqual([text3, text1, text2, text4])
    })

    test('ignores an illegal move', () => {
        expect(project.move('inside', 'text_3', ['page_1'])).toBe(project)
        expect(project.move('after', 'app', ['page_2'])).toBe(project)
        expect(project.move('inside', 'page_2', ['text_2', 'page_1'])).toBe(project)
    })
})

test('creates an updated object on delete element on a page and preserves unchanged objects', ()=> {
    const text1 = new Text('text_1', 'Text 1', {content: '"Some text"'})
    const text2 = new Text('text_2', 'Text 2', {content: '"Some text"'})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_3', 'Text 3', {content: '"Some text 3"'})
    const text4 = new Text('text_7', 'Text 4', {content: '"Some text 4"'})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const app = new App('app', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = Project.new([app, app2])

    const updatedProject = project.delete(text3.id)
    expect((updatedProject.elements![1] as App).pages[0].elements!.map( el => el.name)).toStrictEqual(['Text 4'])
    expect((updatedProject.elements![0] as App).pages[0]).toBe(app.pages[0])
})

test('finds max id for element type', ()=> {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('text_2', 'Text 2', {content: ex`"Some text"`})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_7', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('TEXT_8', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const app = new App('app', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = Project.new([app, app2])

    expect(project.findMaxId('Text')).toBe(7)
    expect(project.findMaxId('Page')).toBe(2)
    expect(project.findMaxId('TextInput')).toBe(0)
})

test('can contain App, not other types', () => {
    const project = Project.new()
    expect(project.canContain('App')).toBe(true)
    expect(project.canContain('ServerApp')).toBe(true)
    expect(project.canContain('Page')).toBe(false)
    expect(project.canContain('Project')).toBe(false)
    expect(project.canContain('Text')).toBe(false)
    expect(project.canContain('DataTypes')).toBe(true)
    expect(project.canContain('FileFolder')).toBe(false)
    expect(project.canContain('ToolFolder')).toBe(false)
})

test('finds element types that can insert for a position and target element', () => {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('text_2', 'Text 2', {content: ex`"Some text"`})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('text_7', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const app = new App('app', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = Project.new([app, app2])

    expect(project.canInsert('inside', 'page_2', 'Text')).toBe(true)
    expect(project.canInsert('inside', 'page_2', 'Page')).toBe(false)
    expect(project.canInsert('inside', 'text_2', 'Text')).toBe(true)

    expect(project.canInsert('before', 'page_2', 'Text')).toBe(false)
    expect(project.canInsert('before', 'page_2', 'Page')).toBe(true)
    expect(project.canInsert('before', 'text_2', 'Text')).toBe(true)
    expect(project.canInsert('before', 'text_2', 'Page')).toBe(false)

    expect(project.canInsert('after', 'page_2', 'Text')).toBe(false)
    expect(project.canInsert('after', 'page_2', 'Page')).toBe(true)
    expect(project.canInsert('after', 'page_2', 'App')).toBe(false)
    expect(project.canInsert('after', 'app', 'App')).toBe(true)

})

test('gets actions available for a single item', () => {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('t4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])

    const app = new App('a1', 'App 1', {author: `Jo`}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const file1 = new File('f1', 'Image1.jpg', {})
    const files = new FileFolder('_FILES', 'Files', {}, [file1])
    const tool1 = new Tool('tool1', 'Tool 1', {})
    const toolImport1 = new ToolImport('toolImp1', 'Tool Import 1', {})
    const tools = new ToolFolder('_TOOLS', 'Tools', {}, [tool1, toolImport1])
    const project = Project.new([app, app2, files, tools])

    const textActions = project.actionsAvailable(['t1'])
    expect(textActions).toStrictEqual(standardActions)

    const pageActions = project.actionsAvailable(['p1'])
    expect(pageActions).toStrictEqual(standardActions)

    const toolActions = project.actionsAvailable(['tool1'])
    expect(toolActions).toStrictEqual(['show', ...standardActions])

    const toolImportActions = project.actionsAvailable(['toolImp1'])
    expect(toolImportActions).toStrictEqual(['show', ...standardActions])

    expect( project.actionsAvailable(['_FILES'])).toStrictEqual(['upload', 'undo', 'redo'])
    expect( project.actionsAvailable(['_TOOLS'])).toStrictEqual(['insert', 'pasteInside', 'undo', 'redo'])
    expect( project.actionsAvailable(['_COMPONENTS'])).toStrictEqual(['insert', 'pasteInside', 'undo', 'redo'])
    expect( project.actionsAvailable(['f1'])).toStrictEqual([new ConfirmAction('delete'), 'undo', 'redo'])
})

test('cannot delete a Component that is in use', () => {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const comp1 = new ComponentInstance('ci1', 'Comp 1', {componentType: 'CompType1'})
    const page1 = new Page('p1', 'Page 1', {}, [text1, comp1])

    const app = new App('app1', 'App 1', {}, [page1])
    const compDef1 = new ComponentDef('cd1', 'Comp Type 1', {input1: 'source', input2: 'destination', input4: 'route'})
    const compDef2 = new ComponentDef('cd2', 'Comp Type 2', {input1: 'high', input2: 'low'})
    const compFolder = new ComponentFolder(COMPONENTS_ID, 'Components', {}, [compDef1, compDef2])
    const project = Project.new([app, compFolder])

    const componentInUseActions = standardActions.filter( a => !(a instanceof ConfirmAction))
    expect(project.actionsAvailable(['cd1'])).toStrictEqual(componentInUseActions)
    expect(project.actionsAvailable(['cd2'])).toStrictEqual(standardActions)
})

test('gets actions available for multiple items', () => {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])

    const app = new App('a1', 'App 1', {author: `Jo`}, [page1])
    const file1 = new File('f1', 'Image1.jpg', {})
    const files = new FileFolder('_FILES', 'Files', {}, [file1])
    const project = Project.new([app, files])

    const actions = project.actionsAvailable(['p1', 't1'])
    expect(actions).toStrictEqual([
        'insert',
        new ConfirmAction('delete'),
        'copy', 'cut', 'duplicate',
        'undo', 'redo'
    ])

    const filePageActions = project.actionsAvailable(['p1', 'f1'])
    expect(filePageActions).toStrictEqual([
        new ConfirmAction('delete'),
        'undo', 'redo'
    ])
})

test('adds Files element', () => {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('page_1', 'Page 1', {}, [text1])
    const text3 = new Text('text_7', 'Text 3', {content: ex`"Some text 3"`})
    const page2 = new Page('page_2', 'Page 2', {}, [text3])
    const app = new App('app', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const bareProject = Project.new([app, app2])

    const project = bareProject.withFiles(['Image 1.jpg', 'Form 2.pdf'])
    expect(project.elementArray()[4]).toStrictEqual(new FileFolder('_FILES', 'Files', {}, [
        new File('file_1', 'Image 1.jpg', {}),
        new File('file_2', 'Form 2.pdf', {}),
    ]))
})

test('converts to JSON, excludes Files', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('t4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])

    const app = new App('a1', 'App 1', {author: `Jo`}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const files = new FileFolder('_FILES', 'Files', {})
    const project = Project.new([app, app2, files])

    expect(asJSON(project.withoutFiles())).toStrictEqual({
        kind: 'Project',
        id: 'project_1',
        name: 'New Project',
        properties: project.properties,
        elements: [asJSON(app), asJSON(app2), asJSON(newToolFolder), asJSON(newComponentFolder)]
    })

})

test('converts from plain object', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const textInput4 = new TextInput('t4', 'Text 4', {initialValue: ex`"Some text"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, textInput4])

    const app = new App('a1', 'App 1', {author: `Jo`}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = Project.new([app, app2])
    const newProject = loadJSON(asJSON(project))
    expect(newProject).toStrictEqual<Project>(project)
})

test('new project has ToolFolder and ComponentFolder', () => {
    const project = Project.new()
    expect(project.elementArray()).toStrictEqual([newToolFolder, newComponentFolder])
})

test('if no ToolFolder or ComponentFolder in the elements of existing, adds one', () => {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const app = new App('a1', 'App 1', {author: `Jo`}, [page1])
    const project = Project.new([app])
    const json = asJSON(project)
    json.elements = json.elements.filter( (el:any) => el.kind !== 'ToolFolder')
    const loadedProject = loadJSON(json) as Project
    expect(loadedProject.elementArray()).toStrictEqual([app, newComponentFolder, newToolFolder])
})

test('findClosestElementByCodeName finds in Page or App', () => {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1, text2])
    const text1a = new Text('t11', 'Text 1', {content: ex`"Some stuff"`})
    const text3 = new Text('t3', 'Text 3', {content: ex`"More stuff"`})
    const page2 = new Page('p2', 'Page 2', {}, [text1a, text3])

    const text2a = new Text('t2a', 'Text 2', {content: ex`"Top stuff"`})
    const text3a = new Text('t3a', 'Text 3', {content: ex`"Other stuff"`})
    const appBar = new AppBar('ab1', 'The App Bar', {}, [text2a, text3a]  )
    const app = new App('a1', 'App 1', {author: `Jo`}, [page1, page2, appBar])
    const project = Project.new([app])

    expect(project.findClosestElementByCodeName('t1', 'xxx')).toBe(undefined)
    expect(project.findClosestElementByCodeName('t2', 'Text1')).toBe(text1)
    expect(project.findClosestElementByCodeName('t3', 'Text1')).toBe(text1a)
    expect(project.findClosestElementByCodeName('t1', 'Text2')).toBe(text2)
    expect(project.findClosestElementByCodeName('t11', 'Text2')).toBe(text2a)
    expect(project.findClosestElementByCodeName('t2a', 'TheAppBar')).toBe(appBar)
    expect(project.findClosestElementByCodeName('t3a', 'Text2')).toBe(text2a)
})
