import Text from '../../src/model/Text'
import Page from '../../src/model/Page'
import App from '../../src/model/App'

test('App has correct properties', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    let page2 = new Page('p2', 'Page 2', {}, [])
    const app = new App('t1', 'test1', {}, [page1, page2])

    expect(app.id).toBe('t1')
    expect(app.name).toBe('test1')
    expect(app.pages.map( p => p.id )).toStrictEqual(['p1', 'p2'])
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

test('can find element on a page by id', ()=> {
    const text1 = new Text('t1', 'Text 1', {contentExpr: ''})
    const text2 = new Text('t2', 'Text 3', {contentExpr: ''})
    let page1 = new Page('p1', 'Page 1', {}, [
        text1, text2,
    ])
    const text3 = new Text('t3', 'Text 1', {contentExpr: ''})
    const text4 = new Text('t4', 'Text 4', {contentExpr: ''})
    let page2 = new Page('p2', 'Page 2', {}, [
        text3, text4,
    ])
    const app = new App('app1', 'test1', {}, [page1, page2])

    expect(app.findElement('t4')).toBe(text4)
})


test('creates an updated object with a property set to a new value', ()=> {
    const text1 = new Text('t1', 'Text 1', {contentExpr: '"Some text"'})
    const text2 = new Text('t2', 'Text 2', {contentExpr: '"Some text"'})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {contentExpr: '"Some text 3"'})
    const text4 = new Text('t4', 'Text 4', {contentExpr: '"Some text 4"'})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])
    const page3 = new Page('p3', 'Page 3', {}, [])

    const app = new App('a1', 'App 1', {}, [page1, page2])
    const updatedApp = app.set('a1', 'name', 'App 1A')
    expect(updatedApp.name).toBe('App 1A')
    expect(updatedApp.pages).toBe(app.pages)
    expect(app.name).toBe('App 1')

    const updatedApp2 = updatedApp.set('a1', 'pages', [page1, page2, page3])
    expect(updatedApp2.name).toBe('App 1A')
    expect(updatedApp2.pages).toStrictEqual([page1, page2, page3])
    expect(updatedApp.name).toBe('App 1A')
    expect(updatedApp.pages).toStrictEqual([page1, page2])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text1 = new Text('t1', 'Text 1', {contentExpr: '"Some text"'})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const app = new App('a1', 'App 1', {}, [page1])
    const updatedApp = app.set('x1', 'name', 'App 1A')
    expect(updatedApp).toBe(app)
})

test('creates an updated object if a property in a contained object is changed and keeps unchanged objects', ()=> {
    const text1 = new Text('t1', 'Text 1', {contentExpr: '"Some text"'})
    const text2 = new Text('t2', 'Text 2', {contentExpr: '"Some text"'})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {contentExpr: '"Some text 3"'})
    const text4 = new Text('t4', 'Text 4', {contentExpr: '"Some text 4"'})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])

    const app = new App('a1', 'App 1', {}, [page1, page2])

    const updatedApp = app.set('t4', 'contentExpr', '"Further text"')
    expect(updatedApp.name).toBe('App 1')
    expect(updatedApp.pages.length).toBe(2)
    expect(updatedApp.pages[0]).toBe(page1)
    expect(updatedApp.pages[1]).not.toBe(page2)
    expect(((updatedApp.pages[1].elements[1]) as Text).contentExpr).toBe('"Further text"')
    expect(updatedApp.pages[1].elements[0]).toBe(text3)
})
