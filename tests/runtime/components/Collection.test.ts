/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {Collection} from '../../../src/runtime/components/index'
import {snapshot} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'

test('produces output with simple values',
    snapshot(createElement(Collection, {
        state: {value: ['green', 'blue'], _path: 'app.page1.collection1'},
        display: true
    }))
)

test('produces output with record values',
    snapshot(createElement(Collection, {
        state: {
            value: [{a: 10, b: 'Bee1', c: true}, {a: 11}],
            _path: 'app.page1.collection2'
        }, display: true
    }))
)

test('produces empty output with default value for display', () => {
    const {container} = render(createElement(Collection, {
        state: {
            value: ['green', 'blue'],
            _path: 'app.page1.collection3'
        }
    }))
    expect(container.innerHTML).toBe('')
})

test('gets initial values from array using id property', () => {
    const initialValue = Collection.initialValue([{id: 27, a: 10}, {Id: 'xxx123', a: 20}])
    expect(initialValue).toStrictEqual({
        '27': {id: 27, a: 10},
        'xxx123': {Id: 'xxx123', a: 20},
    })
})

test('gets initial values from array using generated id if not present in object', () => {
    const initialValue = Collection.initialValue([{a: 10}, {a: 20}])
    expect(initialValue).toStrictEqual({
        '1': {a: 10},
        '2': {a: 20},
    })
})

test('gets initial values from array using simple value as id', () => {
    const initialValue = Collection.initialValue(['green', 'Blue', 27])
    expect(initialValue).toStrictEqual({
        'green': 'green',
        'Blue': 'Blue',
        '27': 27,
    })
})

test('gets initial values from an object', () => {
    const initialiser = {
        green: true,
        27: {a: 10},
        'xxx-123': 'here'
    }
    const initialValue = Collection.initialValue(initialiser)
    expect(initialValue).toStrictEqual({
        'green': true,
        '27': {a: 10},
        'xxx-123': 'here'
    })
    expect(initialValue).not.toBe(initialiser)
})

test('gets initial value of empty object from undefined', () => {
    expect(Collection.initialValue()).toStrictEqual({})
})