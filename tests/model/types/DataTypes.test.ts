import {expect, test} from "vitest"
import DataTypes from '../../../src/model/types/DataTypes'
import TrueFalseType from '../../../src/model/types/TrueFalseType'
import {Page} from '../../testutil/modelHelpers'
import {loadJSON} from '../../../src/model/loadJSON'
import {asJSON} from '../../testutil/testHelpers'

const bool1 = new TrueFalseType('b1', 'Bool 1', {description: 'One'})
const bool2 = new TrueFalseType('b2', 'Bool 2', {description: 'Two'})

test('DataTypes has correct properties with default values', ()=> {
    const dataTypes1 = new DataTypes('id1', 'Data Types 1', {}, [bool1, bool2])

    expect(dataTypes1.id).toBe('id1')
    expect(dataTypes1.name).toBe('Data Types 1')
    expect(dataTypes1.type()).toBe('utility')
    expect(dataTypes1.elementArray().map( el => el.id )).toStrictEqual(['b1', 'b2'])
})

test('tests if an object is this type', ()=> {
    const dataTypes = new DataTypes('id1', 'Data Types 1', {}, [])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(DataTypes.is(dataTypes)).toBe(true)
    expect(DataTypes.is(page)).toBe(false)
})

test('cannot update the name', ()=> {
    const dataTypes = new DataTypes('id1', 'Data Types 1', {}, [bool1])
    const updatedDataTypes1 = dataTypes.set('id1', 'name', 'Data Types 2')
    expect(updatedDataTypes1.name).toBe('Data Types 2')
    expect(dataTypes.name).toBe('Data Types 1')
})

test('can contain only other data types', () => {
    const dataTypes = new DataTypes('m1', 'DataTypes 1', {}, [])
    expect(dataTypes.canContain('Project')).toBe(false)
    expect(dataTypes.canContain('App')).toBe(false)
    expect(dataTypes.canContain('Page')).toBe(false)
    expect(dataTypes.canContain('DataTypes')).toBe(false)
    expect(dataTypes.canContain('TrueFalseType')).toBe(true)
    expect(dataTypes.canContain('Text')).toBe(false)
    expect(dataTypes.canContain('Button')).toBe(false)
})

test('converts to JSON', ()=> {
    const dataTypes = new DataTypes('id1', 'Data Types 1', {}, [bool1, bool2])
    expect(asJSON(dataTypes)).toStrictEqual({
        kind: 'DataTypes',
        id: 'id1',
        name: 'Data Types 1',
        properties: dataTypes.properties,
        elements: [asJSON(bool1), asJSON(bool2)]
    })
})

test('converts from plain object', ()=> {
    const dataTypes = new DataTypes('id1', 'Data Types 1', {}, [bool1, bool2])
    const plainObj = asJSON(dataTypes)
    const newDataTypes = loadJSON(plainObj)
    expect(newDataTypes).toStrictEqual<DataTypes>(dataTypes)
})
