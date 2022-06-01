/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {snapshot} from '../../testutil/testHelpers'
import {AppBar, TextElement} from '../../../src/runtime/components/index'

const text1 = createElement(TextElement, {path: 'app.bar1.text1', width: 200}, 'First text')
const text2 = createElement(TextElement, {path: 'app.bar1.text2', width: 300}, 'Second text')

test('AppBar element produces output with title',
    snapshot(createElement(AppBar, {path: 'app.bar1', title: 'My App'}))
)

test('AppBar element produces output with children',
    snapshot(createElement(AppBar, {path: 'app.bar1'}, text1, text2))
)

test('AppBar element produces output with children and title',
    snapshot(createElement(AppBar, {path: 'app.bar1', title: 'My App'}, text1, text2))
)
