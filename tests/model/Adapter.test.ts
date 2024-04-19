import Adapter from '../../src/model/Adapter'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('Adapter has correct properties with default values', ()=> {
    const adapter = new Adapter('id1', 'Adapter 1', {})

    expect(adapter.id).toBe('id1')
    expect(adapter.name).toBe('Adapter 1')
    expect(adapter.type()).toBe('background')
    expect(adapter.target).toBe(undefined)
})

test('Adapter has correct properties with specified values', ()=> {
    const adapter = new Adapter('id1', 'Adapter 1', {target: ex`Widget_1`})

    expect(adapter.id).toBe('id1')
    expect(adapter.name).toBe('Adapter 1')
    expect(adapter.target).toStrictEqual(ex`Widget_1`)
})

test('has correct property names', () => {
    const adapter = new Adapter('id1', 'Adapter 1', {target: ex`Widget_1`})
    expect(adapter.propertyDefs.map( ({name}) => name )).toStrictEqual(['target'])
    expect(adapter.propertyDefs[0].type).toBe('expr')
})


test('tests if an object is this type', ()=> {
    const adapter = new Adapter('id1', 'Adapter 1', {target: ex`Widget_1`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Adapter.is(adapter)).toBe(true)
    expect(Adapter.is(page)).toBe(false)
})

test('can belong to an App', () => {
    expect(Adapter.parentType).toBe('App')
})

test('creates an updated object with a property set to a new value', ()=> {
    const adapter = new Adapter('id1', 'Adapter 1', {target: ex`Widget_1`})
    const updatedAdapter1 = adapter.set('id1', 'name', 'Adapter 1A')
    expect(updatedAdapter1.name).toBe('Adapter 1A')
    expect(adapter.target).toStrictEqual(ex`Widget_1`)
    expect(adapter.name).toBe('Adapter 1')
    expect(adapter.target).toStrictEqual(ex`Widget_1`)

    const updatedAdapter2 = updatedAdapter1.set('id1', 'target', ex`Widget_2`)
    expect(updatedAdapter2.name).toBe('Adapter 1A')
    expect(updatedAdapter2.target).toStrictEqual(ex`Widget_2`)
    expect(updatedAdapter1.name).toBe('Adapter 1A')
    expect(updatedAdapter1.target).toStrictEqual(ex`Widget_1`)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const adapter = new Adapter('id1', 'Adapter 1', {target: ex`Widget_1`})
    const updatedAdapter = adapter.set('id2', 'name', ex`Adapter 1A`)
    expect(updatedAdapter).toStrictEqual(adapter)
})

test('converts to JSON without optional proerties', ()=> {
    const adapter = new Adapter('id1', 'Adapter 1', {})
    expect(asJSON(adapter)).toStrictEqual({
        kind: 'Adapter',
        id: 'id1',
        name: 'Adapter 1',
        properties: adapter.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const adapter = new Adapter('id1', 'Adapter 1', {target: ex`Widget_1`})
    expect(asJSON(adapter)).toStrictEqual({
        kind: 'Adapter',
        id: 'id1',
        name: 'Adapter 1',
        properties: adapter.properties
    })
})

test('converts from plain object', ()=> {
    const adapter = new Adapter('id1', 'Adapter 1', {target: ex`Widget_1`})
    const plainObj = asJSON(adapter)
    const newServerAppAdapter = loadJSON(plainObj)
    expect(newServerAppAdapter).toStrictEqual<Adapter>(adapter)
})
