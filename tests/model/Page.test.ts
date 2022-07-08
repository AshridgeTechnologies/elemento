import Text from '../../src/model/Text'
import Page from '../../src/model/Page'
import {asJSON, ex} from '../testutil/testHelpers'
import TextInput from '../../src/model/TextInput'
import {loadJSON} from '../../src/model/loadJSON'

test('Page has correct properties', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const page = new Page('p1', 'Page the First', {style: ex`color: blue`}, [text1, text2])

    expect(page.id).toBe('p1')
    expect(page.name).toBe('Page the First')
    expect(page.codeName).toBe('PagetheFirst')
    expect(page.style).toStrictEqual(ex`color: blue`)
    expect(page.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
})

test('creates an updated object with a property set to a new value', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"Some text"`})
    const page = new Page('p1', 'Page 1', {style: `color: blue`}, [text1])
    const updatedPage1 = page.set('p1', 'name', 'Page 1A')
    expect(updatedPage1.name).toBe('Page 1A')
    expect(updatedPage1.elements).toBe(page.elements)
    expect(updatedPage1.style).toBe(`color: blue`)
    expect(page.name).toBe('Page 1')

    const updatedPage2 = updatedPage1.set('p1', 'elements', [text1, text2])
    expect(updatedPage2.name).toBe('Page 1A')
    expect(updatedPage2.elements).toStrictEqual([text1, text2])
    expect(updatedPage1.name).toBe('Page 1A')
    expect(updatedPage1.elements).toStrictEqual([text1])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const updatedPage = page1.set('x1', 'name', 'Page 1A')
    expect(updatedPage).toBe(page1)
})

test('creates an updated object if a property in a contained object is changed and keeps unchanged objects', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const page = new Page('p1', 'Page 1', {}, [text1, text2])
    const updatedPage1 = page.set('t2', 'content', '"Further text"')
    expect(updatedPage1.name).toBe('Page 1')
    expect(updatedPage1.elementArray().length).toBe(2)
    expect(updatedPage1.elementArray()[0]).toBe(text1)
    expect(updatedPage1.elementArray()[1]).toStrictEqual(text2.set('t2', 'content', '"Further text"'))
    expect(page.elements).toStrictEqual([text1, text2])
})

test('can contain types apart from Project, App, Page', () => {
    const page = new Page('p1', 'Page 1', {}, [])
    expect(page.canContain('Project')).toBe(false)
    expect(page.canContain('App')).toBe(false)
    expect(page.canContain('Page')).toBe(false)
    expect(page.canContain('MemoryDataStore')).toBe(false)
    expect(page.canContain('FileDataStore')).toBe(false)
    expect(page.canContain('Text')).toBe(true)
    expect(page.canContain('Button')).toBe(true)
    expect(page.canContain('Function')).toBe(true)
})

test('converts to JSON', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const page = new Page('p1', 'Page 1', {style: ex`color: blue`}, [text1, text2])

    expect(asJSON(page)).toStrictEqual({
        kind: 'Page',
        id: 'p1',
        name: 'Page 1',
        properties: page.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

    const page2 = new Page('p1', 'Page 2', {style: `color: blue`}, [text1, text2])

    expect(asJSON(page2)).toStrictEqual({
        kind: 'Page',
        id: 'p1',
        name: 'Page 2',
        properties: page2.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

})

test('converts from plain object with correct types for elements', ()=> {
    let text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let textInput = new TextInput('t2', 'Text Input 2', {initialValue: ex`"Input text"`, maxLength: ex`7`})
    const page = new Page('p1', 'Page 1', {style: ex`color: blue`}, [text, textInput])
    const newPage = loadJSON(asJSON(page))
    expect(newPage).toStrictEqual<Page>(page)
    const page2 = new Page('p1', 'Page 2', {style: `color: blue`}, [text, textInput])
    const newPage2 = loadJSON(asJSON(page2))
    expect(newPage2).toStrictEqual<Page>(page2)
})