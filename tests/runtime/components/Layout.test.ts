/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {snapshot} from '../../testutil/testHelpers'
import {Layout, TextElement} from '../../../src/runtime/components/index'

const text1 = createElement(TextElement, {path: 'app.page1.things.text1', styles: {width: 200}, content: 'First text'} )
const text2 = createElement(TextElement, {path: 'app.page1.things.text2', styles: {width: 300}, content: 'Second text'} )

test('Layout element produces output containing children vertical',
    snapshot(createElement(Layout, {path: 'app.page1.things', styles: {width: 200}}, text1, text2))
)

test('Layout element produces output containing children horizontal',
    snapshot(createElement(Layout, {path: 'app.page1.things', horizontal: true, styles: {width: '70%'}}, text1, text2))
)

test('Layout element produces output containing children horizontal and wrapped with styles',
    snapshot(createElement(Layout, {path: 'app.page1.things', horizontal: true, styles: {width: '60%', backgroundColor: 'green'}, wrap: true}, text1, text2))
)
