import Text from '../../src/model/Text'
import Page from '../../src/model/Page'
import App from '../../src/model/App'
import AppBar from '../../src/model/AppBar'
import Collection from '../../src/model/Collection'
import {asJSON, ex} from '../testutil/testHelpers'
import TextInput from '../../src/model/TextInput'
import {loadJSON} from '../../src/model/loadJSON'
import {ElementType} from '../../src/model/Types'
import DateInput from '../../src/model/DateInput'

test('App has correct properties', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    let page2 = new Page('p2', 'Page 2', {}, [])
    const app = new App('t1', 'test1', {author: 'Herself', maxWidth: 200, startupAction: ex`Log('Hi')`, fonts: '   \nMontserrat\n   \nComic Sans'}, [page1, page2])

    expect(app.id).toBe('t1')
    expect(app.name).toBe('test1')
    expect(app.author).toBe('Herself')
    expect(app.maxWidth).toBe(200)
    expect(app.startupAction).toStrictEqual(ex`Log('Hi')`)
    expect(app.fonts).toBe('   \nMontserrat\n   \nComic Sans')
    expect(app.fontList).toStrictEqual(['Montserrat', 'Comic Sans'])
    expect(app.pages.map( p => p.id )).toStrictEqual(['p1', 'p2'])
})

test('can distinguish different types of element', () => {
    let page1 = new Page('p1', 'Page 1', {}, [])
    let page2 = new Page('p2', 'Page 2', {}, [])
    let appBar = new AppBar('ab2', 'AppBar 1', {}, [])
    let collection = new Collection('coll1', 'Collection 1', {},)
    const app = new App('t1', 'test1', {author: 'Herself', maxWidth: 200}, [page1, page2, appBar, collection])
    expect(app.pages.map( p => p.id )).toStrictEqual(['p1', 'p2'])
    expect(app.otherComponents.map( p => p.id )).toStrictEqual(['ab2', 'coll1'])
    expect(app.topChildren.map( p => p.id )).toStrictEqual(['ab2'])
    expect(app.bottomChildren.map( p => p.id )).toStrictEqual(['coll1'])

})

test('can find app itself by id', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    const app = new App('a1', 'test1', {}, [page1])

    expect(app.findElement('a1')).toBe(app)
})

test('can find page by id', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    let page2 = new Page('p2', 'Page 2', {}, [])
    const app = new App('t1', 'test1', {}, [page1, page2])

    expect(app.findElement('p2')).toBe(page2)
})

let testApp = function () {
    const text1 = new Text('t1', 'Text 1', {content: ex``})
    const text2 = new Text('t2', 'Text 3', {content: ex``})
    let page1 = new Page('p1', 'Page 1', {}, [
        text1, text2,
    ])
    const text3 = new Text('t3', 'Text 1', {content: ex``})
    const text4 = new Text('t4', 'Text 4', {content: ex``})
    const text5 = new Text('t5', 'Text 3', {content: ex``})
    let page2 = new Page('p2', 'Page 2', {}, [
        text3, text4, text5
    ])
    const app = new App('app1', 'App 1', {}, [page1, page2])
    return {text4, text5, app}
}
test('can find element on a page by id', ()=> {
    const {text4, app} = testApp()
    expect(app.findElement('t4')).toBe(text4)
})

test('can find path of app itself by id', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    const app = new App('a1', 'App 1', {}, [page1])

    expect(app.findElementPath('a1')).toBe('App1')
})

test('can find path of page by id', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    let page2 = new Page('p2', 'Page 2', {}, [])
    const app = new App('t1', 'App 1', {}, [page1, page2])

    expect(app.findElementPath('p2')).toBe('App1.Page2')
})

test('can find path of element on a page by id', ()=> {
    const {text4, app} = testApp()
    expect(app.findElementPath(text4.id)).toBe('App1.Page2.Text4')
})

test('can find element by path', () => {
    const {text4, app} = testApp()
    expect(app.findElementByPath('App1.Page2.Text4')).toBe(text4)
})

test('can find element by path where two elements have the same name', () => {
    const {text5, app} = testApp()
    expect(app.findElementByPath('App1.Page2.Text3')).toBe(text5)
})

test('creates an updated object with a property set to a new value', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('t4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])
    const page3 = new Page('p3', 'Page 3', {}, [])

    const app = new App('a1', 'App 1', {}, [page1, page2])
    const updatedApp = app.set('a1', 'name', 'App 1A')
    expect(updatedApp.name).toBe('App 1A')
    expect(updatedApp.elements).toBe(app.elements)
    expect(app.name).toBe('App 1')

    const updatedApp2 = updatedApp.set('a1', 'elements', [page1, page2, page3])
    expect(updatedApp2.name).toBe('App 1A')
    expect(updatedApp2.pages).toStrictEqual([page1, page2, page3])
    expect(updatedApp.name).toBe('App 1A')
    expect(updatedApp.pages).toStrictEqual([page1, page2])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const app = new App('a1', 'App 1', {}, [page1])
    const updatedApp = app.set('x1', 'name', 'App 1A')
    expect(updatedApp).toBe(app)
})

test('creates an updated object if a property in a contained object is changed and keeps unchanged objects', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('t4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])

    const app = new App('a1', 'App 1', {}, [page1, page2])

    const updatedApp = app.set('t4', 'content', '"Further text"')
    expect(updatedApp.name).toBe('App 1')
    expect(updatedApp.pages.length).toBe(2)
    expect(updatedApp.pages[0]).toBe(page1)
    expect(updatedApp.pages[1]).not.toBe(page2)
    expect(((updatedApp.pages[1].elementArray()[1]) as Text).content).toBe('"Further text"')
    expect(updatedApp.pages[1].elementArray()[0]).toBe(text3)
})

test('creates an updated object on delete element on a page and preserves unchanged objects', ()=> {
    const text1 = new Text('text_1', 'Text 1', {content: '"Some text"'})
    const text2 = new Text('text_2', 'Text 2', {content: '"Some text"'})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_3', 'Text 3', {content: '"Some text 3"'})
    const text4 = new Text('text_7', 'Text 4', {content: '"Some text 4"'})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const app = new App('app', 'App 1', {}, [page1, page2])

    const updatedApp = app.delete(text3.id)
    expect(updatedApp.pages[1].elements!.map( el => el.name)).toStrictEqual(['Text 4'])
    expect(updatedApp.pages[0]).toBe(app.pages[0])
})

test('finds max id for element type', ()=> {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('text_2', 'Text 2', {content: ex`"Some text"`})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_7', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('TEXT_8', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const app = new App('app', 'App 1', {}, [page1, page2])
    expect(app.findMaxId('Text')).toBe(7)
    expect(app.findMaxId('Page')).toBe(2)
    expect(app.findMaxId('TextInput')).toBe(0)

})

test.each(['Page', 'MemoryDataStore', 'FileDataStore', 'Collection', 'AppBar', 'Function', 'FunctionImport'])('can contain %s not other types', (elementType) => {
    const app = new App('id1', 'App 1', {}, [])
    expect(app.canContain(elementType as ElementType)).toBe(true)
    expect(app.canContain('Text')).toBe(false)
    expect(app.canContain('App')).toBe(false)
    expect(app.canContain('Project')).toBe(false)
})

test('has correct property names', () => {
    expect(new App('app1', 'App 1', {}).propertyDefs.map( ({name}) => name )).toStrictEqual(['author', 'maxWidth', 'fonts', 'startupAction'])
})

test('converts to JSON', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('t4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])

    const app = new App('a1', 'App 1', {author: `Jo`, startupAction: ex`Log('Hi')`}, [page1, page2])

    expect(asJSON(app)).toStrictEqual({
        kind: 'App',
        id: 'a1',
        name: 'App 1',
        properties: app.properties,
        elements: [asJSON(page1), asJSON(page2)]
    })
})

test('converts from plain object', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const textInput4 = new TextInput('t4', 'Text 4', {initialValue: ex`"Some text"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, textInput4])

    const app = new App('a1', 'App 1', {author: `Jo`}, [page1, page2])
    const newApp = loadJSON(asJSON(app))
    expect(newApp).toStrictEqual<App>(app)
})

