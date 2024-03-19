import ComponentDef from '../../src/model/ComponentDef'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'
import DateInput from '../../src/model/DateInput'

test('ComponentDef has correct properties with default values', ()=> {
    const component1 = new ComponentDef('id1', 'Component 1', {})

    expect(component1.id).toBe('id1')
    expect(component1.name).toBe('Component 1')
    expect(component1.kind).toBe('Component')
    expect(component1.type()).toBe('utility')
    expect(component1.input1).toBe(undefined)
    expect(component1.input2).toBe(undefined)
    expect(component1.input3).toBe(undefined)
    expect(component1.input4).toBe(undefined)
    expect(component1.input5).toBe(undefined)
    expect(component1.inputs).toStrictEqual([])
    expect(ComponentDef.parentType).toBe('ComponentFolder')
})

test('has correct properties with specified values', ()=> {
    const component1 = new ComponentDef('id1', 'Component 1', {input1: 'in1', input2: 'in2', input3: 'in3', input4: 'in4', input5: 'in5'})

    expect(component1.id).toBe('id1')
    expect(component1.name).toBe('Component 1')
    expect(component1.input1).toBe('in1')
    expect(component1.input2).toBe('in2')
    expect(component1.input3).toBe('in3')
    expect(component1.input4).toBe('in4')
    expect(component1.input5).toBe('in5')
    expect(component1.inputs).toStrictEqual(['in1', 'in2', 'in3', 'in4', 'in5'])
})

test('inputs excludes empty names', ()=> {
    const component1 = new ComponentDef('id1', 'Component 1', {input1: 'in1', input3: 'in3', input4: 'in4', input5: ''})

    expect(component1.inputs).toStrictEqual(['in1', 'in3', 'in4'])
})

test('tests if an object is this type', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ComponentDef.is(componentDef)).toBe(true)
    expect(ComponentDef.is(page)).toBe(false)
})

test('has correct property names', () => {
    expect(new ComponentDef('id1', 'Component 1', {}).propertyDefs.map( ({name}) => name )).toStrictEqual(['input1', 'input2', 'input3', 'input4', 'input5'])
})

test('can contain normal page elements', () => {
    const componentDef = new ComponentDef('id1', 'Component 1', {})
    expect(componentDef.canContain('TextInput')).toBe(true)
    expect(componentDef.canContain('Page')).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {input1: 'height', input2: 'width'})
    const updatedComponentDef1 = componentDef.set('id1', 'name', 'Component 1A')
    expect(updatedComponentDef1.name).toBe('Component 1A')
    expect(updatedComponentDef1.input1).toBe('height')
    expect(componentDef.name).toBe('Component 1')
    expect(componentDef.input1).toBe('height')

    const updatedComponentDef2 = updatedComponentDef1.set('id1', 'input1', 'size')
    expect(updatedComponentDef2.name).toBe('Component 1A')
    expect(updatedComponentDef2.input1).toBe('size')
    expect(updatedComponentDef1.name).toBe('Component 1A')
    expect(updatedComponentDef1.input1).toBe('height')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {input1: 'height'})
    const updatedComponent = componentDef.set('id2', 'name', ex`Component 1A`)
    expect(updatedComponent).toStrictEqual(componentDef)
})

test('converts to JSON without optional proerties', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {})
    expect(asJSON(componentDef)).toStrictEqual({
        kind: 'Component',
        id: 'id1',
        name: 'Component 1',
        properties: componentDef.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {input1: 'in1', input2: 'in2', input3: 'in3', input4: 'in4', input5: 'in5'})
    expect(asJSON(componentDef)).toStrictEqual({
        kind: 'Component',
        id: 'id1',
        name: 'Component 1',
        properties: componentDef.properties
    })
})

test('converts from plain object', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {input1: 'in1', input2: 'in2', input3: 'in3', input4: 'in4', input5: 'in5'})
    const plainObj = asJSON(componentDef)
    const newComponent = loadJSON(plainObj)
    expect(newComponent).toStrictEqual<ComponentDef>(componentDef)

    const componentDef2 = new ComponentDef('id1', 'Component 2', {})
    const plainObj2 = asJSON(componentDef2)
    const newComponent2 = loadJSON(plainObj2)
    expect(newComponent2).toStrictEqual<ComponentDef>(componentDef2)
})
