import {expect, test} from "vitest"
import TextType from '../../../src/model/types/TextType'
import {loadJSON} from '../../../src/model/loadJSON'
import {asJSON, ex} from '../../testutil/testHelpers'
import Page from '../../../src/model/Page'
import Rule, {BuiltInRule} from '../../../src/model/types/Rule'
import {standardOptionalRule, standardRequiredRule} from '../../../src/model/types/BaseTypeElement'

test('TextType has default properties', () => {
    const textType1 = new TextType('id1', 'TextType 1', {})
    expect(textType1.description).toBe(undefined)
    expect(textType1.required).toBe(false)
    expect(textType1.minLength).toBe(undefined)
    expect(textType1.maxLength).toBe(undefined)
    expect(textType1.format).toBe(undefined)
    expect(textType1.properties).toStrictEqual({})
})

test('TextType has expected properties', () => {
    const textType1 = new TextType('id1', 'TextType 1', {description: 'The blurb', required: true, minLength: 5, maxLength: 20, format: 'email'})

    expect(textType1.id).toBe('id1')
    expect(textType1.name).toBe('TextType 1')
    expect(textType1.type()).toBe('dataType')
    expect(TextType.isDataType()).toBe(true)
    expect(textType1.description).toBe('The blurb')
    expect(textType1.required).toBe(true)
    expect(textType1.minLength).toBe(5)
    expect(textType1.maxLength).toBe(20)
    expect(textType1.format).toBe('email')
    expect(textType1.properties).toStrictEqual({description: 'The blurb', required: true, minLength: 5, maxLength: 20, format: 'email'})
})

test('has validation rules from shorthand properties', () => {
    const textType1 = new TextType('id1', 'TextType 1', {description: 'The blurb', required: true, minLength: 5, maxLength: 20, format: 'email'})

    expect(textType1.rules).toStrictEqual([
        new BuiltInRule('Minimum length 5'),
        new BuiltInRule('Maximum length 20'),
        new BuiltInRule('Must be a valid email'),
        standardRequiredRule
    ])

    expect(textType1.ruleDescriptions).toStrictEqual([
        'Minimum length 5',
        'Maximum length 20',
        'Must be a valid email',
        standardRequiredRule.description
    ])
})

test('can have additional validation rules and description defauts to name',  () => {
    const textType1 = new TextType('id1', 'TextType 1', {description: 'The blurb', format: 'url'}, [
        new Rule('r1', 'Dot Com', {formula: '$item.endsWith(".com")'})
    ])

    expect(textType1.rules).toStrictEqual([
        new BuiltInRule('Must be a valid url'),
        new Rule('r1', 'Dot Com', {formula: '$item.endsWith(".com")'}),
        standardOptionalRule
    ])

    expect(textType1.ruleDescriptions).toStrictEqual([
        'Must be a valid url',
        'Dot Com',
        standardOptionalRule.description
    ])
})

test('tests if an object is this type', ()=> {
    const textType1 = new TextType('id1', 'TextType 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(TextType.is(textType1)).toBe(true)
    expect(TextType.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const textType1 = new TextType('id1', 'TextType 1', {})
    const updatedTextType1 = textType1.set('id1', 'name', 'TextType 1A')
    expect(updatedTextType1.name).toBe('TextType 1A')
    expect(textType1.name).toBe('TextType 1')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const textType1 = new TextType('id1', 'TextType 1', {description: 'A text'})
    const updatedTextType = textType1.set('id2', 'description', ex`'Another text'`)
    expect(updatedTextType).toStrictEqual(textType1)
})

test('can contain Rule but not other data types', () => {
    const textType1 = new TextType('id1', 'TextType 1', {description: 'A text'})
    expect(textType1.canContain('Project')).toBe(false)
    expect(textType1.canContain('TextType')).toBe(false)
    expect(textType1.canContain('DataTypes')).toBe(false)
    expect(textType1.canContain('TrueFalseType')).toBe(false)
    expect(textType1.canContain('RecordType')).toBe(false)
    expect(textType1.canContain('Rule')).toBe(true)
})

test('can be based on another type name', ()=> {
    const textType2 = new TextType('id2', 'TextType 2', {basedOn: ex`TextType1`})
    expect(textType2.basedOn).toStrictEqual(ex`TextType1`)
})

test('converts to JSON', ()=> {
    const rule1 = new Rule('r1', 'Dot Com', {formula: '$item.endsWith(".com")', description: "Must end with .com"})
    const textType1 = new TextType('id1', 'TextType 1', {description: 'Desc 1', minLength: 5, maxLength: 2000, format: 'multiline'},[
        rule1
    ])
    expect(asJSON(textType1)).toStrictEqual({
        kind: 'TextType',
        id: 'id1',
        name: 'TextType 1',
        properties: textType1.properties,
        elements: [
            asJSON(rule1)
        ]
    })
})

test('converts from plain object', ()=> {
    const textType1 = new TextType('id1', 'TextType 1', {description: 'Desc 1', minLength: 5, maxLength: 2000, format: 'multiline'}, [
        new Rule('r1', 'Dot Com', {formula: '$item.endsWith(".com")', description: "Must end with .com"})
    ])
    const plainObj = asJSON(textType1)
    const newTextType = loadJSON(plainObj)
    expect(newTextType).toStrictEqual<TextType>(textType1)
})
