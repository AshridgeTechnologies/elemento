/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {snapshot} from '../../testutil/testHelpers'
import {Block, TextElement} from '../../../src/runtime/components/index'

const text1 = createElement(TextElement, {path: 'app.page1.things.text1', styles: {width: 200, top: 20, left: 30}, content: 'First text'} )
const text2 = createElement(TextElement, {path: 'app.page1.things.text2', styles: {width: 300, bottom: 10, right: 34}, content: 'Second text'} )

const layoutText1 = createElement(TextElement, {path: 'app.page1.things.text1', styles: {width: 200}, content: 'First text'} )
const layoutText2 = createElement(TextElement, {path: 'app.page1.things.text2', styles: {width: 300}, content: 'Second text'} )

test('Block element produces output containing single child',
    snapshot(createElement(Block, {path: 'app.page1.things', layout: 'positioned', styles: {width: 200}}, text1))
)

test('Block element produces output containing multiple children',
    snapshot(createElement(Block, {path: 'app.page1.things', layout: 'positioned', show: true, styles: {width: 200}}, text1, text2))
)

test('Block element produces output with layout none',
    snapshot(createElement(Block, {path: 'app.page1.things', layout: 'none', show: true, styles: {width: 200}}, text1, text2))
)

test('Block element produces output containing children vertical',
    snapshot(createElement(Block, {path: 'app.page1.things', layout: 'vertical', styles: {width: 200}}, layoutText1, layoutText2))
)

test('Block element produces output containing children horizontal',
    snapshot(createElement(Block, {path: 'app.page1.things', layout: 'horizontal', styles: {width: '70%'}}, layoutText1, layoutText2))
)

test('Block element produces output containing children horizontal and wrapped with styles',
    snapshot(createElement(Block, {path: 'app.page1.things', layout: 'horizontal wrapped', styles: {width: '60%', backgroundColor: 'green'}}, layoutText1, layoutText2))
)
