/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {ListElement, ListItem, TextElement} from '../../../src/runtime/components/index'
import {snapshot} from '../../testutil/testHelpers'

test('ListElement produces output containing ReactElement children', () => {
        const item1 = createElement(ListItem, null, createElement(TextElement, null, 'where are you?'))
        const item2 = createElement(ListItem, null, createElement(TextElement, null, 'over here!'))
        snapshot(createElement(ListElement, {path: 'page1.para1'}, item1, item2))()
    }
)

