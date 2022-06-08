import Text from '../../src/model/Text'
import Button from '../../src/model/Button'
import Page from '../../src/model/Page'
import App from '../../src/model/App'
import AppBar from '../../src/model/AppBar'
import {asJSON, ex} from '../testutil/testHelpers'
import TextInput from '../../src/model/TextInput'
import {loadJSON} from '../../src/model/loadJSON'
import Project from '../../src/model/Project'
import Layout from '../../src/model/Layout'

test('Project has correct properties', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const page2 = new Page('p2', 'Page 2', {}, [])
    const app = new App('t1', 'test1', {}, [page1, page2])
    const project = new Project('pr1', 'proj1', {}, [app])

    expect(project.id).toBe('pr1')
    expect(project.name).toBe('proj1')
    expect(project.elements!.map( c => c.id )).toStrictEqual(['t1'])
})

test('can find project itself by id', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const app = new App('a1', 'test1', {}, [page1])
    const project = new Project('pr1', 'proj1', {}, [app])

    expect(project.findElement('pr1')).toBe(project)
})

test('can find app by id', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const app = new App('a1', 'test1', {}, [page1])
    const project = new Project('pr1', 'proj1', {}, [app])

    expect(project.findElement('a1')).toBe(app)
})

test('can find page by id', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const page2 = new Page('p2', 'Page 2', {}, [])
    const app = new App('t1', 'test1', {}, [page1, page2])
    const project = new Project('pr1', 'proj1', {}, [app])

    expect(project.findElement('p2')).toBe(page2)
})

let testProject = function () {
    const text1 = new Text('t1', 'Text 1', {content: ex``})
    const text2 = new Text('t2', 'Text 3', {content: ex``})
    const layout1 = new Layout('lay1', 'Layout 1', {}, [text2])
    const page1 = new Page('p1', 'Page 1', {}, [
        text1, layout1,
    ])
    const text3 = new Text('t3', 'Text 1', {content: ex``})
    const text4 = new Text('t4', 'Text 4', {content: ex``})
    const page2 = new Page('p2', 'Page 2', {}, [
        text3, text4,
    ])

    const button1 = new Button('b1', 'Button 1', {})
    const appBar = new AppBar('ab1', 'AppBar 1', {}, [button1])
    const app = new App('app1', 'App 1', {}, [page1, page2, appBar])
    const project = new Project('pr1', 'proj1', {}, [app])
    return {text1, text2, page1, text3, text4, layout1, page2, app, appBar, button1, project}
}

test('can find all elements below an element excluding pages', () => {
    const {text1, text2, page1, text3, text4, layout1, page2, app, appBar, button1, project} = testProject()
    expect(project.allElements()).toStrictEqual([app, appBar, button1])
    expect(app.allElements()).toStrictEqual([appBar, button1])
    expect(page1.allElements()).toStrictEqual([text1, layout1, text2])
    expect(page2.allElements()).toStrictEqual([text3, text4])
})

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
    const project = new Project('pr1', 'proj1', {}, [app])

    expect(project.findElementPath('pr1')).toBe('')
})

test('can find path of page by id', ()=> {
    const page1 = new Page('p1', 'Page 1', {}, [])
    const page2 = new Page('p2', 'Page 2', {}, [])
    const app = new App('app1', 'App 1', {}, [page1, page2])
    const project = new Project('pr1', 'proj1', {}, [app])

    expect(project.findElementPath('p2')).toBe('App1.Page2')
})

test('can find path of element on a page by id', ()=> {
    const {text4, project} = testProject()
    expect(project.findElementPath(text4.id)).toBe('App1.Page2.Text4')
})

test('can find path of element in a layout by id', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const innerLayout = new Layout('lay2', 'Layout 2', {}, [text2])
    const layout = new Layout('lay1', 'Layout 1', {}, [text1, innerLayout])
    const page = new Page('p1', 'Page 1', {}, [layout])
    const app = new App('app1', 'App 1', {}, [page])
    const project = new Project('proj1', 'Project 1', {}, [app])

    expect(project.findElementPath(text1.id)).toBe('App1.Page1.Text1')
    expect(project.findElementPath(text2.id)).toBe('App1.Page1.Text2')
})


test('can find element by path', () => {
    const {text4, project} = testProject()
    expect(project.findElementByPath('App1.Page2.Text4')).toBe(text4)
})

test('creates an updated object with a property set to a new value', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('t4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])

    const app = new App('a1', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = new Project('pr1', 'proj1', {}, [app])

    const updatedProject = project.set('pr1', 'name', 'Proj 1A')
    expect(updatedProject.name).toBe('Proj 1A')
    expect(updatedProject.elements).toBe(project.elements)
    expect(project.name).toBe('proj1')

    const updatedProject2 = updatedProject.set('pr1', 'elements', [app, app2])
    expect(updatedProject2.name).toBe('Proj 1A')
    expect(updatedProject2.elements!).toStrictEqual([app, app2])
    expect(updatedProject.name).toBe('Proj 1A')
    expect(updatedProject.elements!).toStrictEqual([app])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const app = new App('a1', 'App 1', {}, [page1])
    const project = new Project('pr1', 'proj1', {}, [app])
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
    const project = new Project('pr1', 'proj1', {}, [app, app2])

    const updatedProject = project.set('t4', 'content', '"Further text"')
    expect(updatedProject.name).toBe('proj1')
    expect(updatedProject.elements?.length).toBe(2)
    expect(updatedProject.elements![0]).toBe(app)
    expect(updatedProject.elements![1]).not.toBe(app2)
    expect((((updatedProject.elements![1] as App).pages[0].elementArray()[1]) as Text).content).toBe('"Further text"')
    expect((updatedProject.elements![1] as App).pages[0].elementArray()[0]).toBe(text3)
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
    const project = new Project('pr1', 'proj1', {}, [app, app2])

    test('creates an updated object on insert before element in a page and preserves unchanged objects', ()=> {

        const [updatedProject, newElement] = project.insert('before', text1.id, 'Text')
        expect((updatedProject.elements![0] as App).pages[0].elements!.map( el => el.name)).toStrictEqual(['Text 8', 'Text 1', 'Text 2'])
        expect(newElement).toBe((updatedProject.elements![0] as App).pages[0].elements![0])
        expect(newElement!.id).toBe('text_8')
        expect(newElement!.name).toBe('Text 8')
        expect((newElement as Text).content).toBe('Your text here')
        expect((updatedProject.elements![0] as App).pages[1]).toBe(app.pages[1])
    })

    test('creates an updated object on insert  element in a page and preserves unchanged objects', ()=> {

        const [updatedProject, newElement] = project.insert('after', text1.id, 'Text')
        expect((updatedProject.elements![0] as App).pages[0].elements!.map( el => el.name)).toStrictEqual(['Text 1', 'Text 8', 'Text 2'])
        expect(newElement).toBe((updatedProject.elements![0] as App).pages[0].elements![1])
        expect(newElement!.id).toBe('text_8')
        expect(newElement!.name).toBe('Text 8')
        expect((newElement as Text).content).toBe('Your text here')
        expect((updatedProject.elements![0] as App).pages[1]).toBe(app.pages[1])
    })

    test('creates an updated object on insert element inside a page and preserves unchanged objects', ()=> {
        const [updatedProject, newElement] = project.insert('inside', page1.id, 'Text')
        expect((updatedProject.elements![0] as App).pages[0].elements!.map( el => el.name)).toStrictEqual(['Text 1', 'Text 2', 'Text 8', ])
        expect(newElement).toBe((updatedProject.elements![0] as App).pages[0].elements![2])
        expect(newElement!.id).toBe('text_8')
        expect(newElement!.name).toBe('Text 8')
        expect((newElement as Text).content).toBe('Your text here')
        expect((updatedProject.elements![0] as App).pages[0]).not.toBe(app.pages[0])
        expect((updatedProject.elements![0] as App).pages[1]).toBe(app.pages[1])
    })

    test('creates an updated object on insert page and preserves unchanged objects', () => {
        const [updatedProject, newElement] = project.insert('after', page1.id, 'Page')
        expect((updatedProject.elements![0] as App).pages.map( el => el.name)).toStrictEqual(['Page 1', 'Page 3'])
        expect(newElement).toBe((updatedProject.elements![0] as App).pages[1])
        expect(newElement!.id).toBe('page_3')
        expect(newElement!.name).toBe('Page 3')
        expect((updatedProject.elements![0] as App).pages[0]).toBe(app.pages[0])
        expect((updatedProject.elements![1] as App).pages[0]).toBe(app2.pages[0])
    })

    test('returns an unchanged object on illegal insert page inside page', () => {
        const [updatedProject, newElement] = project.insert('inside', page1.id, 'Page')
        expect(updatedProject).toBe(project)
        expect(newElement).toBe(null)
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
    const project = new Project('pr1', 'proj1', {}, [app, app2])

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
        expect(project.move('inside', 'text_3', ['text_2'])).toBe(project)
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
    const project = new Project('pr1', 'proj1', {}, [app, app2])

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
    const project = new Project('pr1', 'proj1', {}, [app, app2])

    expect(project.findMaxId('Text')).toBe(7)
    expect(project.findMaxId('Page')).toBe(2)
    expect(project.findMaxId('TextInput')).toBe(0)
})



test('can contain App, not other types', () => {
    const project = new Project('id1', 'Project 1', {}, [])
    expect(project.canContain('App')).toBe(true)
    expect(project.canContain('Page')).toBe(false)
    expect(project.canContain('Project')).toBe(false)
    expect(project.canContain('Text')).toBe(false)
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
    const project = new Project('pr1', 'proj1', {}, [app, app2])

    expect(project.canInsert('inside', 'page_2', 'Text')).toBe(true)
    expect(project.canInsert('inside', 'page_2', 'Page')).toBe(false)
    expect(project.canInsert('inside', 'text_2', 'Text')).toBe(false)

    expect(project.canInsert('before', 'page_2', 'Text')).toBe(false)
    expect(project.canInsert('before', 'page_2', 'Page')).toBe(true)
    expect(project.canInsert('before', 'text_2', 'Text')).toBe(true)
    expect(project.canInsert('before', 'text_2', 'Page')).toBe(false)

    expect(project.canInsert('after', 'page_2', 'Text')).toBe(false)
    expect(project.canInsert('after', 'page_2', 'Page')).toBe(true)
    expect(project.canInsert('after', 'page_2', 'App')).toBe(false)
    expect(project.canInsert('after', 'app', 'App')).toBe(true)

})

test('converts to JSON', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('t4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])

    const app = new App('a1', 'App 1', {author: `Jo`}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = new Project('pr1', 'Project 1', {}, [app, app2])

    expect(asJSON(project)).toStrictEqual({
        kind: 'Project',
        id: 'pr1',
        name: 'Project 1',
        properties: project.properties,
        elements: [asJSON(app), asJSON(app2)]
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
    const project = new Project('pr1', 'proj1', {}, [app, app2])
    const newProject = loadJSON(asJSON(project))
    expect(newProject).toStrictEqual<Project>(project)
})