/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {snapshot} from '../../testutil/testHelpers'
import {Layout, TextElement} from '../../../src/runtime/components/index'

const text1 = createElement(TextElement, {path: 'app.page1.things.text1', width: 200}, 'First text')
const text2 = createElement(TextElement, {path: 'app.page1.things.text2', width: 300}, 'Second text')

test('Layout element produces output containing children vertical',
    snapshot(createElement(Layout, {path: 'app.page1.things', width: 200}, text1, text2))
)

test('Layout element produces output containing children horizontal',
    snapshot(createElement(Layout, {path: 'app.page1.things', horizontal: true, width: '70%'}, text1, text2))
)

test('Layout element produces output containing children horizontal and wrapped with background color',
    snapshot(createElement(Layout, {path: 'app.page1.things', horizontal: true, width: '60%', backgroundColor: 'green', wrap: true}, text1, text2))
)
