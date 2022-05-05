/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {TextElement} from '../../../src/runtime/components/index'
import {snapshot, stateVal} from '../../testutil/testHelpers'
import {globalFunctions} from '../../../src/runtime/globalFunctions'

const {Sum} = globalFunctions

test('TextElement element produces output containing string children',
    snapshot(createElement(TextElement, {path: 'page1.para1'}, 'Hello', 'where are you'))
)

test('TextElement element produces output containing undefined children',
    snapshot(createElement(TextElement, {path: 'page1.para1'}, undefined))
)

test('TextElement element produces output containing string version of object children',
    // @ts-ignore
    snapshot(createElement(TextElement, {path: 'page1.para1'}, {a:10}, {c: 'Hi'}))
)

test('TextElement element produces output containing string version of function children',
    // @ts-ignore
    snapshot(createElement(TextElement, {path: 'page1.para1'}, Sum))
)

test('TextElement element produces output containing ReactElement children', () => {
        const para = createElement('p', null, 'where are you')
        snapshot(createElement(TextElement, {path: 'page1.para1',
            fontSize: 32, fontFamily: 'Courier', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200}, 'Hello', para))()
    }
)

test('TextElement element produces output containing valueOf  object', () => {
        const obj = stateVal('where are you')
        snapshot(createElement(TextElement, {path: 'page1.para1'}, obj))()
    }
)

test('TextElement adds line break before line ends', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1'}, 'Hello\nwhere are you\ntoday?'))()
})

test('TextElement gets property values supplied as state objects', () => {
    const para = createElement('p', null, 'where are you')
    snapshot(createElement(TextElement, {path: 'page1.para1',
        fontSize: stateVal(32), fontFamily: stateVal('Courier'), color: stateVal('red'),
        backgroundColor: stateVal('green'), border: stateVal(10), borderColor: stateVal('black'),
        width: stateVal(100), height: stateVal(200)}, 'Hello', para))()

})