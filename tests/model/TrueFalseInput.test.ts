import TrueFalseInput from '../../src/model/TrueFalseInput'
import Page from '../../src/model/Page'
import {asJSON, ex} from '../testutil/testHelpers'
import {loadJSON} from '../../src/model/loadJSON'

test('TrueFalseInput has correct properties', ()=> {
    const trueFalseInput = new TrueFalseInput('t1', 'True-False Input 1', {initialValue: ex`true`, label: ex`True-False One`, dataType: ex`dataType1`, show: false, styles: {color: 'red'}})

    expect(trueFalseInput.id).toBe('t1')
    expect(trueFalseInput.name).toBe('True-False Input 1')
    expect(trueFalseInput.initialValue).toStrictEqual(ex`true`)
    expect(trueFalseInput.label).toStrictEqual(ex`True-False One`)
    expect(trueFalseInput.dataType).toStrictEqual(ex`dataType1`)
    expect(trueFalseInput.show).toStrictEqual(false)
    expect(trueFalseInput.styles).toStrictEqual({color: 'red'})
})

test('TrueFalseInput has correct defaults', ()=> {
    const trueFalseInput = new TrueFalseInput('t1', 'True-False Input 1', {})

    expect(trueFalseInput.id).toBe('t1')
    expect(trueFalseInput.name).toBe('True-False Input 1')
    expect(trueFalseInput.initialValue).toBeUndefined()
    expect(trueFalseInput.label).toBe('True-False Input 1')
    expect(trueFalseInput.dataType).toBe(undefined)
    expect(trueFalseInput.show).toBe(undefined)
    expect(trueFalseInput.styles).toBe(undefined)
})

test('tests if an object is this type', ()=> {
    const trueFalseInput = new TrueFalseInput('t1', 'True-False Input 1', {initialValue: ex`true`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(TrueFalseInput.is(trueFalseInput)).toBe(true)
    expect(TrueFalseInput.is(page)).toBe(false)
})

test('has correct property names', () => {
    expect(new TrueFalseInput('t1', 'True False Input 1', {}).propertyDefs.map( ({name}) => name )).toStrictEqual(['initialValue', 'label', 'readOnly', 'dataType', 'show', 'styles'])
})

test('creates an updated object with a property set to a new value', ()=> {
    const trueFalseInput = new TrueFalseInput('t1', 'True-False Input 1', {initialValue: ex`true`})
    const updated = trueFalseInput.set('t1', 'name', 'True-False 1A')
    expect(updated.name).toBe('True-False 1A')
    expect(updated.initialValue).toStrictEqual(ex`true`)
    expect(trueFalseInput.name).toBe('True-False Input 1')
    expect(trueFalseInput.initialValue).toStrictEqual(ex`true`)

    const updated2 = updated.set('t1', 'initialValue', ex`false`)
    expect(updated2.name).toBe('True-False 1A')
    expect(updated2.initialValue).toStrictEqual(ex`false`)
    expect(updated.name).toBe('True-False 1A')
    expect(updated.initialValue).toStrictEqual(ex`true`)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const trueFalseInput = new TrueFalseInput('t1', 'True-False Input 1', {initialValue: ex`true`})
    const updated = trueFalseInput.set('x1', 'name', 'True-False 1A')
    expect(updated).toBe(trueFalseInput)
})

test('converts to JSON', ()=> {
    const trueFalse = new TrueFalseInput('t1', 'True-False Input 1', {initialValue: ex`true`, label: ex`"The True-False"`, dataType: ex`dataType1`})
    expect(asJSON(trueFalse)).toStrictEqual({
        kind: 'TrueFalseInput',
        id: 't1',
        name: 'True-False Input 1',
        properties: trueFalse.properties
    })

    const trueFalse2 = new TrueFalseInput('t1', 'True-False Input 2', {initialValue: false, label: 'The True-False'})
    expect(asJSON(trueFalse2)).toStrictEqual({
        kind: 'TrueFalseInput',
        id: 't1',
        name: 'True-False Input 2',
        properties: trueFalse2.properties
    })
})

test('converts from plain object', ()=> {
    const trueFalseInput = new TrueFalseInput('t1', 'True-False Input 1', {initialValue: ex`true`})
    const plainObj = asJSON(trueFalseInput)
    const newObj = loadJSON(plainObj)
    expect(newObj).toStrictEqual<TrueFalseInput>(trueFalseInput)

    const trueFalseInput2 = new TrueFalseInput('t1', 'True-False Input 1', {initialValue: true, label: 'The True-False', dataType: ex`dataType1`})
    const plainObj2 = asJSON(trueFalseInput2)
    const newObj2 = loadJSON(plainObj2)
    expect(newObj2).toStrictEqual<TrueFalseInput>(trueFalseInput2)
})
