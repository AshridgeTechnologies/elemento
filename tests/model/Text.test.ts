import Text from '../../src/model/Text'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON} from '../util/testHelpers'

test('Text has correct properties', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: '"Some text"'})

    expect(text1.id).toBe('t1')
    expect(text1.name).toBe('Text 1')
    expect(text1.content).toBe('"Some text"')
})

test('tests if an object is this type', ()=> {
    const text = new Text('t1', 'Text 1', {content: '"Some text"'})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Text.is(text)).toBe(true)
    expect(Text.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const text = new Text('t1', 'Text 1', {content: '"Some text"'})
    const updatedText1 = text.set('t1', 'name', 'Text 1A')
    expect(updatedText1.name).toBe('Text 1A')
    expect(updatedText1.content).toBe('"Some text"')
    expect(text.name).toBe('Text 1')
    expect(text.content).toBe('"Some text"')

    const updatedText2 = updatedText1.set('t1', 'content', 'shazam')
    expect(updatedText2.name).toBe('Text 1A')
    expect(updatedText2.content).toBe('shazam')
    expect(updatedText1.name).toBe('Text 1A')
    expect(updatedText1.content).toBe('"Some text"')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text = new Text('t1', 'Text 1', {content: '"Some text"'})
    const updatedText = text.set('x1', 'name', 'Text 1A')
    expect(updatedText).toBe(text)
})

test('converts to JSON', ()=> {
    const text = new Text('t1', 'Text 1', {content: '"Some text"', style: 'red'})
    expect(asJSON(text)).toStrictEqual({
        kind: 'Text',
        id: 't1',
        name: 'Text 1',
        properties: text.properties
    })
})

test('converts from plain object', ()=> {
    const text = new Text('t1', 'Text 1', {content: '"Some text"', style: 'red'})
    const plainObj = asJSON(text)
    const newText = loadJSON(plainObj)
    expect(newText).toStrictEqual<Text>(text)
})

