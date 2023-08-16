import Calculation from '../../src/model/Calculation'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('Calculation has correct properties with default values', ()=> {
    const calculation1 = new Calculation('id1', 'Calculation 1', {})

    expect(calculation1.id).toBe('id1')
    expect(calculation1.name).toBe('Calculation 1')
    expect(calculation1.calculation).toBe(undefined)
    expect(calculation1.display).toBe(true)
    expect(calculation1.width).toBe(undefined)
    expect(calculation1.label).toBe(undefined)
})

test('Calculation has correct properties with specified values', ()=> {
    const calculation1 = new Calculation('id1', 'Calculation 1', {calculation: ex`"Some calculation"`, display: true, width: 300, label: 'My Calculation'})

    expect(calculation1.id).toBe('id1')
    expect(calculation1.name).toBe('Calculation 1')
    expect(calculation1.calculation).toStrictEqual(ex`"Some calculation"`)
    expect(calculation1.display).toBe(true)
    expect(calculation1.width).toBe(300)
    expect(calculation1.label).toBe('My Calculation')
})

test('tests if an object is this type', ()=> {
    const calculation = new Calculation('id1', 'Calculation 1', {calculation: ex`3 + 4`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Calculation.is(calculation)).toBe(true)
    expect(Calculation.is(page)).toBe(false)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const calculation = new Calculation('id1', 'Calculation 1', {calculation: ex`"Some calculation"`})
    const updatedCalculation = calculation.set('id2', 'name', ex`Calculation 1A`)
    expect(updatedCalculation).toStrictEqual(calculation)
})

test('has correct property names', () => {
    expect(new Calculation('id1', 'Calculation 1', {}).propertyDefs.map( ({name}) => name )).toStrictEqual(['calculation', 'label', 'display', 'width'])
})

test('converts to JSON without optional properties', ()=> {
    const calculation = new Calculation('id1', 'Calculation 1', {})
    expect(asJSON(calculation)).toStrictEqual({
        kind: 'Calculation',
        id: 'id1',
        name: 'Calculation 1',
        properties: calculation.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const calculation = new Calculation('id1', 'Calculation 1', {calculation: ex`"Some calculation"`, display: true, width: 200, label: 'A Calculation'})
    expect(asJSON(calculation)).toStrictEqual({
        kind: 'Calculation',
        id: 'id1',
        name: 'Calculation 1',
        properties: calculation.properties
    })
})

test('converts from plain object', ()=> {
    const calculation = new Calculation('id1', 'Calculation 1', {calculation: ex`"Some calculation"`, display: ex`false && true`, width: ex`3+4`, label: 'A Calculation'})
    const plainObj = asJSON(calculation)
    const newCalculation = loadJSON(plainObj)
    expect(newCalculation).toStrictEqual<Calculation>(calculation)

    const calculation2 = new Calculation('id1', 'Calculation 2', {calculation: ex`"Some calculation"`, display: false})
    const plainObj2 = asJSON(calculation2)
    const newCalculation2 = loadJSON(plainObj2)
    expect(newCalculation2).toStrictEqual<Calculation>(calculation2)
})
