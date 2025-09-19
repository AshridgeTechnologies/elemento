import {expect, test} from "vitest"
import {asJSON, ex, wait} from '../testutil/testHelpers'
import ServerApp from '../../src/model/ServerApp'
import {loadJSONFromString} from '../../src/model/loadJSON'
import {FunctionDef, Page} from '../testutil/modelHelpers'
import {omit} from 'ramda'

const fn1 = new FunctionDef('fn1', 'Get Stuff', {input1: 'id', input2: 'length', calculation: ex`length * 2`})
const fn2 = new FunctionDef('fn2', 'Change Stuff', {input1: 'id', input2: 'length', calculation: ex`set(id, length * 2)`})

test('ServerApp has correct properties', ()=> {
    const serverApp = new ServerApp('sa1', 'ServerApp the First', {updateTime: new Date()}, [fn1, fn2])
    const testTime = Date.now()

    expect(serverApp.id).toBe('sa1')
    expect(serverApp.name).toBe('ServerApp the First')
    expect(serverApp.codeName).toBe('ServerApptheFirst')
    expect(serverApp.kind).toBe('ServerApp')
    expect(serverApp.type()).toBe('app')
    expect(serverApp.updateTime.getTime()).toBeCloseTo(testTime, -1)
    expect(serverApp.elementArray().map( el => el.id )).toStrictEqual(['fn1', 'fn2'])
})

test('sets updateTime when updated', async () => {
    const serverApp = new ServerApp('sa1', 'ServerApp the First', {updateTime: new Date()}, [fn1, fn2])
    await wait(10)
    const updated = serverApp.set('sa1', 'name', 'ServerApp the Second')
    expect(updated.updateTime.getTime()).toBeGreaterThan(serverApp.updateTime.getTime())
})

test('tests if an object is this type', ()=> {
    const serverApp = new ServerApp('sa1', 'ServerApp 1', {updateTime: new Date()}, [])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ServerApp.is(serverApp)).toBe(true)
    expect(ServerApp.is(page)).toBe(false)
})

test('parent type', () => {
    const serverApp = new ServerApp('sa1', 'ServerApp 1', {updateTime: new Date()}, [])
    expect(ServerApp.parentType).toBe('Project')
})

test('can contain Function Def, DataStore, Collection', () => {
    const serverApp = new ServerApp('sa1', 'ServerApp 1', {updateTime: new Date()}, [])
    expect(serverApp.canContain('Project')).toBe(false)
    expect(serverApp.canContain('App')).toBe(false)
    expect(serverApp.canContain('ServerApp')).toBe(false)
    expect(serverApp.canContain('Text')).toBe(false)
    expect(serverApp.canContain('Function')).toBe(true)
    expect(serverApp.canContain('Collection')).toBe(true)
    expect(serverApp.canContain('CloudflareDataStore')).toBe(true)
})

test('converts to JSON', ()=> {
    const serverApp = new ServerApp('sa1', 'ServerApp 1', {updateTime: new Date()}, [fn1, fn2])

    const serverAppJson = asJSON(serverApp)
    expect(omit(['properties'], serverAppJson)).toStrictEqual({
        kind: 'ServerApp',
        id: 'sa1',
        name: 'ServerApp 1',
        // properties: serverApp.properties,
        elements: [asJSON(fn1), asJSON(fn2)]
    })
    expect(serverAppJson.properties.updateTime).toStrictEqual(serverApp.updateTime.toISOString())
})

test('converts from plain object with correct types for elements', ()=> {
    const testTime = new Date()
    const serverApp = new ServerApp('sa1', 'ServerApp the First', {updateTime: testTime}, [fn1, fn2])
    const jsonString = JSON.stringify(asJSON(serverApp))
    const newServerApp = loadJSONFromString(jsonString) as ServerApp
    expect(newServerApp).toStrictEqual<ServerApp>(serverApp)
    expect(typeof newServerApp.updateTime).toBe('object')
    expect(newServerApp.updateTime).toStrictEqual(testTime)
})
