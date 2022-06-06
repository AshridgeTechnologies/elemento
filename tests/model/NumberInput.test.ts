import NumberInput from '../../src/model/NumberInput'
import Page from '../../src/model/Page'
import {asJSON, ex} from '../testutil/testHelpers'
import {loadJSON} from '../../src/model/loadJSON'

test('NumberInput has correct properties', ()=> {
    const numberInput = new NumberInput('t1', 'Number Input 1', {initialValue: {expr: '40'}, label: ex`Number One`})

    expect(numberInput.id).toBe('t1')
    expect(numberInput.name).toBe('Number Input 1')
    expect(numberInput.initialValue).toStrictEqual({expr: '40'})
    expect(numberInput.label).toStrictEqual(ex`Number One`)
})

test('NumberInput has default values', ()=> {
    const numberInput = new NumberInput('t1', 'Number Input 1', {})

    expect(numberInput.id).toBe('t1')
    expect(numberInput.name).toBe('Number Input 1')
    expect(numberInput.initialValue).toBeUndefined()
    expect(numberInput.label).toBe(`Number Input 1`)
    expect(numberInput.properties.label).toBeUndefined()
})


test('tests if an object is this type', ()=> {
    const numberInput = new NumberInput('t1', 'Number Input 1', {initialValue: {expr: '40'}})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(NumberInput.is(numberInput)).toBe(true)
    expect(NumberInput.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const numberInput = new NumberInput('t1', 'Number Input 1', {initialValue: {expr: '40'}})
    const updated = numberInput.set('t1', 'name', 'Number 1A')
    expect(updated.name).toBe('Number 1A')
    expect(updated.initialValue).toStrictEqual({expr: '40'})
    expect(numberInput.name).toBe('Number Input 1')
    expect(numberInput.initialValue).toStrictEqual({expr: '40'})

    const updated2 = updated.set('t1', 'initialValue', {expr: '99'})
    expect(updated2.name).toBe('Number 1A')
    expect(updated2.initialValue).toStrictEqual({expr: '99'})
    expect(updated.name).toBe('Number 1A')
    expect(updated.initialValue).toStrictEqual({expr: '40'})
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const numberInput = new NumberInput('t1', 'Number Input 1', {initialValue: {expr: '40'}})
    const updated = numberInput.set('x1', 'name', 'Number 1A')
    expect(updated).toBe(numberInput)
})

test('converts to JSON', ()=> {
    const number = new NumberInput('t1', 'Number Input 1', {initialValue: {expr: '40'}, label: ex`"The Number"`})
    expect(asJSON(number)).toStrictEqual({
        kind: 'NumberInput',
        id: 't1',
        name: 'Number Input 1',
        properties: number.properties
    })

    const number2 = new NumberInput('t1', 'Number Input 2', {initialValue: 40, label: 'The Number'})
    expect(asJSON(number2)).toStrictEqual({
        kind: 'NumberInput',
        id: 't1',
        name: 'Number Input 2',
        properties: number2.properties
    })
})

test('converts from plain object', ()=> {
    const numberInput = new NumberInput('t1', 'Number Input 1', {initialValue: {expr: '40'}})
    const plainObj = asJSON(numberInput)
    const newObj = loadJSON(plainObj)
    expect(newObj).toStrictEqual<NumberInput>(numberInput)

    const numberInput2 = new NumberInput('t1', 'Number Input 1', {initialValue: 40, label: 'The Number'})
    const plainObj2 = asJSON(numberInput2)
    const newObj2 = loadJSON(plainObj2)
    expect(newObj2).toStrictEqual<NumberInput>(numberInput2)
})