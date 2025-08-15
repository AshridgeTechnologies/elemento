import {expect, test} from "vitest"
import DecimalType from '../../../src/model/types/DecimalType'
import {loadJSON} from '../../../src/model/loadJSON'
import {asJSON, ex} from '../../testutil/testHelpers'
import {Page} from '../../testutil/modelHelpers'
import Rule, {BuiltInRule} from '../../../src/model/types/Rule'
import {standardOptionalRule, standardRequiredRule} from '../../../src/model/types/BaseTypeElement'

test('DecimalType has expected properties', () => {
    const decimalType1 = new DecimalType('id1', 'DecimalType 1', {description: 'The amount', min: 5, max: 20, decimalPlaces: 4})

    expect(decimalType1.id).toBe('id1')
    expect(decimalType1.name).toBe('DecimalType 1')
    expect(decimalType1.type()).toBe('dataType')
    expect(DecimalType.isDataType()).toBe(true)
    expect(decimalType1.min).toBe(5)
    expect(decimalType1.max).toBe(20)
    expect(decimalType1.decimalPlaces).toBe(4)
    expect(decimalType1.properties).toStrictEqual({description: 'The amount', min: 5, max: 20, decimalPlaces: 4})
})

test('has validation rules from shorthand properties', () => {
    const decimalType1 = new DecimalType('id1', 'DecimalType 1', {description: 'The amount', required: true, min: 5, max: 20, decimalPlaces: 4})

    expect(decimalType1.rules).toStrictEqual([
        new BuiltInRule('Minimum 5'),
        new BuiltInRule('Maximum 20'),
        new BuiltInRule('4 decimal places'),
        standardRequiredRule,
    ])

    expect(decimalType1.ruleDescriptions).toStrictEqual([
        'Minimum 5',
        'Maximum 20',
        '4 decimal places',
        standardRequiredRule.description
    ])
})

test('can have additional validation rules',  () => {
    const decimalType1 = new DecimalType('id1', 'DecimalType 1', {description: 'The amount'}, [
        new Rule('r1', 'Multiple of 10', {formula: '$value % 10 === 0', description: 'Must be a multiple of 10'})
    ])

    expect(decimalType1.rules).toStrictEqual([
        new Rule('r1', 'Multiple of 10', {formula: '$value % 10 === 0', description: 'Must be a multiple of 10'}),
        standardOptionalRule
    ])

    expect(decimalType1.ruleDescriptions).toStrictEqual([
        'Must be a multiple of 10',
        standardOptionalRule.description
    ])
})

test('tests if an object is this type', ()=> {
    const decimalType1 = new DecimalType('id1', 'DecimalType 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(DecimalType.is(decimalType1)).toBe(true)
    expect(DecimalType.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const decimalType1 = new DecimalType('id1', 'DecimalType 1', {})
    const updatedDecimalType1 = decimalType1.set('id1', 'name', 'DecimalType 1A')
    expect(updatedDecimalType1.name).toBe('DecimalType 1A')
    expect(decimalType1.name).toBe('DecimalType 1')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const decimalType1 = new DecimalType('id1', 'DecimalType 1', {description: 'A decimal'})
    const updatedDecimalType = decimalType1.set('id2', 'description', ex`'Another decimal'`)
    expect(updatedDecimalType).toStrictEqual(decimalType1)
})

test('can contain Rule but not other data types', () => {
    const decimalType1 = new DecimalType('id1', 'DecimalType 1', {description: 'A decimal'})
    expect(decimalType1.canContain('Project')).toBe(false)
    expect(decimalType1.canContain('DecimalType')).toBe(false)
    expect(decimalType1.canContain('DataTypes')).toBe(false)
    expect(decimalType1.canContain('TrueFalseType')).toBe(false)
    expect(decimalType1.canContain('RecordType')).toBe(false)
    expect(decimalType1.canContain('Rule')).toBe(true)
})

test('converts to JSON', ()=> {
    const rule1 = new Rule('r1', 'Even', {formula: '$value % 2 === 0', description: "Must be even"})
    const decimalType1 = new DecimalType('id1', 'DecimalType 1', {description: 'Desc 1', min: 5, max: 2000},[
        rule1
    ])
    expect(asJSON(decimalType1)).toStrictEqual({
        kind: 'DecimalType',
        id: 'id1',
        name: 'DecimalType 1',
        properties: decimalType1.properties,
        elements: [
            asJSON(rule1)
        ]
    })
})

test('converts from plain object', ()=> {
    const decimalType1 = new DecimalType('id1', 'DecimalType 1', {description: 'Desc 1', min: 5, max: 2000}, [
        new Rule('r1', 'Even', {formula: '$value % 2 === 0', description: "Must be even"})
    ])
    const plainObj = asJSON(decimalType1)
    const newDecimalType = loadJSON(plainObj)
    expect(newDecimalType).toStrictEqual<DecimalType>(decimalType1)
})
