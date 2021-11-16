import TextInput from '../../src/model/TextInput'
import Page from '../../src/model/Page'
import {asJSON} from '../util/testHelpers'

test('TextInput has correct properties', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: '"Some text"', maxLength: 5})

    expect(textInput.id).toBe('t1')
    expect(textInput.name).toBe('Text Input 1')
    expect(textInput.initialValue).toBe('"Some text"')
    expect(textInput.maxLength).toBe(5)
})

test('tests if an object is this type', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: '"Some text"'})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(TextInput.is(textInput)).toBe(true)
    expect(TextInput.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: '"Some text"'})
    const updated = textInput.set('t1', 'name', 'Text 1A')
    expect(updated.name).toBe('Text 1A')
    expect(updated.initialValue).toBe('"Some text"')
    expect(textInput.name).toBe('Text Input 1')
    expect(textInput.initialValue).toBe('"Some text"')

    const updated2 = updated.set('t1', 'initialValue', 'shazam')
    expect(updated2.name).toBe('Text 1A')
    expect(updated2.initialValue).toBe('shazam')
    expect(updated.name).toBe('Text 1A')
    expect(updated.initialValue).toBe('"Some text"')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: '"Some text"'})
    const updated = textInput.set('x1', 'name', 'Text 1A')
    expect(updated).toBe(textInput)
})

test('converts to JSON', ()=> {
    const text = new TextInput('t1', 'Text Input 1', {initialValue: '"Some text"', maxLength: 10})
    expect(asJSON(text)).toStrictEqual({
        kind: 'TextInput',
        id: 't1',
        name: 'Text Input 1',
        props: text.properties
    })
})

test('converts from plain object', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: '"Some text"', maxLength: 10})
    const plainObj = asJSON(textInput)
    const newObj = TextInput.fromJSON(plainObj)
    expect(newObj).toStrictEqual<TextInput>(textInput)
})