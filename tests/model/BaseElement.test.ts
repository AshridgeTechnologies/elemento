import {describe, expect, test} from "vitest"
import {ex} from '../testutil/testHelpers'
import Page from '../../src/model/Page'
import App from '../../src/model/App'
import Project1 from '../../src/model/Project'
import {newIdTransformer} from '../../src/model/BaseElement'
import {Text} from '../testutil/modelHelpers'

test('keeps notes when updating another property', () => {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`, notes: 'Some notes'})
    const updatedProps = {...text1.properties, allowHtml: true}
    expect(text1.notes).toBe('Some notes')
    const text1a = text1.create(text1.id, text1.name, updatedProps, text1.elements)
    expect(text1a.notes).toBe('Some notes')
})

test('can update notes', () => {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`, notes: 'Some notes'})
    const updatedProps = {...text1.properties, notes: 'More notes'}
    const text1a = text1.create(text1.id, text1.name, updatedProps, text1.elements)
    expect(text1a.notes).toBe('More notes')
})

test('assigns new ids to a tree of elements', () => {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('text_2', 'Text 2', {content: ex`"Some text"`})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('text_7', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const app = new App('app_1', 'App 1', {}, [page1, page2])

    const appWithNewIds = app.transform(newIdTransformer(app))

    let expectedApp
    {
        const text1 = new Text('text_8', 'Text 1', {content: ex`"Some text"`})
        const text2 = new Text('text_9', 'Text 2', {content: ex`"Some text"`})
        const page1 = new Page('page_3', 'Page 1', {}, [text1, text2])
        const text3 = new Text('text_10', 'Text 3', {content: ex`"Some text 3"`})
        const text4 = new Text('text_11', 'Text 4', {content: ex`"Some text 4"`})
        const page2 = new Page('page_4', 'Page 2', {}, [text3, text4])
        expectedApp = new App('app_2', 'App 1', {}, [page1, page2])
    }

    expect(appWithNewIds).toStrictEqual(expectedApp)
    expect(app.findElement('text_3')).toBe(text3)
})

describe('Insert element with new ids', () => {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('text_2', 'Text 2', {content: ex`"Some text"`})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('text_7', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const app = new App('app', 'App 1', {}, [page1])
    const app2 = new App('a2', 'App 2', {}, [page2])
    const project = Project1.new([app, app2], 'proj1', 'pr1', {})

    test('creates an updated object on insert before element in a page and preserves unchanged objects', () => {

        const insertedElement = new Text('originalId', 'Text 99', {content: 'Hi!'})
        const [updatedProject, newElements] = project.insert('before', text1.id, insertedElement)
        const newElement = newElements[0]
        expect((updatedProject.elements![0] as App).pages[0].elements!.map(el => el.name)).toStrictEqual(['Text 99', 'Text 1', 'Text 2'])
        expect(newElement).not.toBe(insertedElement)
        expect(newElement).toBe((updatedProject.elements![0] as App).pages[0].elements![0])
        expect(newElement.id).toBe('text_8')
        expect(newElement.name).toBe('Text 99')
        expect((newElement as any).content).toBe('Hi!')
        expect((updatedProject.elements![0] as App).pages[1]).toBe(app.pages[1])
    })
})

describe('doInsert function', () => {
    const inserted = new Text('text_5', 'Text 5', {content: 'Hi!'})

    test('creates an updated object on insert at start of elements and keeps unchanged objects', ()=> {
        const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
        const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
        const page = new Page('p1', 'Page 1', {}, [text1, text2])
        const updatedPage = page.doInsert('before', 't1', [inserted])
        expect(updatedPage.name).toBe('Page 1')
        expect(updatedPage.elementArray().length).toBe(3)
        expect(updatedPage.elementArray()[0].name).toBe('Text 5')
        expect(updatedPage.elementArray()[1]).toBe(text1)
        expect(updatedPage.elementArray()[2]).toBe(text2)
    })

    test('creates an updated object on insert at end of elements and keeps unchanged objects', ()=> {
        const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
        const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
        const page = new Page('p1', 'Page 1', {}, [text1, text2])
        const updatedPage = page.doInsert('after', 't2', [inserted])
        expect(updatedPage.name).toBe('Page 1')
        expect(updatedPage.elementArray().length).toBe(3)
        expect(updatedPage.elementArray()[0]).toBe(text1)
        expect(updatedPage.elementArray()[1]).toBe(text2)
        expect(updatedPage.elementArray()[2].name).toBe('Text 5')
    })

    test('creates an updated object on insert inside page and keeps unchanged objects', ()=> {
        const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
        const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
        const page = new Page('p1', 'Page 1', {}, [text1, text2])
        const updatedPage = page.doInsert('inside', 'p1', [inserted])
        expect(updatedPage.name).toBe('Page 1')
        expect(updatedPage.elementArray().length).toBe(3)
        expect(updatedPage.elementArray()[0]).toBe(text1)
        expect(updatedPage.elementArray()[1]).toBe(text2)
        expect(updatedPage.elementArray()[2].name).toBe('Text 5')
    })

    test('ignores the insert and returns itself if the id is not matched', ()=> {
        const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
        const page1 = new Page('p1', 'Page 1', {}, [text1])
        const updatedPage = page1.doInsert('after', 'x1', [inserted])
        expect(updatedPage).toBe(page1)
    })


})

