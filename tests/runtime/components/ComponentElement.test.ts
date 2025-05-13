import {test} from "vitest"
/**
 * @vitest-environment jsdom
 */
import {createElement} from 'react'
import {snapshot} from '../../testutil/testHelpers'
import {ComponentElement, TextElement} from '../../../src/runtime/components/index'

const text1 = createElement(TextElement, {path: 'app.page1.things.text1', styles: {width: 200}, content: 'First text'})
const text2 = createElement(TextElement, {path: 'app.page1.things.text2', styles: {width: 300}, content: 'Second text'})

test('Component element produces output containing children and wrapped with styles',
    snapshot(createElement(ComponentElement, {path: 'app.page1.things', styles: {width: '60%', backgroundColor: 'green'}}, text1, text2))
)
