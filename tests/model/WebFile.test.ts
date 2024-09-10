import WebFile from '../../src/model/WebFile'
import Page from '../../src/model/Page'
import App from '../../src/model/App'
import Text from '../../src/model/Text'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON} from '../testutil/testHelpers'

test('WebFile has correct properties with default values', ()=> {
    const file1 = new WebFile('id1', 'WebFile 1', {})

    expect(file1.id).toBe('id1')
    expect(file1.name).toBe('WebFile 1')
    expect(file1.url).toBe(undefined)
})

test('WebFile has correct properties with given values', ()=> {
    const file1 = new WebFile('id1', 'WebFile 1', {url: 'https://example.com/data'})
    expect(file1.url).toBe('https://example.com/data')
})

test('tests if an object is this type', ()=> {
    const file = new WebFile('id1', 'WebFile 1', {url: 'https://example.com/data'})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(WebFile.is(file)).toBe(true)
    expect(WebFile.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const file = new WebFile('id1', 'WebFile 1', {url: 'https://example.com/data'})
    const updatedInFileDataFile1 = file.set('id1', 'name', 'WebFile 1A')
    expect(updatedInFileDataFile1.name).toBe('WebFile 1A')
    expect(file.name).toBe('WebFile 1')
})

test('can be contained in correct types', () => {
    const app = new App('id', 'App 1', {})
    const page = new Page('p1', 'Page 1', {})
    const text = new Text('id1', 'Text 1', {})
    expect(page.canContain('WebFile')).toBe(true)
    expect(app.canContain('WebFile')).toBe(true)
    expect(text.canContain('WebFile')).toBe(false)
})

test('converts to JSON', ()=> {
    const file = new WebFile('id1', 'WebFile 1', {url: 'https://example.com/data'})
    expect(asJSON(file)).toStrictEqual({
        kind: 'WebFile',
        id: 'id1',
        name: 'WebFile 1',
        properties: file.properties
    })
})

test('converts from plain object', ()=> {
    const file = new WebFile('id1', 'WebFile 1', {url: 'https://example.com/data'})
    const plainObj = asJSON(file)
    const newFile = loadJSON(plainObj)
    expect(newFile).toStrictEqual<WebFile>(file)
})
