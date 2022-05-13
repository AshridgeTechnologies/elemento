import Button from '../../src/model/Button'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('Button has correct properties with default values', ()=> {
    const button1 = new Button('id1', 'Button 1', {})

    expect(button1.id).toBe('id1')
    expect(button1.name).toBe('Button 1')
    expect(button1.componentType).toBe('statelessUI')
    expect(button1.content).toBe('Button 1')
    expect(button1.action).toBe(undefined)
    expect(button1.style).toBe(undefined)
    expect(button1.display).toBe(true)
})

test('Button has correct properties with specified values', ()=> {
    const button1 = new Button('id1', 'Button 1', {content: ex`"Some button"`, action: ex`doIt()`, style: 'cool', display: false})

    expect(button1.id).toBe('id1')
    expect(button1.name).toBe('Button 1')
    expect(button1.content).toStrictEqual(ex`"Some button"`)
    expect(button1.action).toStrictEqual(ex`doIt()`)
    expect(button1.style).toBe('cool')
    expect(button1.display).toBe(false)
})

test('tests if an object is this type', ()=> {
    const button = new Button('id1', 'Button 1', {content: 'Some button', action: ex`doIt()`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Button.is(button)).toBe(true)
    expect(Button.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const button = new Button('id1', 'Button 1', {content: 'Some button', action: ex`doIt()`})
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

test('converts to JSON without optional proerties', ()=> {
    const button = new Button('id1', 'Button 1', {content: ex`"Some button"`, action: ex`doIt()`})
    expect(asJSON(button)).toStrictEqual({
        kind: 'Button',
        componentType: 'statelessUI',
        id: 'id1',
        name: 'Button 1',
        properties: button.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const button = new Button('id1', 'Button 1', {content: ex`"Some button"`, action: ex`doIt()`, style:'cool', display: false})
    expect(asJSON(button)).toStrictEqual({
        kind: 'Button',
        componentType: 'statelessUI',
        id: 'id1',
        name: 'Button 1',
        properties: button.properties
    })
})

test('converts from plain object', ()=> {
    const button = new Button('id1', 'Button 1', {content: ex`"Some button"`, action: ex`doIt()`, style: ex`red`, display: ex`false && true`})
    const plainObj = asJSON(button)
    const newButton = loadJSON(plainObj)
    expect(newButton).toStrictEqual<Button>(button)

    const button2 = new Button('id1', 'Button 2', {content: `Some button`, style: `red`, display: false})
    const plainObj2 = asJSON(button2)
    const newButton2 = loadJSON(plainObj2)
    expect(newButton2).toStrictEqual<Button>(button2)
})
