import {expect, test} from "vitest"
import ComponentInstance from '../../src/model/ComponentInstance'
import {Page} from '../testutil/modelHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'
import ComponentDef from '../../src/model/ComponentDef'
import Project, {COMPONENTS_ID} from '../../src/model/Project'
import ComponentFolder from '../../src/model/ComponentFolder'

test('ComponentInstance has correct properties with default values', ()=> {
    const componentDef1 = new ComponentDef('cd1', 'MyComponent', {})
    const compFolder = new ComponentFolder(COMPONENTS_ID, 'Components', {}, [componentDef1])

    const project = Project.new([compFolder])

    const component1 = new ComponentInstance('t1', 'ComponentInstance 1', {componentType: 'MyComponent'})

    expect(component1.id).toBe('t1')
    expect(component1.name).toBe('ComponentInstance 1')
    expect(component1.kind).toBe('MyComponent')
    expect(project.componentType(component1)).toBe('statelessUI')
    expect(component1.notes).toBe(undefined)
    expect(component1.styles).toBe(undefined)
    expect(component1.show).toBe(undefined)
})

test('ComponentInstance has correct properties with specified values', ()=> {
    const styles = {fontSize: 32, fontFamily: 'Courier', color: 'red', backgroundColor: 'blue', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 20}
    const component1 = new ComponentInstance('t1', 'ComponentInstance 1', {componentType: 'MyComponent', notes:'This is some text', fooFactor: ex`21`, show: false,
        styles: styles})

    expect(component1.id).toBe('t1')
    expect(component1.name).toBe('ComponentInstance 1')
    expect(component1.notes).toBe('This is some text')
    expect((component1 as any).fooFactor).toBe(undefined)
    expect(component1.propertyValue('fooFactor')).toStrictEqual(ex`21`)
    expect(component1.show).toBe(false)
    expect(component1.styles).toStrictEqual(styles)
})

test('tests if an object is this type', ()=> {
    const text = new ComponentInstance('t1', 'ComponentInstance 1', {componentType: 'MyComponent'})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ComponentInstance.is(text)).toBe(true)
    expect(ComponentInstance.is(page)).toBe(false)
})

test('has empty own property names', () => {
    expect(new ComponentInstance('t1', 'ComponentInstance 1', {componentType: 'MyComponent'}).propertyDefs).toStrictEqual([])
})

test('creates an updated object with a property set to a new value', ()=> {
    const component = new ComponentInstance('t1', 'ComponentInstance 1', {componentType: 'MyComponent', fooFactor: ex`21`})
    const updatedComponent1 = component.set('t1', 'name', 'ComponentInstance 1A')
    expect(updatedComponent1.name).toBe('ComponentInstance 1A')
    expect(updatedComponent1.propertyValue('fooFactor')).toStrictEqual(ex`21`)
    expect(component.name).toBe('ComponentInstance 1')
    expect(component.propertyValue('fooFactor')).toStrictEqual(ex`21`)

    const updatedComponent2 = updatedComponent1.set('t1', 'fooFactor', ex`shazam`)
    expect(updatedComponent2.name).toBe('ComponentInstance 1A')
    expect(updatedComponent2.propertyValue('fooFactor')).toStrictEqual(ex`shazam`)
    expect(updatedComponent1.name).toBe('ComponentInstance 1A')
    expect(updatedComponent1.propertyValue('fooFactor')).toStrictEqual(ex`21`)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const component = new ComponentInstance('t1', 'ComponentInstance 1', {componentType: 'MyComponent'})
    const updatedComponent = component.set('x1', 'name', ex`ComponentInstance 1A`)
    expect(updatedComponent).toStrictEqual(component)
})

test('converts to JSON without optional properties', ()=> {
    const component = new ComponentInstance('t1', 'ComponentInstance 1', {componentType: 'MyComponent'})
    expect(asJSON(component)).toStrictEqual({
        kind: 'MyComponent',
        id: 't1',
        name: 'ComponentInstance 1',
        properties: component.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const styles = {fontSize: 44, fontFamily: 'Dog', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 40}
    const component = new ComponentInstance('t1', 'ComponentInstance 1', {componentType: 'MyComponent', styles: styles, show: ex`false`, fooFactor: ex`21`})
    expect(asJSON(component)).toStrictEqual({
        kind: 'MyComponent',
        id: 't1',
        name: 'ComponentInstance 1',
        properties: component.properties
    })
})

test('converts from plain object', ()=> {
    const styles = {fontSize: ex`44`, fontFamily: 'Dog', color: ex`'red'`, backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 40}
    const component = new ComponentInstance('t1', 'ComponentInstance 1', {componentType: 'MyComponent', styles: styles, fooFactor: ex`21`})
    const plainObj = asJSON(component)
    const newComponent = loadJSON(plainObj)
    expect(newComponent).toStrictEqual<ComponentInstance>(component)

    const component2 = new ComponentInstance('t1', 'ComponentInstance 2', {componentType: 'MyComponent', content: `Some text`, styles: styles, show: false, fooFactor: 44})
    const plainObj2 = asJSON(component2)
    const newComponent2 = loadJSON(plainObj2)
    expect(newComponent2).toStrictEqual<ComponentInstance>(component2)
})

