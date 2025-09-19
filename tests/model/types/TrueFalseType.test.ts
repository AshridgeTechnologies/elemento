import {expect, test} from "vitest"
import TrueFalseType from '../../../src/model/types/TrueFalseType'
import {loadJSON} from '../../../src/model/loadJSON'
import {asJSON, ex} from '../../testutil/testHelpers'
import {Page} from '../../testutil/modelHelpers'

test('TrueFalseType has expected properties', () => {
    const trueFalseType1 = new TrueFalseType('id1', 'TrueFalseType 1', {description: 'Yes or no'})

    expect(trueFalseType1.id).toBe('id1')
    expect(trueFalseType1.name).toBe('TrueFalseType 1')
    expect(trueFalseType1.type()).toBe('dataType')
    expect(trueFalseType1.properties).toStrictEqual({description: 'Yes or no'})

})

test('tests if an object is this type', ()=> {
    const trueFalseType1 = new TrueFalseType('id1', 'TrueFalseType 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(TrueFalseType.is(trueFalseType1)).toBe(true)
    expect(TrueFalseType.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const trueFalseType1 = new TrueFalseType('id1', 'TrueFalseType 1', {})
    const updatedTrueFalseType1 = trueFalseType1.set('id1', 'name', 'TrueFalseType 1A')
    expect(updatedTrueFalseType1.name).toBe('TrueFalseType 1A')
    expect(trueFalseType1.name).toBe('TrueFalseType 1')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const trueFalseType1 = new TrueFalseType('id1', 'TrueFalseType 1', {description: 'A boolean'})
    const updatedTrueFalseType = trueFalseType1.set('id2', 'description', ex`'Another boolean'`)
    expect(updatedTrueFalseType).toStrictEqual(trueFalseType1)
})

test('can contain Rule but not other data types', () => {
    const trueFalseType1 = new TrueFalseType('b1', 'TextType 1', {description: 'A true/false'})
    expect(trueFalseType1.canContain('Project')).toBe(false)
    expect(trueFalseType1.canContain('TextType')).toBe(false)
    expect(trueFalseType1.canContain('DataTypes')).toBe(false)
    expect(trueFalseType1.canContain('TrueFalseType')).toBe(false)
    expect(trueFalseType1.canContain('RecordType')).toBe(false)
    expect(trueFalseType1.canContain('Rule')).toBe(true)
})

test('converts to JSON', ()=> {
    const trueFalseType1 = new TrueFalseType('id1', 'TrueFalseType 1', {description: 'Desc 1'})
    expect(asJSON(trueFalseType1)).toStrictEqual({
        kind: 'TrueFalseType',
        id: 'id1',
        name: 'TrueFalseType 1',
        properties: trueFalseType1.properties
    })
})

test('converts from plain object', ()=> {
    const trueFalseType1 = new TrueFalseType('id1', 'TrueFalseType 1', {description: 'Desc 1'})
    const plainObj = asJSON(trueFalseType1)
    const newTrueFalseType = loadJSON(plainObj)
    expect(newTrueFalseType).toStrictEqual<TrueFalseType>(trueFalseType1)
})
