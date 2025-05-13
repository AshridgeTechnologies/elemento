import {expect, test} from "vitest"
import ComponentDef from '../../src/model/ComponentDef'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('ComponentDef has correct properties with default values', ()=> {
    const component1 = new ComponentDef('id1', 'Component 1', {})

    expect(component1.id).toBe('id1')
    expect(component1.name).toBe('Component 1')
    expect(component1.kind).toBe('Component')
    expect(component1.type()).toBe('utility')
    expect(ComponentDef.parentType).toBe('ComponentFolder')
})

test('has correct properties with specified values', ()=> {
    const component1 = new ComponentDef('id1', 'Component 1', {})
    expect(component1.id).toBe('id1')
    expect(component1.name).toBe('Component 1')
})

test('tests if an object is this type', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ComponentDef.is(componentDef)).toBe(true)
    expect(ComponentDef.is(page)).toBe(false)
})

test('has correct property names', () => {
    expect(new ComponentDef('id1', 'Component 1', {}).propertyDefs).toStrictEqual([])
})

test('can contain normal page elements', () => {
    const componentDef = new ComponentDef('id1', 'Component 1', {})
    expect(componentDef.canContain('TextInput')).toBe(true)
    expect(componentDef.canContain('Page')).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {})
    const updatedComponentDef1 = componentDef.set('id1', 'name', 'Component 1A')
    expect(updatedComponentDef1.name).toBe('Component 1A')
    expect(componentDef.name).toBe('Component 1')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {})
    const updatedComponent = componentDef.set('id2', 'name', ex`Component 1A`)
    expect(updatedComponent).toStrictEqual(componentDef)
})

test('converts to JSON', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {})
    expect(asJSON(componentDef)).toStrictEqual({
        kind: 'Component',
        id: 'id1',
        name: 'Component 1',
        properties: componentDef.properties
    })
})

test('converts from plain object', ()=> {
    const componentDef = new ComponentDef('id1', 'Component 1', {})
    const plainObj = asJSON(componentDef)
    const newComponent = loadJSON(plainObj)
    expect(newComponent).toStrictEqual<ComponentDef>(componentDef)

    const componentDef2 = new ComponentDef('id1', 'Component 2', {})
    const plainObj2 = asJSON(componentDef2)
    const newComponent2 = loadJSON(plainObj2)
    expect(newComponent2).toStrictEqual<ComponentDef>(componentDef2)
})
