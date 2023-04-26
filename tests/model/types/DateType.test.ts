import DateType from '../../../src/model/types/DateType'
import {loadJSONFromString} from '../../../src/model/loadJSON'
import {asJSON, ex} from '../../testutil/testHelpers'
import Page from '../../../src/model/Page'
import Rule, {BuiltInRule} from '../../../src/model/types/Rule'
import {standardOptionalRule, standardRequiredRule} from '../../../src/model/types/BaseTypeElement'

const date1 = new Date('2020-04-05')
const date2 = new Date('2020-04-20')

test('DateType has expected properties', () => {
    const dateType1 = new DateType('id1', 'DateType 1', {description: 'The date', min: date1, max: date2})

    expect(dateType1.id).toBe('id1')
    expect(dateType1.name).toBe('DateType 1')
    expect(dateType1.type()).toBe('dataType')
    expect(DateType.isDataType()).toBe(true)
    expect(dateType1.min).toBe(date1)
    expect(dateType1.max).toBe(date2)
    expect(dateType1.properties).toStrictEqual({description: 'The date', min: date1, max: date2})
})

test('has validation rules from shorthand properties', () => {
    const dateType1 = new DateType('id1', 'DateType 1', {description: 'The amount', required: true, min: date1, max: date2})

    expect(dateType1.rules).toStrictEqual([
        new BuiltInRule('Earliest 05 Apr 2020'),
        new BuiltInRule('Latest 20 Apr 2020'),
        standardRequiredRule,
    ])

    expect(dateType1.ruleDescriptions).toStrictEqual([
        'Earliest 05 Apr 2020',
        'Latest 20 Apr 2020',
        standardRequiredRule.description,
    ])
})

test('can have additional validation rules',  () => {
    const dateType1 = new DateType('id1', 'DateType 1', {description: 'The date', min: date1}, [
        new Rule('r1', 'Not 1st', {formula: '$value.getUTCDate() !== 1', description: 'Must not be the first day of a month'})
    ])

    expect(dateType1.rules).toStrictEqual([
        new BuiltInRule('Earliest 05 Apr 2020'),
        new Rule('r1', 'Not 1st', {formula: '$value.getUTCDate() !== 1', description: 'Must not be the first day of a month'}),
        standardOptionalRule
    ])

    expect(dateType1.ruleDescriptions).toStrictEqual([
        'Earliest 05 Apr 2020',
        'Must not be the first day of a month',
        standardOptionalRule.description
    ])
})

test('tests if an object is this type', ()=> {
    const dateType1 = new DateType('id1', 'DateType 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(DateType.is(dateType1)).toBe(true)
    expect(DateType.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const dateType1 = new DateType('id1', 'DateType 1', {min: date1})
    const updatedDateType1 = dateType1.set('id1', 'min', date2)
    expect(updatedDateType1.min).toStrictEqual(date2)
    expect(dateType1.min).toBe(date1)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const dateType1 = new DateType('id1', 'DateType 1', {description: 'A date'})
    const updatedDateType = dateType1.set('id2', 'description', ex`'Another date'`)
    expect(updatedDateType).toStrictEqual(dateType1)
})

test('can contain Rule but not other data types', () => {
    const dateType1 = new DateType('id1', 'DateType 1', {description: 'A date'})
    expect(dateType1.canContain('Project')).toBe(false)
    expect(dateType1.canContain('DateType')).toBe(false)
    expect(dateType1.canContain('DataTypes')).toBe(false)
    expect(dateType1.canContain('TrueFalseType')).toBe(false)
    expect(dateType1.canContain('RecordType')).toBe(false)
    expect(dateType1.canContain('Rule')).toBe(true)
})

test('converts to JSON', ()=> {
    const rule1 = new Rule('r1', 'Even', {formula: '$value.getUTCDay() === 2', description: "Must be a Tuesday"})
    const dateType1 = new DateType('id1', 'DateType 1', {description: 'Desc 1', min: date1},[
        rule1
    ])
    expect(asJSON(dateType1)).toStrictEqual({
        kind: 'DateType',
        id: 'id1',
        name: 'DateType 1',
        properties: asJSON(dateType1.properties),
        elements: [
            asJSON(rule1)
        ]
    })
})

test('converts from plain object', ()=> {
    const dateType1 = new DateType('id1', 'DateType 1', {description: 'Desc 1', max: date2}, [
        new Rule('r1', 'Even', {formula: '$value.getUTCDay() === 2', description: "Must be a Tuesday"})
    ])
    const plainObjStr = JSON.stringify(dateType1)
    const newDateType = loadJSONFromString(plainObjStr)
    expect(newDateType).toStrictEqual<DateType>(dateType1)
})
