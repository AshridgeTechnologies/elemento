/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {TextElement} from '../../../src/runtime/components/index'
import {snapshot, valueObj} from '../../testutil/testHelpers'
import {globalFunctions} from '../../../src/runtime/globalFunctions'
import {ErrorResult} from '../../../src/runtime/DataStore'

const {Sum} = globalFunctions

class MyClass {
    toString() { return 'This is a MyClass' }
}

test('TextElement element produces output containing string children',
    snapshot(createElement(TextElement, {path: 'page1.para1'}, 'Hello', 'where are you'))
)

test('TextElement element produces normal output with display true',
    snapshot(createElement(TextElement, {path: 'page1.para1', display: true}, 'Hello', 'where are you'))
)

test('TextElement element produces null output with display false',
    snapshot(createElement(TextElement, {path: 'page1.para1', display: false}, 'Hello', 'where are you'))
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

test('TextElement element produces output containing toString of ErrorResult',
    // @ts-ignore
    snapshot(createElement(TextElement, {path: 'page1.para1'}, new ErrorResult('Bad function', 'It went wrong')))
)

test('TextElement element produces output containing toString of class object',
    // @ts-ignore
    snapshot(createElement(TextElement, {path: 'page1.para1'}, new MyClass() ))
)

test('TextElement element produces output containing ReactElement children', () => {
        const para = createElement('p', null, 'where are you')
        snapshot(createElement(TextElement, {path: 'page1.para1',
            fontSize: 32, fontFamily: 'Courier', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 44}, 'Hello', para))()
    }
)

test('TextElement element produces output containing valueOf  object', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1'}, valueObj('where are you')))()
    }
)

test('TextElement adds line break before line ends', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1'}, 'Hello\nwhere are you\ntoday?'))()
})

test('TextElement gets property values supplied as state objects', () => {
    const para = createElement('p', null, 'where are you')
    snapshot(createElement(TextElement, {path: 'page1.para1',
        fontSize: valueObj(32), fontFamily: valueObj('Courier'), color: valueObj('red'),
        backgroundColor: valueObj('green'), border: valueObj(10), borderColor: valueObj('black'),
        width: valueObj(100), height: valueObj(200), marginBottom: valueObj(55)}, 'Hello', para))()

})