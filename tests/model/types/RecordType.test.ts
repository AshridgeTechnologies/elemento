import RecordType from '../../../src/model/types/RecordType'
import {loadJSON} from '../../../src/model/loadJSON'
import {asJSON, ex} from '../../testutil/testHelpers'
import Page from '../../../src/model/Page'
import TrueFalseType from '../../../src/model/types/TrueFalseType'
import TextType from '../../../src/model/types/TextType'
import Rule, {BuiltInRule} from '../../../src/model/types/Rule'
import {standardRequiredRule} from '../../../src/model/types/BaseTypeElement'

const text1 = new TextType('tt1', 'Name', {description: 'What it\'s called'})
const text2 = new TextType('tt2', 'Location', {description: 'Where it is', maxLength: 10})
const bool1 = new TrueFalseType('bt1', 'Visited', {description: 'Have we been there?'})
const placeRecord = new RecordType('rec1', 'Place', {description: 'A place to visit', required: true}, [text1, text2, bool1,])

test('RecordType has expected properties', () => {
    expect(placeRecord.id).toBe('rec1')
    expect(placeRecord.name).toBe('Place')
    expect(placeRecord.type()).toBe('dataType')
    expect(RecordType.isDataType()).toBe(true)
    expect(placeRecord.description).toBe('A place to visit')
    expect(placeRecord.required).toBe(true)
    expect(placeRecord.properties).toStrictEqual({description: 'A place to visit', required: true})
    expect(placeRecord.elementArray()).toStrictEqual([text1, text2, bool1])
})

test('tests if an object is this type', ()=> {
    const recordType1 = new RecordType('id1', 'RecordType 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(RecordType.is(recordType1)).toBe(true)
    expect(RecordType.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const recordType1 = new RecordType('id1', 'RecordType 1', {})
    const updatedRecordType1 = recordType1.set('id1', 'name', 'RecordType 1A')
    expect(updatedRecordType1.name).toBe('RecordType 1A')
    expect(recordType1.name).toBe('RecordType 1')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const recordType1 = new RecordType('id1', 'RecordType 1', {description: 'A record'})
    const updatedRecordType = recordType1.set('id2', 'description', ex`'Another record'`)
    expect(updatedRecordType).toStrictEqual(recordType1)
})

test('has built-in validation rules',  () => {
    const recordType1 = new RecordType('id1', 'RecordType 1', {description: 'A record', required: true}, [text1, text2])

    expect(recordType1.rules).toStrictEqual([
        standardRequiredRule
    ])
    expect(recordType1.ruleDescriptions).toStrictEqual([
        standardRequiredRule.description,
    ])
})

test('can have additional validation rules',  () => {
    const rule1 = new Rule('r1', 'Different texts', {formula: '$value.Name !== $value.Location', description: 'Name cannot be the same as Location'})
    const recordType1 = new RecordType('id1', 'RecordType 1', {description: 'A record'}, [text1, text2, rule1])

    expect(recordType1.rules).toStrictEqual([
        rule1,
        new BuiltInRule(`Optional`)
    ])

    expect(recordType1.ruleDescriptions).toStrictEqual([
        'Name cannot be the same as Location',
        'Optional'
    ])
})

test('can be based on another type name', ()=> {
    const recordType2 = new RecordType('id2', 'RecordType 2', {basedOn: ex`RecordType1`})
    expect(recordType2.basedOn).toStrictEqual(ex`RecordType1`)
})

test('can contain other data types including Record', () => {
    const recordType1 = new RecordType('id1', 'RecordType 1', {})
    expect(recordType1.canContain('Project')).toBe(false)
    expect(recordType1.canContain('TextType')).toBe(true)
    expect(recordType1.canContain('DataTypes')).toBe(false)
    expect(recordType1.canContain('TrueFalseType')).toBe(true)
    expect(recordType1.canContain('RecordType')).toBe(true)
    expect(recordType1.canContain('Rule')).toBe(true)
})

test('converts to JSON', ()=> {

    expect(asJSON(placeRecord)).toStrictEqual({
        kind: 'RecordType',
        id: 'rec1',
        name: 'Place',
        properties: placeRecord.properties,
        elements: [asJSON(text1), asJSON(text2), asJSON(bool1)]
    })
})

test('converts from plain object', ()=> {
    const text1 = new TextType('tt1', 'Name', {description: 'What it\'s called'})
    const recordType1 = new RecordType('rec1', 'Place', {description: 'A place to visit'}, [text1])
    const plainObj = asJSON(recordType1)
    const newRecordType = loadJSON(plainObj)
    expect(newRecordType).toStrictEqual<RecordType>(recordType1)
})