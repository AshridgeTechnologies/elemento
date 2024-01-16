import {valueObj} from '../testutil/testHelpers'
import {parentPath, valueOf, asArray} from '../../src/runtime/runtimeFunctions'
import BigNumber from 'bignumber.js'

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

test('gets values of object', () => {
    const obj = {x1: {a:10}, x2: {a: 20}}
    expect(asArray(obj)).toStrictEqual([{a: 10}, {a: 20}])
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

test('gets value of objects', () => {
    const obj = {x1: {a:10}, x2: {a: 20}}
    expect(asArray(valueObj(obj))).toStrictEqual([{a: 10}, {a: 20}])
})

test('parentPath finds parent path', () => {
    expect(parentPath('app.thing.widget')).toBe('app.thing')
})

test('parentPath finds parent path above index at end', () => {
    expect(parentPath('app.mainpage.foolist.4')).toBe('app.mainpage')
})

test('parentPath finds parent path above index at end with nested indexes', () => {
    expect(parentPath('app.mainpage.toplist.3.foolist.4')).toBe('app.mainpage.toplist.3')
})

