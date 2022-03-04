import Data from '../../src/model/Data'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON} from '../testutil/testHelpers'
import {ex} from '../../src/util/helpers'

test('Data has correct properties with default values', ()=> {
    const data1 = new Data('id1', 'Data 1', {})

    expect(data1.id).toBe('id1')
    expect(data1.name).toBe('Data 1')
    expect(data1.initialValue).toBe(undefined)
    expect(data1.display).toBe(false)
})

test('Data has correct properties with specified values', ()=> {
    const data1 = new Data('id1', 'Data 1', {initialValue: 'Some data', display: true})

    expect(data1.id).toBe('id1')
    expect(data1.name).toBe('Data 1')
    expect(data1.initialValue).toStrictEqual('Some data')
    expect(data1.display).toBe(true)
})

test('tests if an object is this type', ()=> {
    const data = new Data('id1', 'Data 1', {initialValue: 'Some data'})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Data.is(data)).toBe(true)
    expect(Data.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const data = new Data('id1', 'Data 1', {initialValue: 'Some data', display: true})
    const updatedData1 = data.set('id1', 'name', 'Data 1A')
    expect(updatedData1.name).toBe('Data 1A')
    expect(updatedData1.initialValue).toBe('Some data')
    expect(data.name).toBe('Data 1')
    expect(data.initialValue).toBe('Some data')

    const updatedData2 = updatedData1.set('id1', 'initialValue', ex`shazam`)
    expect(updatedData2.name).toBe('Data 1A')
    expect(updatedData2.initialValue).toStrictEqual(ex`shazam`)
    expect(updatedData1.name).toBe('Data 1A')
    expect(updatedData1.initialValue).toBe('Some data')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const data = new Data('id1', 'Data 1', {initialValue: ex`"Some data"`})
    const updatedData = data.set('id2', 'name', ex`Data 1A`)
    expect(updatedData).toStrictEqual(data)
})

test('converts to JSON without optional proerties', ()=> {
    const data = new Data('id1', 'Data 1', {})
    expect(asJSON(data)).toStrictEqual({
        kind: 'Data',
        id: 'id1',
        name: 'Data 1',
        properties: data.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const data = new Data('id1', 'Data 1', {initialValue: ex`"Some data"`, display: true})
    expect(asJSON(data)).toStrictEqual({
        kind: 'Data',
        id: 'id1',
        name: 'Data 1',
        properties: data.properties
    })
})

test('converts from plain object', ()=> {
    const data = new Data('id1', 'Data 1', {initialValue: ex`"Some data"`, display: ex`false && true`})
    const plainObj = asJSON(data)
    const newData = loadJSON(plainObj)
    expect(newData).toStrictEqual<Data>(data)

    const data2 = new Data('id1', 'Data 2', {initialValue: `Some data`, display: false})
    const plainObj2 = asJSON(data2)
    const newData2 = loadJSON(plainObj2)
    expect(newData2).toStrictEqual<Data>(data2)
})
