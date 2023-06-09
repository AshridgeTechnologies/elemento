import Text from '../../src/model/Text'
import Layout from '../../src/model/Layout'
import {asJSON, ex} from '../testutil/testHelpers'
import TextInput from '../../src/model/TextInput'
import {loadJSON} from '../../src/model/loadJSON'
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
    expect(layout.backgroundColor).toBe(undefined)
    expect(layout.wrap).toBe(false)
    expect(layout.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
})

test('Layout has correct properties', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const layout = new Layout('lay1', 'Layout the First', {horizontal: ex`1 === 2`, width: 500, backgroundColor: 'blue', wrap: true}, [text1, text2])

    expect(layout.id).toBe('lay1')
    expect(layout.name).toBe('Layout the First')
    expect(layout.codeName).toBe('LayouttheFirst')
    expect(layout.horizontal).toStrictEqual(ex`1 === 2`)
    expect(layout.width).toBe(500)
    expect(layout.backgroundColor).toBe('blue')
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
    expect(layout.canContain('DataTypes')).toBe(false)
    expect(layout.canContain('TrueFalseType')).toBe(false)})


test('finds itself and children in a page', () => {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const innerLayout = new Layout('lay2', 'Layout 2', {}, [text2])
    const layout = new Layout('lay1', 'Layout 1', {}, [text1, innerLayout])
    const page = new Page('p1', 'Page 1', {}, [layout])

    expect(page.findElementByPath('Page1.Layout1')).toBe(layout)
    expect(page.findElementByPath('Page1.Text1')).toBe(text1)
    expect(page.findElementByPath('Page1.Text2')).toBe(text2)
})

test('converts to JSON', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const layout = new Layout('lay1', 'Layout 1', {horizontal: ex`1 == 2`, width: '50%', backgroundColor: 'green'}, [text1, text2])

    expect(asJSON(layout)).toStrictEqual({
        kind: 'Layout',
        id: 'lay1',
        name: 'Layout 1',
        properties: layout.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

    const layout2 = new Layout('lay1', 'Layout 2', {horizontal: true}, [text1, text2])

    expect(asJSON(layout2)).toStrictEqual({
        kind: 'Layout',
        id: 'lay1',
        name: 'Layout 2',
        properties: layout2.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

})

test('converts from plain object with correct types for elements', ()=> {
    let text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let textInput = new TextInput('t2', 'Text Input 2', {initialValue: ex`"Input text"`, width: ex`7`})
    const layout = new Layout('lay1', 'Layout 1', {horizontal: ex`false`}, [text, textInput])
    const newLayout = loadJSON(asJSON(layout))
    expect(newLayout).toStrictEqual<Layout>(layout)
    const layout2 = new Layout('lay1', 'Layout 2', {horizontal: true}, [text, textInput])
    const newLayout2 = loadJSON(asJSON(layout2))
    expect(newLayout2).toStrictEqual<Layout>(layout2)
})
