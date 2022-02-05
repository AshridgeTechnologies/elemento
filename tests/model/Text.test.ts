import Text from '../../src/model/Text'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON} from '../util/testHelpers'
import {ex} from '../../src/util/helpers'

test('Text has correct properties with default values', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})

    expect(text1.id).toBe('t1')
    expect(text1.name).toBe('Text 1')
    expect(text1.content).toStrictEqual(ex`"Some text"`)
    expect(text1.style).toBe(undefined)
    expect(text1.display).toBe(true)
})

test('Text has correct properties with specified values', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`, style: 'cool', display: false})

    expect(text1.id).toBe('t1')
    expect(text1.name).toBe('Text 1')
    expect(text1.content).toStrictEqual(ex`"Some text"`)
    expect(text1.style).toBe('cool')
    expect(text1.display).toBe(false)
})

test('tests if an object is this type', ()=> {
    const text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Text.is(text)).toBe(true)
    expect(Text.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const updatedText1 = text.set('t1', 'name', 'Text 1A')
    expect(updatedText1.name).toBe('Text 1A')
    expect(updatedText1.content).toStrictEqual(ex`"Some text"`)
    expect(text.name).toBe('Text 1')
    expect(text.content).toStrictEqual(ex`"Some text"`)

    const updatedText2 = updatedText1.set('t1', 'content', ex`shazam`)
    expect(updatedText2.name).toBe('Text 1A')
    expect(updatedText2.content).toStrictEqual(ex`shazam`)
    expect(updatedText1.name).toBe('Text 1A')
    expect(updatedText1.content).toStrictEqual(ex`"Some text"`)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const updatedText = text.set('x1', 'name', ex`Text 1A`)
    expect(updatedText).toStrictEqual(text)
})

test('converts to JSON without optional proerties', ()=> {
    const text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    expect(asJSON(text)).toStrictEqual({
        kind: 'Text',
        id: 't1',
        name: 'Text 1',
        properties: text.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const text = new Text('t1', 'Text 1', {content: ex`"Some text"`, style: ex`red`, display: ex`false`})
    expect(asJSON(text)).toStrictEqual({
        kind: 'Text',
        id: 't1',
        name: 'Text 1',
        properties: text.properties
    })
})

test('converts from plain object', ()=> {
    const text = new Text('t1', 'Text 1', {content: ex`"Some text"`, style: ex`red`})
    const plainObj = asJSON(text)
    const newText = loadJSON(plainObj)
    expect(newText).toStrictEqual<Text>(text)

    const text2 = new Text('t1', 'Text 2', {content: `Some text`, style: `red`, display: false})
    const plainObj2 = asJSON(text2)
    const newText2 = loadJSON(plainObj2)
    expect(newText2).toStrictEqual<Text>(text2)
})

