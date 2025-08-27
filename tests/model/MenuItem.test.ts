import {expect, test} from "vitest"
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'
import {MenuItem} from '../testutil/modelHelpers'

test('MenuItem has correct properties with default values', ()=> {
    const menuItem1: any = new MenuItem('id1', 'MenuItem 1', {})
    expect(menuItem1.id).toBe('id1')
    expect(menuItem1.name).toBe('MenuItem 1')
    expect(menuItem1.type()).toBe('statelessUI')
    expect(menuItem1.label).toBe('MenuItem 1')
    expect(menuItem1.action).toBe(undefined)
    expect(menuItem1.show).toBe(undefined)
    expect(menuItem1.styles).toBe(undefined)
})

test('MenuItem has correct properties with specified values', ()=> {
    const menuItem1: any = new MenuItem('id1', 'MenuItem 1', {label: ex`"Some menuItem"`, action: ex`doIt()`, show: false, styles: {color: 'red'}})
    expect(menuItem1.id).toBe('id1')
    expect(menuItem1.name).toBe('MenuItem 1')
    expect(menuItem1.label).toStrictEqual(ex`"Some menuItem"`)
    expect(menuItem1.action).toStrictEqual(ex`doIt()`)
    expect(menuItem1.show).toBe(false)
    expect(menuItem1.styles).toStrictEqual({color: 'red'})
})

test('has correct parent type', () => {
    expect((MenuItem as any).parentType).toBe('Menu')
})

test('tests if an object is this type', ()=> {
    const menuItem = new MenuItem('id1', 'MenuItem 1', {label: 'Some menuItem', action: ex`doIt()`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(MenuItem.is(menuItem)).toBe(true)
    expect(MenuItem.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const menuItem: any = new MenuItem('id1', 'MenuItem 1', {label: 'Some menuItem', action: ex`doIt()`})
    const updatedMenuItem1: any = menuItem.set('id1', 'name', 'MenuItem 1A')
    expect(updatedMenuItem1.name).toBe('MenuItem 1A')
    expect(updatedMenuItem1.label).toBe('Some menuItem')
    expect(menuItem.name).toBe('MenuItem 1')
    expect(menuItem.label).toBe('Some menuItem')

    const updatedMenuItem2 = updatedMenuItem1.set('id1', 'label', ex`shazam`)
    expect(updatedMenuItem2.name).toBe('MenuItem 1A')
    expect(updatedMenuItem2.label).toStrictEqual(ex`shazam`)
    expect(updatedMenuItem1.name).toBe('MenuItem 1A')
    expect(updatedMenuItem1.label).toBe('Some menuItem')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const menuItem = new MenuItem('id1', 'MenuItem 1', {label: ex`"Some menuItem"`, action: ex`doIt()`})
    const updatedMenuItem = menuItem.set('id2', 'name', ex`MenuItem 1A`)
    expect(updatedMenuItem).toStrictEqual(menuItem)
})

test('converts to JSON without optional proerties', ()=> {
    const menuItem = new MenuItem('id1', 'MenuItem 1', {label: ex`"Some menuItem"`, action: ex`doIt()`})
    expect(asJSON(menuItem)).toStrictEqual({
        kind: 'MenuItem',
        id: 'id1',
        name: 'MenuItem 1',
        properties: menuItem.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const menuItem = new MenuItem('id1', 'MenuItem 1', {label: ex`"Some menuItem"`, action: ex`doIt()`, show: false})
    expect(asJSON(menuItem)).toStrictEqual({
        kind: 'MenuItem',
        id: 'id1',
        name: 'MenuItem 1',
        properties: menuItem.properties
    })
})

test('converts from plain object', ()=> {
    const menuItem = new MenuItem('id1', 'MenuItem 1', {label: ex`"Some menuItem"`, action: ex`doIt()`, show: ex`false && true`, styles: {color: 'red'}})
    const plainObj = asJSON(menuItem)
    const newMenuItem = loadJSON(plainObj)
    expect(newMenuItem).toStrictEqual(menuItem)

    const menuItem2 = new MenuItem('id1', 'MenuItem 2', {label: `Some menuItem`, show: false})
    const plainObj2 = asJSON(menuItem2)
    const newMenuItem2 = loadJSON(plainObj2)
    expect(newMenuItem2).toStrictEqual(menuItem2)
})
