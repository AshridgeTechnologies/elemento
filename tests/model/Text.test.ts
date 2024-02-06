import Text from '../../src/model/Text'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('Text has correct properties with default values', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})

    expect(text1.id).toBe('t1')
    expect(text1.name).toBe('Text 1')
    expect(text1.kind).toBe('Text')
    expect(text1.notes).toBe(undefined)
    expect(text1.content).toStrictEqual(ex`"Some text"`)
    expect(text1.styles).toBe(undefined)
    expect(text1.show).toBe(undefined)
})

test('Text has correct properties with specified values', ()=> {
    const styles = {fontSize: 32, fontFamily: 'Courier', color: 'red', backgroundColor: 'blue', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 20}
    const text1 = new Text('t1', 'Text 1', {notes:'This is some text', content: ex`"Some text"`, show: false,
        styles: styles})

    expect(text1.id).toBe('t1')
    expect(text1.name).toBe('Text 1')
    expect(text1.notes).toBe('This is some text')
    expect(text1.content).toStrictEqual(ex`"Some text"`)
    expect(text1.show).toBe(false)
    expect(text1.styles).toStrictEqual(styles)
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
    const styles = {fontSize: 44, fontFamily: 'Dog', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 40}
    const text = new Text('t1', 'Text 1', {content: ex`"Some text"`, styles: styles, show: ex`false`})
    expect(asJSON(text)).toStrictEqual({
        kind: 'Text',
        id: 't1',
        name: 'Text 1',
        properties: text.properties
    })
})

test('converts from plain object', ()=> {
    const styles = {fontSize: ex`44`, fontFamily: 'Dog', color: ex`'red'`, backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 40}
    const text = new Text('t1', 'Text 1', {content: ex`"Some text"`, styles: styles})
    const plainObj = asJSON(text)
    const newText = loadJSON(plainObj)
    expect(newText).toStrictEqual<Text>(text)

    const text2 = new Text('t1', 'Text 2', {content: `Some text`, styles: styles, show: false})
    const plainObj2 = asJSON(text2)
    const newText2 = loadJSON(plainObj2)
    expect(newText2).toStrictEqual<Text>(text2)
})

