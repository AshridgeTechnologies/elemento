import {valueObj} from '../testutil/testHelpers'
import {asArray, indexedPath, lastItemIdOfPath, parentPath, valueOf} from '../../src/runtime/runtimeFunctions'
import BigNumber from 'bignumber.js'
import {sxProps} from '../../src/runtime/components/ComponentHelpers'

test('gets correct valueOf for date, object, primitive, decimal', () => {
    expect(valueOf(valueObj(42))).toBe(42)
    const date = new Date(2022, 6, 1)
    expect(valueOf(date)).toBe(date)
    const decimal = new BigNumber('123.45')
    expect(valueOf(decimal)).toBe(decimal)
    expect(valueOf('Hi!')).toBe('Hi!')
})

test('gets valueOf recursively for plain objects', () => {
    const date = new Date()
    const objectValue = {
        a: valueObj(10),
        b: valueObj('Bee'),
        c: {
            p: valueObj(true),
            q: {
                d: valueObj(date)
            }
        }
    }

    expect(valueOf(objectValue)).toStrictEqual({a: 10, b: 'Bee', c: {p: true, q: {d: date}}})
})

test('gets array as is', () => {
    const array = [{a:10}, {a: 20}]
    expect(asArray(array)).toStrictEqual([{a: 10}, {a: 20}])
})

test('gets other value as single element array', () => {
    const other = 'green'
    expect(asArray(other)).toStrictEqual(['green'])
})

test('gets null or undefined as an empty array', () => {
    expect(asArray(undefined)).toStrictEqual([])
    expect(asArray(null)).toStrictEqual([])
})

test('parentPath finds parent path', () => {
    expect(parentPath('app.thing.widget')).toBe('app.thing')
})

test('parentPath finds parent path above index at end', () => {
    expect(parentPath('app.mainpage.foolist.#4')).toBe('app.mainpage')
    expect(parentPath('app.mainpage.foolist.#id2')).toBe('app.mainpage')
})

test('parentPath finds parent path above index at end with nested indexes', () => {
    expect(parentPath('app.mainpage.toplist.#3.foolist.#4')).toBe('app.mainpage.toplist.#3')
    expect(parentPath('app.mainpage.toplist.#id3.foolist.#id4')).toBe('app.mainpage.toplist.#id3')
    expect(parentPath('app.mainpage.toplist.#id3.foolist.#id4.barlist.#id5')).toBe('app.mainpage.toplist.#id3.foolist.#id4')
})

test('indexedPath creates indexed path', () => {
    expect(indexedPath('app.thing.widget', 3)).toBe('app.thing.widget.#3')
})

test('lastItemIdOfPath gets last item id for number and string', () => {
    expect(lastItemIdOfPath('app.thing.widget.#3')).toBe('3')
    expect(lastItemIdOfPath('app.thing.widget.#id3')).toBe('id3')
    expect(lastItemIdOfPath('app.thing.widget.#3.foolist.#id3')).toBe('id3')
    expect(lastItemIdOfPath('app.thing.widget.#3.theText')).toBe('3')
    expect(lastItemIdOfPath('app.thing.widget.#id3.theText')).toBe('id3')
    expect(lastItemIdOfPath('app.thing.widget.#3.foolist.#id3.theText')).toBe('id3')
})

test('sxProps adds default units to appropriate numeric values', () => {
    expect(sxProps({scale: 2, width: 2, height: '2em'})).toStrictEqual({scale: 2, width: '2px', height: '2em'})
})

test('sxProps sets display: none if show is false otherwise uses styles value or nothing', () => {
    expect(sxProps({}, true)).toStrictEqual({})
    expect(sxProps({})).toStrictEqual({})
    expect(sxProps({}, false)).toStrictEqual({display: 'none'})
    expect(sxProps({display: 'block'}, true)).toStrictEqual({display: 'block'})
    expect(sxProps({display: 'block'}, )).toStrictEqual({display: 'block'})
    expect(sxProps({display: 'block'}, false)).toStrictEqual({display: 'none'})
})
