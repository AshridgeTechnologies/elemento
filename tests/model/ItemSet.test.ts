import {expect, test} from "vitest"
import {asAny, asJSON, ex} from '../testutil/testHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import Page from '../../src/model/Page'
import {ItemSet, Text, TextInput} from '../testutil/modelHelpers'

test('ItemSet has correct default properties', ()=> {
    const itemSet = new ItemSet('l1', 'ItemSet the First', {}, [])
    const itemSet_ = asAny(itemSet)
    expect(itemSet.id).toBe('l1')
    expect(itemSet.name).toBe('ItemSet the First')
    expect(itemSet.codeName).toBe('ItemSettheFirst')
    expect(itemSet_.items).toBe(undefined)
    expect(itemSet_.selectedItems).toBe(undefined)
    expect(itemSet_.selectable).toBe(undefined)
    expect(itemSet_.canDragItem).toBe(undefined)
    expect(itemSet_.itemStyles).toBe(undefined)
    expect(itemSet_.selectAction).toBe(undefined)
    expect(itemSet.elementArray()).toStrictEqual([])
})

test('ItemSet has correct properties', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const itemSet = new ItemSet('l1', 'ItemSet the First', {items: [{a:10}, {b: 20}], canDragItem: ex`1 === 2`, itemStyles: {color: ex`blue`}, selectable: 'none',
        selectAction: ex`Log(\$item.id)`, selectedItems: 10}, [text1, text2])
    const itemSet_ = asAny(itemSet)

    expect(itemSet.id).toBe('l1')
    expect(itemSet.name).toBe('ItemSet the First')
    expect(itemSet.codeName).toBe('ItemSettheFirst')
    expect(itemSet_.items).toStrictEqual([{a:10}, {b: 20}])
    expect(itemSet_.selectedItems).toBe(10)
    expect(itemSet_.selectable).toBe('none')
    expect(itemSet_.canDragItem).toStrictEqual(ex`1 === 2`)
    expect(itemSet_.itemStyles).toStrictEqual({color: ex`blue`})
    expect(itemSet_.selectAction).toStrictEqual(ex`Log(\$item.id)`)
    expect(itemSet_.elementArray().map( (el: Element) => el.id )).toStrictEqual(['t1', 't2'])
})

test('has correct property names and options', () => {
    expect(new ItemSet('l1', 'ItemSet 1', {items: []}, []).propertyDefs.map( (def: any) => def.name )).toStrictEqual([
        'items', 'selectedItems', 'selectable', 'selectAction', 'canDragItem', 'itemStyles'])
    expect(new ItemSet('l1', 'ItemSet 1', {items: []}, []).propertyDefs.map( ({state}) => state )).toStrictEqual([
        true, true, true, true, undefined, undefined])
})

test('tests if an object is this type', ()=> {
    const itemSet = new ItemSet('l1', 'ItemSet 1', {items: []}, [])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ItemSet.is(itemSet)).toBe(true)
    expect(ItemSet.is(page)).toBe(false)
})

test('can contain types apart from Project, App, Page, DataStore', () => {
    const itemSet = new ItemSet('l1', 'ItemSet 1', {items: []}, [])
    expect(itemSet.canContain('Project')).toBe(false)
    expect(itemSet.canContain('App')).toBe(false)
    expect(itemSet.canContain('Page')).toBe(false)
    expect(itemSet.canContain('MemoryDataStore')).toBe(false)
    expect(itemSet.canContain('Text')).toBe(true)
    expect(itemSet.canContain('Button')).toBe(true)
    expect(itemSet.canContain('Function')).toBe(true)
    expect(itemSet.canContain('DataTypes')).toBe(false)
    expect(itemSet.canContain('TextType')).toBe(false)
})

test('converts to JSON', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const itemSet = new ItemSet('l1', 'ItemSet 1', {items: [{a: 10}], canDragItem: ex`1 === 2`, itemStyles: {color: ex`blue`}}, [text1, text2])

    expect(asJSON(itemSet)).toStrictEqual({
        kind: 'ItemSet',
        id: 'l1',
        name: 'ItemSet 1',
        properties: itemSet.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })
})

test('converts from plain object with correct types for elements', ()=> {
    let text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let textInput = new TextInput('t2', 'Text Input 2', {initialValue: ex`"Input text"`, styles: {width: ex`7`}})
    const itemSet = new ItemSet('p1', 'ItemSet 1', {items: {expr: `[{a: 10}]`}, itemStyles: {backgroundColor: ex`blue`}, selectAction: ex`Log(\$item.id)`}, [text, textInput])
    const loadedItemSet = loadJSON(asJSON(itemSet))
    expect(loadedItemSet).toEqual(itemSet)
})

