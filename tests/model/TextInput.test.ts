import {expect, test} from "vitest"
import {Page, TextInput} from '../testutil/modelHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import {asAny, asJSON, ex} from '../testutil/testHelpers'

test('TextInput shows get values from properties', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: ex`"Some text"`,
        multiline: true, label: ex`Text One`, readOnly: true, dataType: ex`textType1`, show: true, styles: {border: '1px solid red', color: ex`"text.primary"`}})
    const textInput_ = asAny(textInput)

    expect(textInput.id).toBe('t1')
    expect(textInput.name).toBe('Text Input 1')
    expect(textInput.codeName).toBe('TextInput1')
    expect(textInput_.initialValue).toStrictEqual(ex`"Some text"`)
    expect(textInput_.multiline).toBe(true)
    expect(textInput_.readOnly).toBe(true)
    expect(textInput_.show).toBe(true)
    expect(textInput_.label).toStrictEqual(ex`Text One`)
    expect(textInput_.dataType).toStrictEqual(ex`textType1`)
    expect(textInput_.styles).toStrictEqual({border: '1px solid red', color: ex`"text.primary"`})
})

test('TextInput does not allow codeName to be same as class name', ()=> {
    const textInput = new TextInput('t1', 'Text Input', {})

    expect(textInput.id).toBe('t1')
    expect(textInput.name).toBe('Text Input')
    expect(textInput.codeName).toBe('TextInput_t1')
})

test('TextInput has default values', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {})
    const textInput_ = asAny(textInput)

    expect(textInput.id).toBe('t1')
    expect(textInput.name).toBe('Text Input 1')
    expect(textInput_.initialValue).toBeUndefined()
    expect(textInput_.multiline).toBeUndefined()
    expect(textInput_.label).toBe(`Text Input 1`)
    expect(textInput_.readOnly).toBeUndefined()
    expect(textInput_.show).toBeUndefined()
    expect(textInput_.properties.label).toBeUndefined()
    expect(textInput_.dataType).toBeUndefined()
    expect(textInput_.styles).toBeUndefined()
})

test('has correct property names', () => {
    expect(new TextInput('t1', 'Text Input 1', {}).propertyDefs.map( (def: any) => def.name )).toStrictEqual(['initialValue', 'label', 'readOnly', 'dataType', 'show', 'multiline', 'keyAction', 'styles'])
})

test('has state option for correct property defs', () => {
    expect(new TextInput('t1', 'Text Input 1', {}).propertyDefs.map( ({state}) => !!state )).toStrictEqual([true, false, false, true, false, false, false, false])
})

test('tests if an object is this type', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: ex`"Some text"`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(TextInput.is(textInput)).toBe(true)
    expect(TextInput.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: ex`"Some text"`})
    const updated = textInput.set('t1', 'name', 'Text 1A')
    expect(updated.name).toBe('Text 1A')
    expect(asAny(updated).initialValue).toStrictEqual(ex`"Some text"`)
    expect(textInput.name).toBe('Text Input 1')
    expect(asAny(textInput).initialValue).toStrictEqual(ex`"Some text"`)

    const updated2 = updated.set('t1', 'initialValue', `shazam`)
    expect(updated2.name).toBe('Text 1A')
    expect(asAny(updated2).initialValue).toStrictEqual(`shazam`)
    expect(updated.name).toBe('Text 1A')
    expect(asAny(updated).initialValue).toStrictEqual(ex`"Some text"`)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: ex`"Some text"`})
    const updated = textInput.set('x1', 'name', 'Text 1A')
    expect(updated).toBe(textInput)
})

test('converts to JSON', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: ex`"Some text"`,
        multiline: true, label: ex`"The Text"`, readOnly: ex`true`, dataType: ex`textType1`})
    expect(asJSON(textInput)).toStrictEqual({
        kind: 'TextInput',
        id: 't1',
        name: 'Text Input 1',
        properties: textInput.properties
    })

    const text2 = new TextInput('t1', 'Text Input 2', {initialValue: `Some text`,
        multiline: true, label: 'The Text', readOnly: true, styles: {color: 'red'}})
    expect(asJSON(text2)).toStrictEqual({
        kind: 'TextInput',
        id: 't1',
        name: 'Text Input 2',
        properties: text2.properties
    })
})

test('converts from plain object', ()=> {
    const textInput = new TextInput('t1', 'Text Input 1', {initialValue: ex`"Some text"`, multiline: true, dataType: ex`textType1`})
    const plainObj = asJSON(textInput)
    const newObj = loadJSON(plainObj)
    expect(newObj).toStrictEqual(textInput)

    const textInput2 = new TextInput('t1', 'Text Input 1', {initialValue: `Some text`, multiline: true, label: 'The Text', readOnly: true})
    const plainObj2 = asJSON(textInput2)
    const newObj2 = loadJSON(plainObj2)
    expect(newObj2).toStrictEqual(textInput2)
})
