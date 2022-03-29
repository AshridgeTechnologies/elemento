/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {componentJSON} from '../../testutil/testHelpers'
import TextElement from '../../../src/runtime/components/TextElement'
import {Page} from '../../../src/runtime/components/index'

test('Page element produces output containing children', () => {
    const child = createElement(TextElement, {path: 'page1.para1'}, 'Hello', 'where are you')
    const component = createElement(Page, {path: 'page1'}, child)
    expect(componentJSON(component)).toMatchSnapshot()
})
