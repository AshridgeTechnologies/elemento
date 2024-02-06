import Text from '../../src/model/Text'
import {asJSON, ex} from '../testutil/testHelpers'
import List from '../../src/model/List'
import TextInput from '../../src/model/TextInput'
import {loadJSON} from '../../src/model/loadJSON'
import Page from '../../src/model/Page'

test('List has correct properties', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const list = new List('l1', 'List the First', {items: [{a:10}, {b: 20}], show: false, styles: {color: ex`blue`}, selectable: true,
        selectAction: ex`Log(\$item.id)`, selectedItem: 10}, [text1, text2])

    expect(list.id).toBe('l1')
    expect(list.name).toBe('List the First')
    expect(list.codeName).toBe('ListtheFirst')
    expect(list.items).toStrictEqual([{a:10}, {b: 20}])
    expect(list.selectedItem).toBe(10)
    expect(list.selectable).toBe(true)
    expect(list.show).toBe(false)
    expect(list.styles).toStrictEqual({color: ex`blue`})
    expect(list.selectAction).toStrictEqual(ex`Log(\$item.id)`)
    expect(list.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
})

test('has correct property names', () => {
    expect(new List('l1', 'List 1', {items: []}, []).propertyDefs.map( ({name}) => name )).toStrictEqual([
        'items', 'selectedItem', 'selectable', 'selectAction', 'show', 'styles'])
})


test('tests if an object is this type', ()=> {
    const list = new List('l1', 'List 1', {items: []}, [])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(List.is(list)).toBe(true)
    expect(List.is(page)).toBe(false)
})

test('can contain types apart from Project, App, Page, DataStore', () => {
    const list = new List('l1', 'List 1', {items: []}, [])
    expect(list.canContain('Project')).toBe(false)
    expect(list.canContain('App')).toBe(false)
    expect(list.canContain('Page')).toBe(false)
    expect(list.canContain('MemoryDataStore')).toBe(false)
    expect(list.canContain('Text')).toBe(true)
    expect(list.canContain('Button')).toBe(true)
    expect(list.canContain('Function')).toBe(true)
    expect(list.canContain('DataTypes')).toBe(false)
    expect(list.canContain('TextType')).toBe(false)
})

test('converts to JSON', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const list = new List('l1', 'List 1', {items: [{a: 10}], styles: {color: ex`blue`}}, [text1, text2])

    expect(asJSON(list)).toStrictEqual({
        kind: 'List',
        id: 'l1',
        name: 'List 1',
        properties: list.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })
})

test('converts from plain object with correct types for elements', ()=> {
    let text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let textInput = new TextInput('t2', 'Text Input 2', {initialValue: ex`"Input text"`, styles: {width: ex`7`}})
    const list = new List('p1', 'List 1', {items: [{a: 10}], styles: {color: ex`blue`}, selectAction: ex`Log(\$item.id)`}, [text, textInput])
    const newList = loadJSON(asJSON(list))
    expect(newList).toStrictEqual<List>(list)
})

