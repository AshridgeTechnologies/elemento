import {asJSON, ex} from '../testutil/testHelpers'
import ServerApp from '../../src/model/ServerApp'
import {loadJSON} from '../../src/model/loadJSON'
import Page from '../../src/model/Page'
import FunctionDef from '../../src/model/FunctionDef'

const fn1 = new FunctionDef('fn1', 'Get Stuff', {input1: 'id', input2: 'length', calculation: ex`length * 2`})
const fn2 = new FunctionDef('fn2', 'Change Stuff', {input1: 'id', input2: 'length', calculation: ex`set(id, length * 2)`})

test('ServerApp has correct properties', ()=> {
    const serverApp = new ServerApp('sa1', 'ServerApp the First', {}, [fn1, fn2])

    expect(serverApp.id).toBe('sa1')
    expect(serverApp.name).toBe('ServerApp the First')
    expect(serverApp.codeName).toBe('ServerApptheFirst')
    expect(serverApp.kind).toBe('ServerApp')
    expect(serverApp.type()).toBe('app')
    expect(serverApp.elementArray().map( el => el.id )).toStrictEqual(['fn1', 'fn2'])
})

test('tests if an object is this type', ()=> {
    const serverApp = new ServerApp('sa1', 'ServerApp 1', {}, [])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ServerApp.is(serverApp)).toBe(true)
    expect(ServerApp.is(page)).toBe(false)
})

test('parent type', () => {
    const serverApp = new ServerApp('sa1', 'ServerApp 1', {}, [])
    expect(ServerApp.parentType).toBe('Project')
})

test('can contain Function Def', () => {
    const serverApp = new ServerApp('sa1', 'ServerApp 1', {}, [])
    expect(serverApp.canContain('Project')).toBe(false)
    expect(serverApp.canContain('App')).toBe(false)
    expect(serverApp.canContain('ServerApp')).toBe(false)
    expect(serverApp.canContain('Function')).toBe(true)
})

test('converts to JSON', ()=> {
    const serverApp = new ServerApp('sa1', 'ServerApp 1', {}, [fn1, fn2])

    expect(asJSON(serverApp)).toStrictEqual({
        kind: 'ServerApp',
        id: 'sa1',
        name: 'ServerApp 1',
        properties: serverApp.properties,
        elements: [asJSON(fn1), asJSON(fn2)]
    })
})

test('converts from plain object with correct types for elements', ()=> {
    const serverApp = new ServerApp('sa1', 'ServerApp the First', {}, [fn1, fn2])
    const newServerApp = loadJSON(asJSON(serverApp))
    expect(newServerApp).toStrictEqual<ServerApp>(serverApp)
})

