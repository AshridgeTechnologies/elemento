import {expect, test} from "vitest"
import ListType from '../../../src/model/types/ListType'
import {loadJSON} from '../../../src/model/loadJSON'
import {asJSON, ex} from '../../testutil/testHelpers'
import {Page} from '../../testutil/modelHelpers'
import TrueFalseType from '../../../src/model/types/TrueFalseType'
import TextType from '../../../src/model/types/TextType'
import Rule from '../../../src/model/types/Rule'
import {standardOptionalRule} from '../../../src/model/types/BaseTypeElement'

const text1 = new TextType('tt1', 'Name', {description: 'What it\'s called'})
const text2 = new TextType('tt2', 'Location', {description: 'Where it is', maxLength: 10})
const bool1 = new TrueFalseType('bt1', 'Visited', {description: 'Have we been there?'})
const placeList = new ListType('list1', 'Places', {description: 'The places to visit'}, [text2,])

test('ListType has expected properties', () => {
    expect(placeList.id).toBe('list1')
    expect(placeList.name).toBe('Places')
    expect(placeList.type()).toBe('dataType')
    expect(ListType.isDataType()).toBe(true)
    expect(placeList.properties).toStrictEqual({description: 'The places to visit'})
    expect(placeList.elementArray()).toStrictEqual([text2,])
    expect(placeList.elementType).toBe(text2)
})

test('tests if an object is this type', ()=> {
    const listType1 = new ListType('id1', 'ListType 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ListType.is(listType1)).toBe(true)
    expect(ListType.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const listType1 = new ListType('id1', 'ListType 1', {description: 'Some places'})
    const updatedListType1 = listType1.set('id1', 'description', 'More places')
    expect(updatedListType1.description).toBe('More places')
    expect(listType1.description).toBe('Some places')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const listType1 = new ListType('id1', 'ListType 1', {description: 'A list'})
    const updatedListType = listType1.set('id2', 'description', ex`'Another list'`)
    expect(updatedListType).toStrictEqual(listType1)
})

test('can have additional validation rules',  () => {
    const rule1 = new Rule('r1', 'Min length', {formula: '$value.length >= 3', description: 'Must have at least three elements'})
    const listType1 = new ListType('id1', 'ListType 1', {description: 'A list'}, [rule1, text1, ])

    expect(listType1.rules).toStrictEqual([rule1, standardOptionalRule])
    expect(listType1.elementType).toStrictEqual(text1)

    expect(listType1.ruleDescriptions).toStrictEqual([
        'Must have at least three elements',
        standardOptionalRule.description
    ])
})

test('can contain other data types including List', () => {
    const listType1 = new ListType('id1', 'ListType 1', {})
    expect(listType1.canContain('Project')).toBe(false)
    expect(listType1.canContain('TextType')).toBe(true)
    expect(listType1.canContain('DataTypes')).toBe(false)
    expect(listType1.canContain('TrueFalseType')).toBe(true)
    expect(listType1.canContain('ListType')).toBe(true)
    expect(listType1.canContain('Rule')).toBe(true)
})

test('cannot contain another element data type if already has one', () => {
    const listType1 = new ListType('id1', 'ListType 1', {}, [text1])
    expect(listType1.canContain('Project')).toBe(false)
    expect(listType1.canContain('TextType')).toBe(false)
    expect(listType1.canContain('DataTypes')).toBe(false)
    expect(listType1.canContain('TrueFalseType')).toBe(false)
    expect(listType1.canContain('ListType')).toBe(false)
    expect(listType1.canContain('Rule')).toBe(true)
})

test('can contain an element data type if only has rules', () => {
    const rule1 = new Rule('r1', 'Min length', {formula: '$value.length >= 3', description: 'Must have at least three elements'})
    const rule2 = new Rule('r2', 'Max length', {formula: '$value.length <= 10', description: 'Must have at no more than 10 elements'})

    const listType1 = new ListType('id1', 'ListType 1', {}, [rule1, rule2])
    expect(listType1.canContain('Project')).toBe(false)
    expect(listType1.canContain('TextType')).toBe(true)
    expect(listType1.canContain('DataTypes')).toBe(false)
    expect(listType1.canContain('TrueFalseType')).toBe(true)
    expect(listType1.canContain('ListType')).toBe(true)
    expect(listType1.canContain('Rule')).toBe(true)
})

test('converts to JSON', ()=> {

    expect(asJSON(placeList)).toStrictEqual({
        kind: 'ListType',
        id: 'list1',
        name: 'Places',
        properties: placeList.properties,
        elements: [asJSON(text2)]
    })
})

test('converts from plain object', ()=> {
    const text1 = new TextType('tt1', 'Name', {description: 'What it\'s called'})
    const listType1 = new ListType('list1', 'Place', {description: 'A place to visit'}, [text1])
    const plainObj = asJSON(listType1)
    const newListType = loadJSON(plainObj)
    expect(newListType).toStrictEqual<ListType>(listType1)
})
