import {asArray} from '../../src/runtime'
import {valObj} from '../testutil/testHelpers'

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