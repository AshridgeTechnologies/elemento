import {expect, test} from "vitest"
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'
import {Button} from '../testutil/modelHelpers'

test('Button has correct properties with default values', ()=> {
    const button1: any = new Button('id1', 'Button 1', {})

    expect(button1.id).toBe('id1')
    expect(button1.name).toBe('Button 1')
    expect(button1.type()).toBe('statelessUI')
    expect(button1.content).toBe('Button 1')
    expect(button1.iconName).toBe(undefined)
    expect(button1.action).toBe(undefined)
    expect(button1.appearance).toBe('outline')
    expect(button1.show).toBe(undefined)
    expect(button1.enabled).toBe(undefined)
    expect(button1.styles).toBe(undefined)
})

test('Button has correct properties with specified values', ()=> {
    const button1: any = new Button('id1', 'Button 1', {content: ex`"Some button"`, iconName: 'delete', action: ex`doIt()`, appearance: 'filled', show: false, enabled: true, styles: {width: 300}})

    expect(button1.id).toBe('id1')
    expect(button1.name).toBe('Button 1')
    expect(button1.content).toStrictEqual(ex`"Some button"`)
    expect(button1.iconName).toBe('delete')
    expect(button1.action).toStrictEqual(ex`doIt()`)
    expect(button1.appearance).toBe('filled')
    expect(button1.show).toBe(false)
    expect(button1.enabled).toBe(true)
    expect(button1.styles).toStrictEqual({width: 300})
})

test('tests if an object is this type', ()=> {
    const button = new Button('id1', 'Button 1', {content: 'Some button', action: ex`doIt()`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Button.is(button)).toBe(true)
    expect(Button.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const button: any = new Button('id1', 'Button 1', {content: 'Some button', action: ex`doIt()`})
    const updatedButton1 = button.set('id1', 'name', 'Button 1A')
    expect(updatedButton1.name).toBe('Button 1A')
    expect(updatedButton1.content).toBe('Some button')
    expect(button.name).toBe('Button 1')
    expect(button.content).toBe('Some button')

    const updatedButton2 = updatedButton1.set('id1', 'content', ex`shazam`)
    expect(updatedButton2.name).toBe('Button 1A')
    expect(updatedButton2.content).toStrictEqual(ex`shazam`)
    expect(updatedButton1.name).toBe('Button 1A')
    expect(updatedButton1.content).toBe('Some button')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const button = new Button('id1', 'Button 1', {content: ex`"Some button"`, action: ex`doIt()`})
    const updatedButton = button.set('id2', 'name', ex`Button 1A`)
    expect(updatedButton).toStrictEqual(button)
})

test('has correct property names', () => {
    expect(new Button('id1', 'Button 1', {content: 'Some button'}).propertyDefs.map( ({name}) => name ))
        .toStrictEqual(['content', 'iconName', 'appearance', 'enabled', 'action', 'show', 'styles'])
})

test('converts to JSON without optional properties', ()=> {
    const button = new Button('id1', 'Button 1', {content: ex`"Some button"`, action: ex`doIt()`})
    expect(asJSON(button)).toStrictEqual({
        kind: 'Button',
        id: 'id1',
        name: 'Button 1',
        properties: button.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const button = new Button('id1', 'Button 1', {content: ex`"Some button"`, iconName: 'send', action: ex`doIt()`, appearance: 'link', show: false, enabled: false, styles: {width: 300}})
    expect(asJSON(button)).toStrictEqual({
        kind: 'Button',
        id: 'id1',
        name: 'Button 1',
        properties: button.properties
    })
})

test('converts from plain object', ()=> {
    const button = new Button('id1', 'Button 1', {content: ex`"Some button"`, action: ex`doIt()`, appearance: 'outline',
        show: ex`false && true`, enabled: ex`1 == 1`, styles: {width: ex`300 + 1`}})
    const plainObj = asJSON(button)
    const newButton = loadJSON(plainObj)
    expect(newButton).toStrictEqual(button)

    const button2 = new Button('id1', 'Button 2', {content: `Some button`, show: false, enabled: false})
    const plainObj2 = asJSON(button2)
    const newButton2 = loadJSON(plainObj2)
    expect(newButton2).toStrictEqual(button2)
})
