import NumberType from '../../../src/model/types/NumberType'
import {loadJSON} from '../../../src/model/loadJSON'
import {asJSON, ex} from '../../testutil/testHelpers'
import Page from '../../../src/model/Page'
import Rule from '../../../src/model/types/Rule'
import RecordType from '../../../src/model/types/RecordType'
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
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'The amount', required: true, min: 5, max: 20, format: 'currency'})

    expect(numberType1.rules).toStrictEqual([
        standardRequiredRule,
        new Rule('_', '_min', {description: 'Minimum 5', formula: 'min(5)'}),
        new Rule('_', '_max', {description: 'Maximum 20', formula: 'max(20)'}),
        new Rule('_', '_format', {description: 'Must be a currency amount', formula: 'currency()'}),
    ])

    expect(numberType1.ruleDescriptions).toStrictEqual([
        standardRequiredRule.description,
        'Minimum 5',
        'Maximum 20',
        'Must be a currency amount'
    ])
})

test('can have additional validation rules',  () => {
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'The amount', format: 'integer'}, [
        new Rule('r1', 'Multiple of 10', {formula: '$value % 10 === 0', description: 'Must be a multiple of 10'})
    ])

    expect(numberType1.rules).toStrictEqual([
        standardOptionalRule,
        new Rule('_', '_format', {description: 'Must be a whole number', formula: 'integer()'}),
        new Rule('r1', 'Multiple of 10', {formula: '$value % 10 === 0', description: 'Must be a multiple of 10'})
    ])

    expect(numberType1.ruleDescriptions).toStrictEqual([
        standardOptionalRule.description,
        'Must be a whole number',
        'Must be a multiple of 10'
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
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'Desc 1', min: 5, max: 2000, format: 'currency'}, [
        new Rule('r1', 'Even', {formula: '$value % 2 === 0', description: "Must be even"})
    ])
    const plainObj = asJSON(numberType1)
    const newNumberType = loadJSON(plainObj)
    expect(newNumberType).toStrictEqual<NumberType>(numberType1)
})
