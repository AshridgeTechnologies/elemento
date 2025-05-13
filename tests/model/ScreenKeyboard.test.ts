import {expect, test} from "vitest"
import ScreenKeyboard from '../../src/model/ScreenKeyboard'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('ScreenKeyboard has correct properties with default values', ()=> {
    const keyboard1 = new ScreenKeyboard('id1', 'ScreenKeyboard 1', {})

    expect(keyboard1.id).toBe('id1')
    expect(keyboard1.name).toBe('ScreenKeyboard 1')
    expect(keyboard1.type()).toBe('statefulUI')
    expect(keyboard1.keyAction).toBe(undefined)
    expect(keyboard1.useRealKeyboard).toBe(undefined)
    expect(keyboard1.show).toBe(undefined)
    expect(keyboard1.styles).toBe(undefined)
})

test('ScreenKeyboard has correct properties with specified values', ()=> {
    const keyboard1 = new ScreenKeyboard('id1', 'ScreenKeyboard 1', {keyAction: ex`doIt()`, useRealKeyboard: true, show: false, styles: {width: 300}})

    expect(keyboard1.id).toBe('id1')
    expect(keyboard1.name).toBe('ScreenKeyboard 1')
    expect(keyboard1.keyAction).toStrictEqual(ex`doIt()`)
    expect(keyboard1.useRealKeyboard).toBe(true)
    expect(keyboard1.show).toBe(false)
    expect(keyboard1.styles).toStrictEqual({width: 300})
})

test('tests if an object is this type', ()=> {
    const keyboard = new ScreenKeyboard('id1', 'ScreenKeyboard 1', {keyAction: ex`doIt()`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(ScreenKeyboard.is(keyboard)).toBe(true)
    expect(ScreenKeyboard.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const keyboard = new ScreenKeyboard('id1', 'ScreenKeyboard 1', {keyAction: ex`doIt()`})
    const updatedScreenKeyboard1 = keyboard.set('id1', 'name', 'ScreenKeyboard 1A')
    expect(updatedScreenKeyboard1.name).toBe('ScreenKeyboard 1A')
    expect(keyboard.name).toBe('ScreenKeyboard 1')

    const updatedScreenKeyboard2 = updatedScreenKeyboard1.set('id1', 'content', ex`shazam`)
    expect(updatedScreenKeyboard2.name).toBe('ScreenKeyboard 1A')
    expect(updatedScreenKeyboard1.name).toBe('ScreenKeyboard 1A')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const keyboard = new ScreenKeyboard('id1', 'ScreenKeyboard 1', {keyAction: ex`doIt()`})
    const updatedScreenKeyboard = keyboard.set('id2', 'name', ex`ScreenKeyboard 1A`)
    expect(updatedScreenKeyboard).toStrictEqual(keyboard)
})

test('has correct property names', () => {
    expect(new ScreenKeyboard('id1', 'ScreenKeyboard 1', {}).propertyDefs.map( ({name}) => name ))
        .toStrictEqual(['keyAction', 'useRealKeyboard', 'show', 'styles'])
})

test('converts to JSON without optional proerties', ()=> {
    const keyboard = new ScreenKeyboard('id1', 'ScreenKeyboard 1', {})
    expect(asJSON(keyboard)).toStrictEqual({
        kind: 'ScreenKeyboard',
        id: 'id1',
        name: 'ScreenKeyboard 1',
        properties: keyboard.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const keyboard = new ScreenKeyboard('id1', 'ScreenKeyboard 1', {keyAction: ex`doIt()`, show: false, styles: {width: 300}})
    expect(asJSON(keyboard)).toStrictEqual({
        kind: 'ScreenKeyboard',
        id: 'id1',
        name: 'ScreenKeyboard 1',
        properties: keyboard.properties
    })
})

test('converts from plain object', ()=> {
    const keyboard = new ScreenKeyboard('id1', 'ScreenKeyboard 1', {keyAction: ex`doIt()`,
        show: ex`false && true`, styles: {width: ex`300 + 1`}})
    const plainObj = asJSON(keyboard)
    const newScreenKeyboard = loadJSON(plainObj)
    expect(newScreenKeyboard).toStrictEqual<ScreenKeyboard>(keyboard)

    const keyboard2 = new ScreenKeyboard('id1', 'ScreenKeyboard 2', {show: false})
    const plainObj2 = asJSON(keyboard2)
    const newScreenKeyboard2 = loadJSON(plainObj2)
    expect(newScreenKeyboard2).toStrictEqual<ScreenKeyboard>(keyboard2)
})
