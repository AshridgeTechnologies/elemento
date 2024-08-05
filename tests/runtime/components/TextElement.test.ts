/**
 * @jest-environment jsdom
 */

import {createElement, ReactNode} from 'react'
import {TextElement, Button, Icon} from '../../../src/runtime/components/index'
import {snapshot, valueObj} from '../../testutil/testHelpers'
import {globalFunctions} from '../../../src/runtime/globalFunctions'
import {ErrorResult} from '../../../src/runtime/DataStore'
import {TextInputState} from '../../../src/runtime/components/TextInput'

const {Sum} = globalFunctions

class MyClass {
    toString() { return 'This is a MyClass' }
}

test('TextElement element produces output containing string children',
    snapshot(createElement(TextElement, {path: 'page1.para1', content: 'Hello where are you'} ))
)

test('TextElement element produces normal output with show true',
    snapshot(createElement(TextElement, {path: 'page1.para1', show: true, content: 'Hello where are you'}))
)

test('TextElement element produces display: none output with show false',
    snapshot(createElement(TextElement, {path: 'page1.para1', show: false, content: 'Hello where are you'}))
)

test('TextElement element produces output containing empty children',
    snapshot(createElement(TextElement, {path: 'page1.para1', content: undefined}))
)

test('TextElement element produces output containing string version of object children',
    snapshot(createElement(TextElement, {path: 'page1.para1', content: {a:10, c: 'Hi'}}))
)

test('TextElement element produces output containing string version of function children',
    // @ts-ignore
    snapshot(createElement(TextElement, {path: 'page1.para1', content: Sum}))
)

test('TextElement element produces output containing toString of ErrorResult',
    // @ts-ignore
    snapshot(createElement(TextElement, {path: 'page1.para1', content: new ErrorResult('Bad function', 'It went wrong')} ))
)

test('TextElement element produces output containing toString of class object',
    // @ts-ignore
    snapshot(createElement(TextElement, {path: 'page1.para1', content: new MyClass()}  ))
)

test('TextElement element DOES NOT produce output containing ReactElement children', () => {
        const para = createElement('p', null, 'where are you')
        snapshot(createElement(TextElement, {path: 'page1.para1', content: para,
            styles: {fontSize: 32, fontFamily: 'Courier', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 44}}))()
    }
)

test('TextElement element produces output containing valueOf object', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1', content: valueObj('where are you')}))()
    }
)

test('TextElement adds line break for newlines even if allowHtml is none', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1', content: 'Hello\nwhere \n\n\nare you\n\ntoday?'} ))()
})

test('TextElement gets property values supplied as state objects', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1',
        styles: {fontSize: valueObj(32), fontFamily: valueObj('Courier'), color: valueObj('red'),
        backgroundColor: valueObj('green'), border: valueObj(10), borderColor: valueObj('black'),
        width: valueObj(100), height: valueObj(200), marginBottom: valueObj(55)}, content: 'Hello'} ))()
})

test('Does not show HTML text if allowHtml is false', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1', content:'<h1>Hello</h1>\n\n<b>where</b> are you?'} ))()
})

test('Can show HTML text ', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1', allowHtml: true, content:'<h1>Hello</h1>\n\n<b>where</b> are you?'} ))()
})

test('Sanitises bad tags in HTML text', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1', allowHtml: true, content:'<h1>Hello</h1>\n\n<script>alert("!!")</script>'} ))()
})

test('Sanitises incorrect HTML text', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1', allowHtml: true, content:'<h1>Hello</h1>\n\n<div<br/xyz'} ))()
})

test('Can show HTML text with values in a template string', () => {
    const input1 = new TextInputState({value: 'Number 42'})
    snapshot(createElement(TextElement, {path: 'page1.para1', allowHtml: true, content: `<h2>Hello</h2>\n<em>${input1}</em>`} ))()
})

test('Can show plain text with child elements and placeholders', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1', allowHtml: false, content:'Hi this is @Comp1@ with @Comp2@ but not Comp3'},
        createElement(TextElement, {path: 'page1.para1.Comp1', content: 'This is Comp 1'}),
        createElement(Icon, {path: 'page1.para1.Comp2', iconName: 'some_icon'}),
        createElement(Button, {path: 'page1.para1.Comp3', content: 'Button Comp 3'})
     ))()
})

test('Can show html text with child elements and placeholders', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1', allowHtml: true, content:'<article>Hi this is <span>@Comp1@</span> without Comp2@ and @Comp3'},
        createElement(TextElement, {path: 'page1.para1.Comp1', content: 'This is Comp 1'}),
        createElement(Icon, {path: 'page1.para1.Comp2', iconName: 'some_icon'}),
        createElement(Button, {path: 'page1.para1.Comp3', content: 'Button Comp 3'})
     ))()
})
