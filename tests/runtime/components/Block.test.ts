/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {snapshot} from '../../testutil/testHelpers'
import {Block, TextElement} from '../../../src/runtime/components/index'

const text1 = createElement(TextElement, {path: 'app.page1.things.text1', styles: {width: 200, top: 20, left: 30}}, 'First text')
const text2 = createElement(TextElement, {path: 'app.page1.things.text2', styles: {width: 300, bottom: 10, right: 34}}, 'Second text')

test('Block element produces output containing single child',
    snapshot(createElement(Block, {path: 'app.page1.things', styles: {width: 200}}, text1))
)

test('Block element produces output containing multiple children',
    snapshot(createElement(Block, {path: 'app.page1.things', show: true, styles: {width: 200}}, text1, text2))
)
