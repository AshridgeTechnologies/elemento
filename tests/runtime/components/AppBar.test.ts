/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {snapshot} from '../../testutil/testHelpers'
import {AppBar, TextElement} from '../../../src/runtime/components/index'

const text1 = createElement(TextElement, {path: 'app.bar1.text1', styles: {width: 200}, content: 'First text'})
const text2 = createElement(TextElement, {path: 'app.bar1.text2', styles: {width: 200}, content: 'Second text'})

test('AppBar element produces output with title',
    snapshot(createElement(AppBar, {path: 'app.bar1', title: 'My App', styles: {color: 'red'}}))
)

test('AppBar element produces output with children',
    snapshot(createElement(AppBar, {path: 'app.bar1'}, text1, text2))
)

test('AppBar element produces output with children and title',
    snapshot(createElement(AppBar, {path: 'app.bar1', title: 'My App', styles: {color: 'red'}}, text1, text2))
)
