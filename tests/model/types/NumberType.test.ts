import {expect, test} from "vitest"
import NumberType from '../../../src/model/types/NumberType'
import {loadJSON} from '../../../src/model/loadJSON'
import {asJSON, ex} from '../../testutil/testHelpers'
import Page from '../../../src/model/Page'
import Rule, {BuiltInRule} from '../../../src/model/types/Rule'
import {standardOptionalRule, standardRequiredRule} from '../../../src/model/types/BaseTypeElement'

test('NumberType has expected properties', () => {
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'The amount', min: 5, max: 20, format: 'integer'})

    expect(numberType1.id).toBe('id1')
    expect(numberType1.name).toBe('NumberType 1')
    expect(numberType1.type()).toBe('dataType')
    expect(NumberType.isDataType()).toBe(true)
    expect(numberType1.min).toBe(5)
    expect(numberType1.max).toBe(20)
    expect(numberType1.format).toBe('integer')
    expect(numberType1.properties).toStrictEqual({description: 'The amount', min: 5, max: 20, format: 'integer'})
})

test('has validation rules from shorthand properties', () => {
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'The amount', required: true, min: 5, max: 20, format: 'integer'})

    expect(numberType1.rules).toStrictEqual([
        new BuiltInRule('Minimum 5'),
        new BuiltInRule('Maximum 20'),
        new BuiltInRule('Must be a whole number'),
        standardRequiredRule,
    ])

    expect(numberType1.ruleDescriptions).toStrictEqual([
        'Minimum 5',
        'Maximum 20',
        'Must be a whole number',
        standardRequiredRule.description
    ])
})

test('can have additional validation rules',  () => {
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'The amount', format: 'integer'}, [
        new Rule('r1', 'Multiple of 10', {formula: '$value % 10 === 0', description: 'Must be a multiple of 10'})
    ])

    expect(numberType1.rules).toStrictEqual([
        new BuiltInRule('Must be a whole number'),
        new Rule('r1', 'Multiple of 10', {formula: '$value % 10 === 0', description: 'Must be a multiple of 10'}),
        standardOptionalRule
    ])

    expect(numberType1.ruleDescriptions).toStrictEqual([
        'Must be a whole number',
        'Must be a multiple of 10',
        standardOptionalRule.description
    ])
})

test('tests if an object is this type', ()=> {
    const numberType1 = new NumberType('id1', 'NumberType 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(NumberType.is(numberType1)).toBe(true)
    expect(NumberType.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const numberType1 = new NumberType('id1', 'NumberType 1', {})
    const updatedNumberType1 = numberType1.set('id1', 'name', 'NumberType 1A')
    expect(updatedNumberType1.name).toBe('NumberType 1A')
    expect(numberType1.name).toBe('NumberType 1')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'A number'})
    const updatedNumberType = numberType1.set('id2', 'description', ex`'Another number'`)
    expect(updatedNumberType).toStrictEqual(numberType1)
})

test('can contain Rule but not other data types', () => {
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'A number'})
    expect(numberType1.canContain('Project')).toBe(false)
    expect(numberType1.canContain('NumberType')).toBe(false)
    expect(numberType1.canContain('DataTypes')).toBe(false)
    expect(numberType1.canContain('TrueFalseType')).toBe(false)
    expect(numberType1.canContain('RecordType')).toBe(false)
    expect(numberType1.canContain('Rule')).toBe(true)
})

test('converts to JSON', ()=> {
    const rule1 = new Rule('r1', 'Even', {formula: '$value % 2 === 0', description: "Must be even"})
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'Desc 1', min: 5, max: 2000, format: 'integer'},[
        rule1
    ])
    expect(asJSON(numberType1)).toStrictEqual({
        kind: 'NumberType',
        id: 'id1',
        name: 'NumberType 1',
        properties: numberType1.properties,
        elements: [
            asJSON(rule1)
        ]
    })
})

test('converts from plain object', ()=> {
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'Desc 1', min: 5, max: 2000, format: 'integer'}, [
        new Rule('r1', 'Even', {formula: '$value % 2 === 0', description: "Must be even"})
    ])
    const plainObj = asJSON(numberType1)
    const newNumberType = loadJSON(plainObj)
    expect(newNumberType).toStrictEqual<NumberType>(numberType1)
})
