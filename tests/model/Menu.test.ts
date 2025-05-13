import {expect, test} from "vitest"
import Menu from '../../src/model/Menu'
import MenuItem from '../../src/model/MenuItem'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

const item1 = new MenuItem('it1', 'Item 1', {label: 'One'})
const item2 = new MenuItem('it2', 'Item 2', {label: 'Two'})

test('Menu has correct properties with default values', ()=> {
    const menu1 = new Menu('id1', 'Menu 1', {}, [item1, item2])

    expect(menu1.id).toBe('id1')
    expect(menu1.name).toBe('Menu 1')
    expect(menu1.type()).toBe('statelessUI')
    expect(menu1.label).toBe('Menu 1')
    expect(menu1.iconName).toBe(undefined)
    expect(menu1.filled).toBe(undefined)
    expect(menu1.elementArray().map( el => el.id )).toStrictEqual(['it1', 'it2'])
})

test('Menu has correct properties with specified values', ()=> {
    const menu1 = new Menu('id1', 'Menu 1', {label: ex`"Some menu"`, iconName: 'nice', filled: true, show: false, styles: {color: 'red'}, buttonStyles: {color: 'blue'}}, [item1, item2])

    expect(menu1.id).toBe('id1')
    expect(menu1.name).toBe('Menu 1')
    expect(menu1.label).toStrictEqual(ex`"Some menu"`)
    expect(menu1.iconName).toStrictEqual('nice')
    expect(menu1.filled).toBe(true)
    expect(menu1.show).toBe(false)
    expect(menu1.styles).toStrictEqual({color: 'red'})
    expect(menu1.buttonStyles).toStrictEqual({color: 'blue'})
})

test('tests if an object is this type', ()=> {
    const menu = new Menu('id1', 'Menu 1', {label: 'Some menu'}, [item1, item2])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Menu.is(menu)).toBe(true)
    expect(Menu.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const menu = new Menu('id1', 'Menu 1', {label: 'Some menu'}, [item1])
    const updatedMenu1 = menu.set('id1', 'name', 'Menu 1A')
    expect(updatedMenu1.name).toBe('Menu 1A')
    expect(updatedMenu1.label).toBe('Some menu')
    expect(menu.name).toBe('Menu 1')
    expect(menu.label).toBe('Some menu')

    const updatedMenu2 = updatedMenu1.set('id1', 'elements', [item1, item2])
    expect(updatedMenu2.name).toBe('Menu 1A')
    expect(updatedMenu2.elements).toStrictEqual([item1, item2])
    expect(updatedMenu1.name).toBe('Menu 1A')
    expect(updatedMenu1.elements).toStrictEqual([item1])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const menu = new Menu('id1', 'Menu 1', {label: ex`"Some menu"`}, [item1, item2])
    const updatedMenu = menu.set('id2', 'name', ex`Menu 1A`)
    expect(updatedMenu).toStrictEqual(menu)
})

test('can contain only MenuItem', () => {
    const menu = new Menu('m1', 'Menu 1', {}, [item1, item2])
    expect(menu.canContain('Project')).toBe(false)
    expect(menu.canContain('App')).toBe(false)
    expect(menu.canContain('Page')).toBe(false)
    expect(menu.canContain('Menu')).toBe(false)
    expect(menu.canContain('MenuItem')).toBe(true)
    expect(menu.canContain('Text')).toBe(false)
    expect(menu.canContain('Button')).toBe(false)
})

test('converts to JSON without optional properties', ()=> {
    const menu = new Menu('id1', 'Menu 1', {label: ex`"Some menu"`}, [item1, item2])
    expect(asJSON(menu)).toStrictEqual({
        kind: 'Menu',
        id: 'id1',
        name: 'Menu 1',
        properties: menu.properties,
        elements: [asJSON(item1), asJSON(item2)]
    })
})

test('converts to JSON with optional properties', ()=> {
    const menu = new Menu('id1', 'Menu 1', {label: ex`"Some menu"`, iconName: 'some_icon', show: false, styles: {color: 'red'}, buttonStyles: {color: 'blue'}}, [item1, item2])
    expect(asJSON(menu)).toStrictEqual({
        kind: 'Menu',
        id: 'id1',
        name: 'Menu 1',
        properties: menu.properties,
        elements: [asJSON(item1), asJSON(item2)]
    })
})

test('converts from plain object', ()=> {
    const menu = new Menu('id1', 'Menu 1', {label: ex`"Some menu"`, show: false, styles: {color: 'red'}}, [item1, item2])
    const plainObj = asJSON(menu)
    const newMenu = loadJSON(plainObj)
    expect(newMenu).toStrictEqual<Menu>(menu)

    const menu2 = new Menu('id1', 'Menu 2', {label: `Some menu`}, [item1, item2])
    const plainObj2 = asJSON(menu2)
    const newMenu2 = loadJSON(plainObj2)
    expect(newMenu2).toStrictEqual<Menu>(menu2)
})
