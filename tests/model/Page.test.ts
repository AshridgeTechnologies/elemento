import Text from '../../src/model/Text'
import Page from '../../src/model/Page'
import {asJSON} from '../util/testHelpers'
import TextInput from '../../src/model/TextInput'
import {loadJSON} from '../../src/model/loadJSON'

test('Page has correct properties', ()=> {
    let text1 = new Text('t1', 'Text 1', {contentExpr: '"Some text"'})
    let text2 = new Text('t2', 'Text 2', {contentExpr: '"More text"'})
    const page = new Page('p1', 'Page 1', {style: "color: blue"}, [text1, text2])

    expect(page.id).toBe('p1')
    expect(page.name).toBe('Page 1')
    expect(page.style).toBe('color: blue')
    expect(page.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
})

test('creates an updated object with a property set to a new value', ()=> {
    const text1 = new Text('t1', 'Text 1', {contentExpr: '"Some text"'})
    const text2 = new Text('t2', 'Text 2', {contentExpr: '"Some text"'})
    const page = new Page('p1', 'Page 1', {}, [text1])
    const updatedPage1 = page.set('p1', 'name', 'Page 1A')
    expect(updatedPage1.name).toBe('Page 1A')
    expect(updatedPage1.elements).toBe(page.elements)
    expect(page.name).toBe('Page 1')

    const updatedPage2 = updatedPage1.set('p1', 'elements', [text1, text2])
    expect(updatedPage2.name).toBe('Page 1A')
    expect(updatedPage2.elements).toStrictEqual([text1, text2])
    expect(updatedPage1.name).toBe('Page 1A')
    expect(updatedPage1.elements).toStrictEqual([text1])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text1 = new Text('t1', 'Text 1', {contentExpr: '"Some text"'})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const updatedPage = page1.set('x1', 'name', 'Page 1A')
    expect(updatedPage).toBe(page1)
})

test('creates an updated object if a property in a contained object is changed and keeps unchanged objects', ()=> {
    const text1 = new Text('t1', 'Text 1', {contentExpr: '"Some text"'})
    const text2 = new Text('t2', 'Text 2', {contentExpr: '"More text"'})
    const page = new Page('p1', 'Page 1', {}, [text1, text2])
    const updatedPage1 = page.set('t2', 'contentExpr', '"Further text"')
    expect(updatedPage1.name).toBe('Page 1')
    expect(updatedPage1.elementArray().length).toBe(2)
    expect(updatedPage1.elementArray()[0]).toBe(text1)
    expect(updatedPage1.elementArray()[1]).toStrictEqual(text2.set('t2', 'contentExpr', '"Further text"'))
    expect(page.elements).toStrictEqual([text1, text2])
})

test('converts to JSON', ()=> {
    let text1 = new Text('t1', 'Text 1', {contentExpr: '"Some text"'})
    let text2 = new Text('t2', 'Text 2', {contentExpr: '"More text"'})
    const page = new Page('p1', 'Page 1', {style: "color: blue"}, [text1, text2])

    expect(asJSON(page)).toStrictEqual({
        kind: 'Page',
        id: 'p1',
        name: 'Page 1',
        properties: page.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

})

test('converts from plain object with correct types for elements', ()=> {
    let text = new Text('t1', 'Text 1', {contentExpr: '"Some text"'})
    let textInput = new TextInput('t2', 'Text Input 2', {initialValue: '"Input text"', maxLength: 7})
    const page = new Page('p1', 'Page 1', {style: "color: blue"}, [text, textInput])
    const newPage = loadJSON(asJSON(page))
    expect(newPage).toStrictEqual<Page>(page)
})