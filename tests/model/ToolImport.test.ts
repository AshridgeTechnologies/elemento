import {expect, test} from "vitest"
import ToolImport from '../../src/model/ToolImport'
import {asJSON} from '../testutil/testHelpers'
import {loadJSON} from '../../src/model/loadJSON'

test('ToolImport has correct properties', ()=> {
    const toolImport = new ToolImport('t1', 'test1', {source: 'https://example.com/thetool'})
    expect(toolImport.id).toBe('t1')
    expect(toolImport.name).toBe('test1')
    expect(toolImport.source).toBe('https://example.com/thetool')
})

test('can find toolImport itself by id', ()=> {
    const toolImport = new ToolImport('a1', 'test1', {})
    expect(toolImport.findElement('a1')).toBe(toolImport)
})
test('can find path of toolImport itself by id', ()=> {
    const toolImport = new ToolImport('a1', 'ToolImport 1', {})
    expect(toolImport.findElementPath('a1')).toBe('ToolImport1')
})

test.each(['Page', 'MemoryDataStore', 'FileDataStore', 'Collection', 'AppBar', 'Function', 'FunctionImport'])('can contain %s not other types', (elementType) => {
    const toolImport = new ToolImport('id1', 'ToolImport 1', {}, [])
    expect(toolImport.canContain('Text')).toBe(false)
    expect(toolImport.canContain('Page')).toBe(false)
    expect(toolImport.canContain('ToolImport')).toBe(false)
    expect(toolImport.canContain('Project')).toBe(false)
})

test('converts to JSON', ()=> {
    const toolImport = new ToolImport('a1', 'ToolImport 1', {source: 'https://example.com/aTool'})

    expect(asJSON(toolImport)).toStrictEqual({
        kind: 'ToolImport',
        id: 'a1',
        name: 'ToolImport 1',
        properties: toolImport.properties,
    })
})

test('converts from plain object', ()=> {
    const toolImport = new ToolImport('a1', 'ToolImport 1', {source: 'https://example.com/aTool'})
    const newToolImport = loadJSON(asJSON(toolImport))
    expect(newToolImport).toStrictEqual<ToolImport>(toolImport)
})
