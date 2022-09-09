import FunctionDef from '../../src/model/FunctionDef'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('FunctionDef has correct properties with default values', ()=> {
    const function1 = new FunctionDef('id1', 'Function 1', {})

    expect(function1.id).toBe('id1')
    expect(function1.name).toBe('Function 1')
    expect(function1.type()).toBe('background')
    expect(function1.input1).toBe(undefined)
    expect(function1.input2).toBe(undefined)
    expect(function1.input3).toBe(undefined)
    expect(function1.input4).toBe(undefined)
    expect(function1.input5).toBe(undefined)
    expect(function1.action).toBe(undefined)
    expect(function1.calculation).toBe(undefined)
})

test('Function has correct properties with specified values', ()=> {
    const function1 = new FunctionDef('id1', 'Function 1', {input1: 'in1', input2: 'in2', input3: 'in3', input4: 'in4', input5: 'in5', action: true, calculation: ex`doIt()`})

    expect(function1.id).toBe('id1')
    expect(function1.name).toBe('Function 1')
    expect(function1.input1).toBe('in1')
    expect(function1.input2).toBe('in2')
    expect(function1.input3).toBe('in3')
    expect(function1.input4).toBe('in4')
    expect(function1.input5).toBe('in5')
    expect(function1.action).toBe(true)
    expect(function1.calculation).toStrictEqual(ex`doIt()`)
})

test('tests if an object is this type', ()=> {
    const functionDef = new FunctionDef('id1', 'Function 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(FunctionDef.is(functionDef)).toBe(true)
    expect(FunctionDef.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const functionDef = new FunctionDef('id1', 'Function 1', {input1: 'height', calculation: ex`doIt()`})
    const updatedfunctionDef1 = functionDef.set('id1', 'name', 'Function 1A')
    expect(updatedfunctionDef1.name).toBe('Function 1A')
    expect(updatedfunctionDef1.input1).toBe('height')
    expect(functionDef.name).toBe('Function 1')
    expect(functionDef.input1).toBe('height')

    const updatedfunctionDef2 = updatedfunctionDef1.set('id1', 'input1', 'height')
    expect(updatedfunctionDef2.name).toBe('Function 1A')
    expect(updatedfunctionDef2.calculation).toStrictEqual(ex`doIt()`)
    expect(updatedfunctionDef1.name).toBe('Function 1A')
    expect(updatedfunctionDef1.calculation).toStrictEqual(ex`doIt()`)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const functionDef = new FunctionDef('id1', 'Function 1', {input1: 'height', calculation: ex`doIt()`})
    const updatedFunction = functionDef.set('id2', 'name', ex`Function 1A`)
    expect(updatedFunction).toStrictEqual(functionDef)
})

test('converts to JSON without optional proerties', ()=> {
    const functionDef = new FunctionDef('id1', 'Function 1', {})
    expect(asJSON(functionDef)).toStrictEqual({
        kind: 'Function',
        id: 'id1',
        name: 'Function 1',
        properties: functionDef.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const functionDef = new FunctionDef('id1', 'Function 1', {input1: 'in1', input2: 'in2', input3: 'in3', input4: 'in4', input5: 'in5', action: true, calculation: ex`doIt()`})
    expect(asJSON(functionDef)).toStrictEqual({
        kind: 'Function',
        id: 'id1',
        name: 'Function 1',
        properties: functionDef.properties
    })
})

test('converts from plain object', ()=> {
    const functionDef = new FunctionDef('id1', 'Function 1', {input1: 'in1', input2: 'in2', input3: 'in3', input4: 'in4', input5: 'in5', action: true, calculation: ex`doIt()`})
    const plainObj = asJSON(functionDef)
    const newFunction = loadJSON(plainObj)
    expect(newFunction).toStrictEqual<FunctionDef>(functionDef)

    const functionDef2 = new FunctionDef('id1', 'Function 2', {})
    const plainObj2 = asJSON(functionDef2)
    const newFunction2 = loadJSON(plainObj2)
    expect(newFunction2).toStrictEqual<FunctionDef>(functionDef2)
})
