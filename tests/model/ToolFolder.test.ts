import ToolFolder from '../../src/model/ToolFolder'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'
import Page from '../../src/model/Page'

test('ToolFolder has expected properties', () => {
    const folder1 = new ToolFolder('id1', 'Folder 1', {})

    expect(folder1.id).toBe('id1')
    expect(folder1.name).toBe('Folder 1')
    expect(folder1.type()).toBe('background')
    expect(folder1.properties).toStrictEqual({})
})

test('tests if an object is this type', ()=> {
    const folder1 = new ToolFolder('id1', 'Folder 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ToolFolder.is(folder1)).toBe(true)
    expect(ToolFolder.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const folder1 = new ToolFolder('id1', 'Folder 1', {})
    const updatedFolder1 = folder1.set('id1', 'name', 'Folder 1A')
    expect(updatedFolder1.name).toBe('Folder 1A')
    expect(folder1.name).toBe('Folder 1')
})

test('can contain only File', () => {
    const folder1 = new ToolFolder('id1', 'Folder 1', {})
    expect(folder1.canContain('Project')).toBe(false)
    expect(folder1.canContain('App')).toBe(false)
    expect(folder1.canContain('Page')).toBe(false)
    expect(folder1.canContain('ToolFolder')).toBe(false)  // may change in the future
    expect(folder1.canContain('Tool')).toBe(true)
})

test('converts to JSON', ()=> {
    const folder1 = new ToolFolder('id1', 'Folder 1', {})
    expect(asJSON(folder1)).toStrictEqual({
        kind: 'ToolFolder',
        id: 'id1',
        name: 'Folder 1',
        properties: folder1.properties
    })
})

test('converts from plain object', ()=> {
    const folder1 = new ToolFolder('id1', 'Folder 1', {})
    const plainObj = asJSON(folder1)
    const newFile = loadJSON(plainObj)
    expect(newFile).toStrictEqual<ToolFolder>(folder1)
})