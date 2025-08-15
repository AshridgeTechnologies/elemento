import {expect, test} from "vitest"
import ServerAppConnector from '../../src/model/ServerAppConnector'
import {Page} from '../testutil/modelHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('ServerAppConnector has correct properties with default values', ()=> {
    const connector = new ServerAppConnector('id1', 'ServerAppConnector 1', {})

    expect(connector.id).toBe('id1')
    expect(connector.name).toBe('ServerAppConnector 1')
    expect(connector.serverApp).toBe(undefined)
    expect(connector.serverUrl).toBe(undefined)
})

test('ServerAppConnector has correct properties with specified values', ()=> {
    const connector = new ServerAppConnector('id1', 'ServerAppConnector 1', {serverApp: ex`serverApp_1`, serverUrl: 'https://example.com/api'})

    expect(connector.id).toBe('id1')
    expect(connector.name).toBe('ServerAppConnector 1')
    expect(connector.serverApp).toStrictEqual(ex`serverApp_1`)
    expect(connector.serverUrl).toBe('https://example.com/api')
})

test('tests if an object is this type', ()=> {
    const connector = new ServerAppConnector('id1', 'ServerAppConnector 1', {serverApp: ex`serverApp_1`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ServerAppConnector.is(connector)).toBe(true)
    expect(ServerAppConnector.is(page)).toBe(false)
})

test('can belong to an App', () => {
    expect(ServerAppConnector.parentType).toBe('App')
})

test('creates an updated object with a property set to a new value', ()=> {
    const connector = new ServerAppConnector('id1', 'ServerAppConnector 1', {serverApp: ex`serverApp_1`})
    const updatedConnector1 = connector.set('id1', 'name', 'ServerAppConnector 1A')
    expect(updatedConnector1.name).toBe('ServerAppConnector 1A')
    expect(updatedConnector1.serverApp).toStrictEqual(ex`serverApp_1`)
    expect(connector.name).toBe('ServerAppConnector 1')
    expect(connector.serverApp).toStrictEqual(ex`serverApp_1`)

    const updatedConnector2 = updatedConnector1.set('id1', 'serverApp', ex`serverApp_2`)
    expect(updatedConnector2.name).toBe('ServerAppConnector 1A')
    expect(updatedConnector2.serverApp).toStrictEqual(ex`serverApp_2`)
    expect(updatedConnector1.name).toBe('ServerAppConnector 1A')
    expect(updatedConnector1.serverApp).toStrictEqual(ex`serverApp_1`)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const connector = new ServerAppConnector('id1', 'ServerAppConnector 1', {serverApp: ex`serverApp_1`})
    const updatedConnector = connector.set('id2', 'name', ex`ServerAppConnector 1A`)
    expect(updatedConnector).toStrictEqual(connector)
})

test('converts to JSON without optional proerties', ()=> {
    const connector = new ServerAppConnector('id1', 'ServerAppConnector 1', {})
    expect(asJSON(connector)).toStrictEqual({
        kind: 'ServerAppConnector',
        id: 'id1',
        name: 'ServerAppConnector 1',
        properties: connector.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const connector = new ServerAppConnector('id1', 'ServerAppConnector 1', {serverApp: ex`serverApp_1`, serverUrl: 'https://example.com/api'})
    expect(asJSON(connector)).toStrictEqual({
        kind: 'ServerAppConnector',
        id: 'id1',
        name: 'ServerAppConnector 1',
        properties: connector.properties
    })
})

test('converts from plain object', ()=> {
    const connector = new ServerAppConnector('id1', 'ServerAppConnector 1', {serverApp: ex`serverApp_1`, serverUrl: 'https://example.com/api'})
    const plainObj = asJSON(connector)
    const newServerAppConnector = loadJSON(plainObj)
    expect(newServerAppConnector).toStrictEqual<ServerAppConnector>(connector)

    const serverAppConnector2 = new ServerAppConnector('id1', 'ServerAppConnector 2', {serverApp: ex`serverApp_1`})
    const plainObj2 = asJSON(serverAppConnector2)
    const newServerAppConnector2 = loadJSON(plainObj2)
    expect(newServerAppConnector2).toStrictEqual<ServerAppConnector>(serverAppConnector2)
})
