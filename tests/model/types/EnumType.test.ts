import EnumType from '../../../src/model/types/EnumType'
import {loadJSON} from '../../../src/model/loadJSON'
import {asJSON, ex} from '../../testutil/testHelpers'
import Page from '../../../src/model/Page'
import Rule from '../../../src/model/types/Rule'
import RecordType from '../../../src/model/types/RecordType'
import {standardOptionalRule} from '../../../src/model/types/BaseTypeElement'

test('EnumType has expected properties', () => {
    const enumType1 = new EnumType('id1', 'EnumType 1', {description: 'The choices', values: ['red', 'green', 'brown']})

    expect(enumType1.id).toBe('id1')
    expect(enumType1.name).toBe('EnumType 1')
    expect(enumType1.type()).toBe('dataType')
    expect(EnumType.isDataType()).toBe(true)
    expect(enumType1.values).toStrictEqual(['red', 'green', 'brown'])
    expect(enumType1.properties).toStrictEqual({description: 'The choices', values: ['red', 'green', 'brown']})
})

test('EnumType has expected default values', () => {
    const enumType1 = new EnumType('id1', 'EnumType 1', {description: 'The choices'})

    expect(enumType1.values).toStrictEqual([])
    expect(enumType1.properties).toStrictEqual({description: 'The choices'})
})

test('can have additional validation rules',  () => {
    const enumType1 = new EnumType('id1', 'EnumType 1', {description: 'The choices', values: ['red', 'green', 'brown']}, [
        new Rule('r1', 'Yes but not brown', {formula: `$value !== 'brown'`, description: 'Not brown actually'})
    ])

    expect(enumType1.rules).toStrictEqual([
        standardOptionalRule,
        new Rule('r1', 'Yes but not brown', {formula: `$value !== 'brown'`, description: 'Not brown actually'})
    ])

    expect(enumType1.ruleDescriptions).toStrictEqual([
        standardOptionalRule.description,
        'Not brown actually'
    ])
})

test('tests if an object is this type', ()=> {
    const enumType1 = new EnumType('id1', 'EnumType 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(EnumType.is(enumType1)).toBe(true)
    expect(EnumType.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const enumType1 = new EnumType('id1', 'EnumType 1', {description: 'The choices', values: ['red', 'blue']})
    const updatedEnumType1 = enumType1.set('id1', 'description', 'The colours')
    expect(updatedEnumType1.description).toBe('The colours')
    expect(enumType1.description).toBe('The choices')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const enumType1 = new EnumType('id1', 'EnumType 1', {description: 'A enum'})
    const updatedEnumType = enumType1.set('id2', 'description', ex`'Another enum'`)
    expect(updatedEnumType).toStrictEqual(enumType1)
})

test('can contain Rule but not other data types', () => {
    const enumType1 = new EnumType('id1', 'EnumType 1', {description: 'A enum'})
    expect(enumType1.canContain('Project')).toBe(false)
    expect(enumType1.canContain('EnumType')).toBe(false)
    expect(enumType1.canContain('DataTypes')).toBe(false)
    expect(enumType1.canContain('TrueFalseType')).toBe(false)
    expect(enumType1.canContain('RecordType')).toBe(false)
    expect(enumType1.canContain('Rule')).toBe(true)
})

test('converts to JSON', ()=> {
    const rule1 = new Rule('r1', 'Yes but not brown', {formula: `$value !== 'brown'`, description: 'Not brown actually'})
    const enumType1 = new EnumType('id1', 'EnumType 1', {description: 'Desc 1', values: ['red', 'blue']},[
        rule1
    ])
    expect(asJSON(enumType1)).toStrictEqual({
        kind: 'EnumType',
        id: 'id1',
        name: 'EnumType 1',
        properties: enumType1.properties,
        elements: [
            asJSON(rule1)
        ]
    })
})

test('converts from plain object', ()=> {
    const enumType1 = new EnumType('id1', 'EnumType 1', {description: 'Desc 1', values: ['red', 'blue']}, [
        new Rule('r1', 'Yes but not brown', {formula: `$value !== 'brown'`, description: 'Not brown actually'})
    ])
    const plainObj = asJSON(enumType1)
    const newEnumType = loadJSON(plainObj)
    expect(newEnumType).toStrictEqual<EnumType>(enumType1)
})
