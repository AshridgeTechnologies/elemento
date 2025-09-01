import {expect, test} from "vitest"
import {File} from '../testutil/modelHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'
import Page from '../../src/model/Page'

test('File has expected properties', () => {
    const file1 = new File('id1', 'File 1', {})

    expect(file1.id).toBe('id1')
    expect(file1.name).toBe('File 1')
    expect(file1.type()).toBe('background')
    expect(file1.properties).toStrictEqual({})

})

test('tests if an object is this type', ()=> {
    const file1 = new File('id1', 'File 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(File.is(file1)).toBe(true)
    expect(File.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const file1 = new File('id1', 'File 1', {})
    const updatedFile1 = file1.set('id1', 'name', 'File 1A')
    expect(updatedFile1.name).toBe('File 1A')
    expect(file1.name).toBe('File 1')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const file1 = new File('id1', 'File 1', {})
    const updatedFile = file1.set('id2', 'name', ex`File 1A`)
    expect(updatedFile).toStrictEqual(file1)
})

test('converts to JSON', ()=> {
    const file1 = new File('id1', 'File 1', {})
    expect(asJSON(file1)).toStrictEqual({
        kind: 'File',
        id: 'id1',
        name: 'File 1',
        properties: file1.properties
    })
})

test('converts from plain object', ()=> {
    const file1 = new File('id1', 'File 1', {})
    const plainObj = asJSON(file1)
    const newFile = loadJSON(plainObj)
    expect(newFile).toStrictEqual<File>(file1)
})
