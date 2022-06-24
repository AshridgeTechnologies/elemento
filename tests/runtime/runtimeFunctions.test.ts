import {asArray} from '../../src/runtime'
import {valObj} from '../testutil/testHelpers'
import {parentPath} from '../../src/runtime/runtimeFunctions'

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
    expect(asArray(valObj(obj))).toStrictEqual([{a: 10}, {a: 20}])
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

