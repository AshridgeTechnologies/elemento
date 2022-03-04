import SelectInput from '../../src/model/SelectInput'
import Page from '../../src/model/Page'
import {asJSON} from '../testutil/testHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import {ex} from '../../src/util/helpers'

test('SelectInput has correct properties', ()=> {
    const selectInput = new SelectInput('t1', 'Select Input 1', {values: ['Green', 'Blue', 'Pink'], initialValue: ex`Blue`, label: ex`Select One`})

    expect(selectInput.id).toBe('t1')
    expect(selectInput.name).toBe('Select Input 1')
    expect(selectInput.values).toStrictEqual(['Green', 'Blue', 'Pink'])
    expect(selectInput.initialValue).toStrictEqual(ex`Blue`)
    expect(selectInput.label).toStrictEqual(ex`Select One`)
})

test('SelectInput has correct default values', ()=> {
    const selectInput = new SelectInput('t1', 'Select Input 1', {values: []})

    expect(selectInput.id).toBe('t1')
    expect(selectInput.name).toBe('Select Input 1')
    expect(selectInput.values).toStrictEqual([])
    expect(selectInput.initialValue).toBeUndefined()
    expect(selectInput.label).toBe('Select Input 1')
    expect(selectInput.properties.label).toBeUndefined()
})

test('tests if an object is this type', ()=> {
    const selectInput = new SelectInput('t1', 'Select Input 1', {values: ['Green', 'Blue', 'Pink'], initialValue: ex`Blue`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(SelectInput.is(selectInput)).toBe(true)
    expect(SelectInput.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const selectInput = new SelectInput('t1', 'Select Input 1', {values: ['Green', 'Blue', 'Pink'], initialValue: ex`Blue`})
    const updated = selectInput.set('t1', 'name', 'Select 1A')
    expect(updated.name).toBe('Select 1A')
    expect(updated.initialValue).toStrictEqual(ex`Blue`)
    expect(selectInput.name).toBe('Select Input 1')
    expect(selectInput.initialValue).toStrictEqual(ex`Blue`)

    const updated2 = updated.set('t1', 'initialValue', ex`Pink`)
    expect(updated2.name).toBe('Select 1A')
    expect(updated2.initialValue).toStrictEqual(ex`Pink`)
    expect(updated.name).toBe('Select 1A')
    expect(updated.initialValue).toStrictEqual(ex`Blue`)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const selectInput = new SelectInput('t1', 'Select Input 1', {values: ['Green', 'Blue', 'Pink'], initialValue: ex`Blue`})
    const updated = selectInput.set('x1', 'name', 'Select 1A')
    expect(updated).toBe(selectInput)
})

test('converts to JSON', ()=> {
    const select = new SelectInput('t1', 'Select Input 1', {values: ['Green', 'Blue', 'Pink'], initialValue: ex`Blue`, label: ex`"The Select"`})
    expect(asJSON(select)).toStrictEqual({
        kind: 'SelectInput',
        id: 't1',
        name: 'Select Input 1',
        properties: select.properties
    })

    const select2 = new SelectInput('t1', 'Select Input 2', {values: ['Green', 'Blue', 'Pink'], initialValue: 'Blue', label: 'The Select'})
    expect(asJSON(select2)).toStrictEqual({
        kind: 'SelectInput',
        id: 't1',
        name: 'Select Input 2',
        properties: select2.properties
    })
})

test('converts from plain object', ()=> {
    const selectInput = new SelectInput('t1', 'Select Input 1', {values: ['Green', 'Blue', 'Pink'], initialValue: ex`Blue`})
    const plainObj = asJSON(selectInput)
    const newObj = loadJSON(plainObj)
    expect(newObj).toStrictEqual<SelectInput>(selectInput)

    const selectInput2 = new SelectInput('t1', 'Select Input 1', {values: ['Green', 'Blue', 'Pink'], initialValue: 'Green', label: 'The Select'})
    const plainObj2 = asJSON(selectInput2)
    const newObj2 = loadJSON(plainObj2)
    expect(newObj2).toStrictEqual<SelectInput>(selectInput2)
})