import {expect, test} from "vitest"
import ChoiceType from '../../../src/model/types/ChoiceType'
import {loadJSON} from '../../../src/model/loadJSON'
import {asJSON, ex} from '../../testutil/testHelpers'
import {Page} from '../../testutil/modelHelpers'
import Rule from '../../../src/model/types/Rule'
import {standardOptionalRule} from '../../../src/model/types/BaseTypeElement'

test('ChoiceType has expected properties', () => {
    const choiceType1 = new ChoiceType('id1', 'ChoiceType 1', {description: 'The choices', values: ['red', 'green', 'brown'], valueNames: ['Rouge', 'Vert', 'Marron']})

    expect(choiceType1.id).toBe('id1')
    expect(choiceType1.name).toBe('ChoiceType 1')
    expect(choiceType1.type()).toBe('dataType')
    expect(ChoiceType.isDataType()).toBe(true)
    expect(choiceType1.values).toStrictEqual(['red', 'green', 'brown'])
    expect(choiceType1.valueNames).toStrictEqual(['Rouge', 'Vert', 'Marron'])
    expect(choiceType1.properties).toStrictEqual({description: 'The choices', values: ['red', 'green', 'brown'], valueNames: ['Rouge', 'Vert', 'Marron']})
})

test('ChoiceType has expected default values', () => {
    const choiceType1 = new ChoiceType('id1', 'ChoiceType 1', {description: 'The choices'})

    expect(choiceType1.values).toStrictEqual([])
    expect(choiceType1.valueNames).toStrictEqual([])
    expect(choiceType1.properties).toStrictEqual({description: 'The choices'})
})

test('can have additional validation rules',  () => {
    const choiceType1 = new ChoiceType('id1', 'ChoiceType 1', {description: 'The choices', values: ['red', 'green', 'brown']}, [
        new Rule('r1', 'Yes but not brown', {formula: `$value !== 'brown'`, description: 'Not brown actually'})
    ])

    expect(choiceType1.rules).toStrictEqual([
        new Rule('r1', 'Yes but not brown', {formula: `$value !== 'brown'`, description: 'Not brown actually'}),
        standardOptionalRule
    ])

    expect(choiceType1.ruleDescriptions).toStrictEqual([
        'Not brown actually',
        standardOptionalRule.description
    ])
})

test('tests if an object is this type', ()=> {
    const choiceType1 = new ChoiceType('id1', 'ChoiceType 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ChoiceType.is(choiceType1)).toBe(true)
    expect(ChoiceType.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const choiceType1 = new ChoiceType('id1', 'ChoiceType 1', {description: 'The choices', values: ['red', 'blue']})
    const updatedChoiceType1 = choiceType1.set('id1', 'description', 'The colours')
    expect(updatedChoiceType1.description).toBe('The colours')
    expect(choiceType1.description).toBe('The choices')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const choiceType1 = new ChoiceType('id1', 'ChoiceType 1', {description: 'A choice'})
    const updatedChoiceType = choiceType1.set('id2', 'description', ex`'Another choice'`)
    expect(updatedChoiceType).toStrictEqual(choiceType1)
})

test('can contain Rule but not other data types', () => {
    const choiceType1 = new ChoiceType('id1', 'ChoiceType 1', {description: 'A choice'})
    expect(choiceType1.canContain('Project')).toBe(false)
    expect(choiceType1.canContain('ChoiceType')).toBe(false)
    expect(choiceType1.canContain('DataTypes')).toBe(false)
    expect(choiceType1.canContain('TrueFalseType')).toBe(false)
    expect(choiceType1.canContain('RecordType')).toBe(false)
    expect(choiceType1.canContain('Rule')).toBe(true)
})

test('converts to JSON', ()=> {
    const rule1 = new Rule('r1', 'Yes but not brown', {formula: `$value !== 'brown'`, description: 'Not brown actually'})
    const choiceType1 = new ChoiceType('id1', 'ChoiceType 1', {description: 'Desc 1', values: ['red', 'blue']},[
        rule1
    ])
    expect(asJSON(choiceType1)).toStrictEqual({
        kind: 'ChoiceType',
        id: 'id1',
        name: 'ChoiceType 1',
        properties: choiceType1.properties,
        elements: [
            asJSON(rule1)
        ]
    })
})

test('converts from plain object', ()=> {
    const choiceType1 = new ChoiceType('id1', 'ChoiceType 1', {description: 'Desc 1', values: ['red', 'blue']}, [
        new Rule('r1', 'Yes but not brown', {formula: `$value !== 'brown'`, description: 'Not brown actually'})
    ])
    const plainObj = asJSON(choiceType1)
    const newChoiceType = loadJSON(plainObj)
    expect(newChoiceType).toStrictEqual<ChoiceType>(choiceType1)
})
