import Text from '../../src/model/Text'
import Layout from '../../src/model/Layout'
import {asJSON, ex} from '../testutil/testHelpers'
import TextInput from '../../src/model/TextInput'
import {loadJSON} from '../../src/model/loadJSON'
import NumberInput from '../../src/model/NumberInput'
import Page from '../../src/model/Page'

test('Layout has correct defaults', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const layout = new Layout('lay1', 'Layout the First', {}, [text1, text2])

    expect(layout.id).toBe('lay1')
    expect(layout.name).toBe('Layout the First')
    expect(layout.codeName).toBe('LayouttheFirst')
    expect(layout.horizontal).toBe(false)
    expect(layout.width).toBe(undefined)
    expect(layout.wrap).toBe(false)
    expect(layout.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
})

test('Layout has correct properties', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const layout = new Layout('lay1', 'Layout the First', {horizontal: ex`1 === 2`, width: 500, wrap: true}, [text1, text2])

    expect(layout.id).toBe('lay1')
    expect(layout.name).toBe('Layout the First')
    expect(layout.codeName).toBe('LayouttheFirst')
    expect(layout.horizontal).toStrictEqual(ex`1 === 2`)
    expect(layout.width).toBe(500)
    expect(layout.wrap).toBe(true)
    expect(layout.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
})

test('tests if an object is this type', ()=> {
    const layout = new Layout('l1', 'Layout 1', {}, [])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Layout.is(layout)).toBe(true)
    expect(Layout.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"Some text"`})
    const layout = new Layout('lay1', 'Layout 1', {horizontal: true}, [text1])
    const updatedLayout1 = layout.set('lay1', 'name', 'Layout 1A')
    expect(updatedLayout1.name).toBe('Layout 1A')
    expect(updatedLayout1.elements).toBe(layout.elements)
    expect(updatedLayout1.horizontal).toBe(true)
    expect(layout.name).toBe('Layout 1')

    const updatedLayout2 = updatedLayout1.set('lay1', 'elements', [text1, text2])
    expect(updatedLayout2.name).toBe('Layout 1A')
    expect(updatedLayout2.elements).toStrictEqual([text1, text2])
    expect(updatedLayout1.name).toBe('Layout 1A')
    expect(updatedLayout1.elements).toStrictEqual([text1])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const layout1 = new Layout('lay1', 'Layout 1', {}, [text1])
    const updatedLayout = layout1.set('x1', 'name', 'Layout 1A')
    expect(updatedLayout).toBe(layout1)
})

test('creates an updated object if a property in a contained object is changed and keeps unchanged objects', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const layout = new Layout('lay1', 'Layout 1', {}, [text1, text2])
    const updatedLayout1 = layout.set('t2', 'content', '"Further text"')
    expect(updatedLayout1.name).toBe('Layout 1')
    expect(updatedLayout1.elementArray().length).toBe(2)
    expect(updatedLayout1.elementArray()[0]).toBe(text1)
    expect(updatedLayout1.elementArray()[1]).toStrictEqual(text2.set('t2', 'content', '"Further text"'))
    expect(layout.elements).toStrictEqual([text1, text2])
})

test('creates an updated object on insert at start of elements and keeps unchanged objects', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const layout = new Layout('lay1', 'Layout 1', {}, [text1, text2])
    const [updatedLayout] = layout.doInsert('before', 't1', 'Text', 5)
    expect(updatedLayout.name).toBe('Layout 1')
    expect(updatedLayout.elementArray().length).toBe(3)
    expect(updatedLayout.elementArray()[0].name).toBe('Text 5')
    expect(updatedLayout.elementArray()[1]).toBe(text1)
    expect(updatedLayout.elementArray()[2]).toBe(text2)
})

test('creates an updated object on insert at end of elements and keeps unchanged objects', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const layout = new Layout('lay1', 'Layout 1', {}, [text1, text2])
    const [updatedLayout] = layout.doInsert('after', 't2', 'Text', 5)
    expect(updatedLayout.name).toBe('Layout 1')
    expect(updatedLayout.elementArray().length).toBe(3)
    expect(updatedLayout.elementArray()[0]).toBe(text1)
    expect(updatedLayout.elementArray()[1]).toBe(text2)
    expect(updatedLayout.elementArray()[2].name).toBe('Text 5')
})

test('creates an updated object on insert inside and keeps unchanged objects', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const layout = new Layout('lay1', 'Layout 1', {}, [text1, text2])
    const [updatedLayout] = layout.doInsert('inside', 'lay1', 'Text', 2)
    expect(updatedLayout.name).toBe('Layout 1')
    expect(updatedLayout.elementArray().length).toBe(3)
    expect(updatedLayout.elementArray()[0]).toBe(text1)
    expect(updatedLayout.elementArray()[1]).toBe(text2)
    expect(updatedLayout.elementArray()[2].name).toBe('Text 2')
})

test('ignores the insert and returns itself if the id is not matched', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const layout1 = new Layout('lay1', 'Layout 1', {}, [text1])
    const [updatedLayout] = layout1.doInsert('after', 'x1', 'Text')
    expect(updatedLayout).toBe(layout1)
})



test('can contain types apart from Project, App, Page', () => {
    const layout = new Layout('lay1', 'Layout 1', {}, [])
    expect(layout.canContain('Project')).toBe(false)
    expect(layout.canContain('App')).toBe(false)
    expect(layout.canContain('Page')).toBe(false)
    expect(layout.canContain('Layout')).toBe(true)
    expect(layout.canContain('MemoryDataStore')).toBe(false)
    expect(layout.canContain('FileDataStore')).toBe(false)
    expect(layout.canContain('Text')).toBe(true)
    expect(layout.canContain('Button')).toBe(true)
})

test('converts to JSON', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const layout = new Layout('lay1', 'Layout 1', {horizontal: ex`1 == 2`, width: '50%'}, [text1, text2])

    expect(asJSON(layout)).toStrictEqual({
        kind: 'Layout',
        componentType: 'statefulUI',
        id: 'lay1',
        name: 'Layout 1',
        properties: layout.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

    const layout2 = new Layout('lay1', 'Layout 2', {horizontal: true}, [text1, text2])

    expect(asJSON(layout2)).toStrictEqual({
        kind: 'Layout',
        componentType: 'statefulUI',
        id: 'lay1',
        name: 'Layout 2',
        properties: layout2.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

})

test('converts from plain object with correct types for elements', ()=> {
    let text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let textInput = new TextInput('t2', 'Text Input 2', {initialValue: ex`"Input text"`, maxLength: ex`7`})
    const layout = new Layout('lay1', 'Layout 1', {horizontal: ex`false`}, [text, textInput])
    const newLayout = loadJSON(asJSON(layout))
    expect(newLayout).toStrictEqual<Layout>(layout)
    const layout2 = new Layout('lay1', 'Layout 2', {horizontal: true}, [text, textInput])
    const newLayout2 = loadJSON(asJSON(layout2))
    expect(newLayout2).toStrictEqual<Layout>(layout2)
})
