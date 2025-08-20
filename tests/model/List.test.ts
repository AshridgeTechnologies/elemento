import {expect, test} from "vitest"
import {asJSON, ex} from '../testutil/testHelpers'
import List from '../../src/model/List'
import {loadJSON} from '../../src/model/loadJSON'
import Page from '../../src/model/Page'
import {newText, newTextInput} from '../testutil/modelHelpers'

test('List has correct properties', ()=> {
    let text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = newText('t2', 'Text 2', {content: ex`"More text"`})
    const list = new List('l1', 'List the First', {show: false, styles: {color: ex`blue`}}, [text1, text2])

    expect(list.id).toBe('l1')
    expect(list.name).toBe('List the First')
    expect(list.codeName).toBe('ListtheFirst')
    expect(list.show).toBe(false)
    expect(list.styles).toStrictEqual({color: ex`blue`})
    expect(list.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
})

test('has correct property names', () => {
    expect(new List('l1', 'List 1', {items: []}, []).propertyDefs.map( ({name}) => name )).toStrictEqual(['show', 'styles'])
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
    expect(list.canContain('Function')).toBe(false)
    expect(list.canContain('DataTypes')).toBe(false)
    expect(list.canContain('TextType')).toBe(false)
})

test('converts to JSON', ()=> {
    let text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = newText('t2', 'Text 2', {content: ex`"More text"`})
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
    let text = newText('t1', 'Text 1', {content: ex`"Some text"`})
    let textInput = newTextInput('t2', 'Text Input 2', {initialValue: ex`"Input text"`, styles: {width: ex`7`}})
    const list = new List('p1', 'List 1', {items: [{a: 10}], styles: {color: ex`blue`}, selectAction: ex`Log(\$item.id)`}, [text, textInput])
    const newList = loadJSON(asJSON(list))
    expect(newList).toStrictEqual<List>(list)
})

