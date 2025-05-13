import {expect, test} from "vitest"
import FunctionImport from '../../src/model/FunctionImport'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('FunctionImport has correct properties with default values', ()=> {
    const function1 = new FunctionImport('id1', 'Function 1', {})

    expect(function1.id).toBe('id1')
    expect(function1.name).toBe('Function 1')
    expect(function1.type()).toBe('utility')
    expect(function1.source).toBe(undefined)
    expect(function1.exportName).toBe(undefined)
})

test('Function has correct properties with specified values', ()=> {
    const function1 = new FunctionImport('id1', 'Function 1', { source: 'FunctionOne.js', exportName: 'widget'})

    expect(function1.id).toBe('id1')
    expect(function1.name).toBe('Function 1')
    expect(function1.source).toBe('FunctionOne.js')
    expect(function1.exportName).toBe('widget')
})

test('tests if an object is this type', ()=> {
    const function1 = new FunctionImport('id1', 'Function 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(FunctionImport.is(function1)).toBe(true)
    expect(FunctionImport.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const function1 = new FunctionImport('id1', 'Function 1', {source: 'http://cdn.somewhere.com//FunctionOne.js'})
    const updatedfunctionDef1 = function1.set('id1', 'source', 'http://cdn.elsewhere.com//FunctionTwo.js')
    expect(updatedfunctionDef1.name).toBe('Function 1')
    expect(updatedfunctionDef1.source).toBe('http://cdn.elsewhere.com//FunctionTwo.js')
    expect(function1.name).toBe('Function 1')
    expect(function1.source).toBe('http://cdn.somewhere.com//FunctionOne.js')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const functionDef = new FunctionImport('id1', 'Function 1', {source: 'height'})
    const updatedFunction = functionDef.set('id2', 'name', ex`Function 1A`)
    expect(updatedFunction).toStrictEqual(functionDef)
})

test('converts to JSON without optional proerties', ()=> {
    const functionDef = new FunctionImport('id1', 'Function 1', {})
    expect(asJSON(functionDef)).toStrictEqual({
        kind: 'FunctionImport',
        id: 'id1',
        name: 'Function 1',
        properties: functionDef.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const functionDef = new FunctionImport('id1', 'Function 1', {source: 'Fun1.js', exportName: 'foo'})
    expect(asJSON(functionDef)).toStrictEqual({
        kind: 'FunctionImport',
        id: 'id1',
        name: 'Function 1',
        properties: functionDef.properties
    })
})

test('converts from plain object', ()=> {
    const functionDef = new FunctionImport('id1', 'Function 1', {source: 'Function1.js', exportName: 'bar'})
    const plainObj = asJSON(functionDef)
    const newFunction = loadJSON(plainObj)
    expect(newFunction).toStrictEqual<FunctionImport>(functionDef)

    const functionDef2 = new FunctionImport('id1', 'Function 2', {})
    const plainObj2 = asJSON(functionDef2)
    const newFunction2 = loadJSON(plainObj2)
    expect(newFunction2).toStrictEqual<FunctionImport>(functionDef2)
})
