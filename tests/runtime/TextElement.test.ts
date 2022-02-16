import {createElement} from 'react'
import TextElement from '../../src/runtime/TextElement'
import {snapshot} from '../util/testHelpers'

test('TextElement element produces output containing string children',
    snapshot(createElement(TextElement, {path: 'page1.para1'}, 'Hello', 'where are you'))
)

test('TextElement element produces output containing ReactElement children', () => {
        const para = createElement('p', null, 'where are you')
        snapshot(createElement(TextElement, {path: 'page1.para1'}, 'Hello', para))()
    }
)

test('TextElement element produces output containing value property of object', () => {
        const obj = {value: 'where are you'}
        snapshot(createElement(TextElement, {path: 'page1.para1'}, obj))()
    }
)

test('TextElement adds line break before line ends', () => {
    snapshot(createElement(TextElement, {path: 'page1.para1'}, 'Hello\nwhere are you\ntoday?'))()
})
