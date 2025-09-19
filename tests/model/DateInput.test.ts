import {expect, test} from "vitest"
import {Page, DateInput} from '../testutil/modelHelpers'
import {asJSON, ex} from '../testutil/testHelpers'
import {loadJSON, loadJSONFromString} from '../../src/model/loadJSON'

test('DateInput has correct properties', ()=> {
    const dateInput = new DateInput('t1', 'Date Input 1', {initialValue: {expr: 'DateVal("2002-03-04")'}, label: ex`Date One`, dataType: ex`dataType1`, show: ex`1 || 2`, styles: {color: 'red'}})

    expect(dateInput.id).toBe('t1')
    expect(dateInput.name).toBe('Date Input 1')
    expect(dateInput.initialValue).toStrictEqual({expr: 'DateVal("2002-03-04")'})
    expect(dateInput.label).toStrictEqual(ex`Date One`)
    expect(dateInput.dataType).toStrictEqual(ex`dataType1`)
    expect(dateInput.show).toStrictEqual(ex`1 || 2`)
    expect(dateInput.styles).toStrictEqual({color: 'red'})
})

test('DateInput has default values', ()=> {
    const dateInput = new DateInput('t1', 'Date Input 1', {})

    expect(dateInput.id).toBe('t1')
    expect(dateInput.name).toBe('Date Input 1')
    expect(dateInput.initialValue).toBeUndefined()
    expect(dateInput.label).toBe(`Date Input 1`)
    expect(dateInput.properties.label).toBeUndefined()
    expect(dateInput.dataType).toBeUndefined()
    expect(dateInput.show).toBeUndefined()
    expect(dateInput.styles).toBeUndefined()
})

test('tests if an object is this type', ()=> {
    const dateInput = new DateInput('t1', 'Date Input 1', {initialValue: {expr: 'DateVal("2002-03-04")'}})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(DateInput.is(dateInput)).toBe(true)
    expect(DateInput.is(page)).toBe(false)
})

test('has correct property names', () => {
    expect(new DateInput('t1', 'Date Input 1', {}).propertyDefs.map( (def: any) => def.name )).toStrictEqual(['initialValue', 'label', 'readOnly', 'dataType', 'show', 'styles'])
})

test('creates an updated object with a property set to a new value', ()=> {
    const dateInput = new DateInput('t1', 'Date Input 1', {initialValue: {expr: 'DateVal("2002-03-04")'}})
    const updated = dateInput.set('t1', 'name', 'Date 1A')
    expect(updated.name).toBe('Date 1A')
    expect(updated.initialValue).toStrictEqual({expr: 'DateVal("2002-03-04")'})
    expect(dateInput.name).toBe('Date Input 1')
    expect(dateInput.initialValue).toStrictEqual({expr: 'DateVal("2002-03-04")'})

    const updated2 = updated.set('t1', 'initialValue', {expr: 'DateVal("2032-12-15")'})
    expect(updated2.name).toBe('Date 1A')
    expect(updated2.initialValue).toStrictEqual({expr: 'DateVal("2032-12-15")'})
    expect(updated.name).toBe('Date 1A')
    expect(updated.initialValue).toStrictEqual({expr: 'DateVal("2002-03-04")'})
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const dateInput = new DateInput('t1', 'Date Input 1', {initialValue: {expr: 'DateVal("2002-03-04")'}})
    const updated = dateInput.set('x1', 'name', 'Date 1A')
    expect(updated).toBe(dateInput)
})

test('converts to JSON', ()=> {
    const date = new DateInput('t1', 'Date Input 1', {initialValue: {expr: 'DateVal("2002-03-04")'}, label: ex`"The Date"`, dataType: ex`dataType1`})
    expect(asJSON(date)).toStrictEqual({
        kind: 'DateInput',
        id: 't1',
        name: 'Date Input 1',
        properties: date.properties
    })

    const date2 = new DateInput('t1', 'Date Input 2', {initialValue: new Date("2002-03-04"), label: 'The Date'})
    expect(asJSON(date2)).toStrictEqual({
        kind: 'DateInput',
        id: 't1',
        name: 'Date Input 2',
        properties: {initialValue: "2002-03-04T00:00:00.000Z", label: 'The Date'}
    })
})

test('converts from plain object', ()=> {
    const dateInput = new DateInput('t1', 'Date Input 1', {initialValue: {expr: 'DateVal("2002-03-04")'}, dataType: ex`dataType1`})
    const plainObj = asJSON(dateInput)
    const newObj = loadJSON(plainObj)
    expect(newObj).toStrictEqual<typeof DateInput>(dateInput)

    const dateInput2 = new DateInput('t1', 'Date Input 1', {initialValue: new Date("2002-03-04"), label: 'The Date'})
    const newObj2 = loadJSONFromString(JSON.stringify(dateInput2))
    expect(newObj2).toStrictEqual<typeof DateInput>(dateInput2)
})
