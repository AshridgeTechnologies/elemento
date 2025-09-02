import {expect, test} from "vitest"
import {Frame} from '../testutil/modelHelpers'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('Frame has correct properties with default values', ()=> {
    const frame1 = new Frame('fr1', 'Frame 1', {})

    expect(frame1.id).toBe('fr1')
    expect(frame1.name).toBe('Frame 1')
    expect(frame1.kind).toBe('Frame')
    expect(frame1.source).toBe(undefined)
    expect(frame1.show).toBe(undefined)
    expect(frame1.styles).toBe(undefined)
    expect(frame1.type()).toBe('statelessUI')
})

test('Frame has correct properties with specified values', ()=> {
    const frame1 = new Frame('fr1', 'Frame 1', {
        source: 'http://example.com/img1.jpg',
        show: ex`1 && 2`,
        styles: {width: 100, height: 200, marginBottom: 20}, })

    expect(frame1.id).toBe('fr1')
    expect(frame1.name).toBe('Frame 1')
    expect(frame1.source).toStrictEqual('http://example.com/img1.jpg')
    expect(frame1.show).toStrictEqual(ex`1 && 2`)
    expect(frame1.styles).toStrictEqual({width: 100, height: 200, marginBottom: 20})
})

test('has correct property names', () => {
    expect(new Frame('fr1', 'Frame 1', {}).propertyDefs.map( (def: any) => def.name )).toStrictEqual(['source', 'show', 'styles'])
})

test('tests if an object is this type', ()=> {
    const frame = new Frame('fr1', 'Frame 1', {source: ex`Some_frame`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Frame.is(frame)).toBe(true)
    expect(Frame.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const frame = new Frame('fr1', 'Frame 1', {source: 'http://example.com/img1.jpg'})
    const updatedFrame1 = frame.set('fr1', 'name', 'Frame 1A')
    expect(updatedFrame1.name).toBe('Frame 1A')
    expect(updatedFrame1.source).toBe('http://example.com/img1.jpg')
    expect(frame.name).toBe('Frame 1')
    expect(frame.source).toBe('http://example.com/img1.jpg')

    const updatedFrame2 = updatedFrame1.set('fr1', 'source', ex`shazam`)
    expect(updatedFrame2.name).toBe('Frame 1A')
    expect(updatedFrame2.source).toStrictEqual(ex`shazam`)
    expect(updatedFrame1.name).toBe('Frame 1A')
    expect(updatedFrame1.source).toStrictEqual('http://example.com/img1.jpg')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const frame = new Frame('fr1', 'Frame 1', {source: ex`Some_frame`})
    const updatedFrame = frame.set('x1', 'name', ex`Frame 1A`)
    expect(updatedFrame).toStrictEqual(frame)
})

test('converts to JSON without optional proerties', ()=> {
    const frame = new Frame('fr1', 'Frame 1', {source: ex`Some_frame`})
    expect(asJSON(frame)).toStrictEqual({
        kind: 'Frame',
        id: 'fr1',
        name: 'Frame 1',
        properties: frame.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const frame = new Frame('fr1', 'Frame 1', {show: true,
        source: 'http://example.com/img1.jpg',
        styles: {width: 100, height: 200, marginBottom: 20}})
    expect(asJSON(frame)).toStrictEqual({
        kind: 'Frame',
        id: 'fr1',
        name: 'Frame 1',
        properties: frame.properties
    })
})

test('converts from plain object', ()=> {
    const frame = new Frame('fr1', 'Frame 1', {source: ex`Some_frame`})
    const plainObj = asJSON(frame)
    const newFrame = loadJSON(plainObj)
    expect(newFrame).toStrictEqual<typeof Frame>(frame)

    const frame2 = new Frame('fr1', 'Frame 2', {show: false,
        source: 'http://example.com/img1.jpg',
        styles: {width: 100, height: 200, marginBottom: 20}})
    const plainObj2 = asJSON(frame2)
    const newFrame2 = loadJSON(plainObj2)
    expect(newFrame2).toStrictEqual<typeof Frame>(frame2)
})

test('cannot contain other elements', () => {
    const frame = new Frame('fr1', 'Frame 1', {source: `Some_frame`})
    expect(frame.canContain('Text')).toBe(false)
})
