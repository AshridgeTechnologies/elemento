/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import {ListItem, TextElement} from '../../../src/runtime/components'
import {snapshot} from '../../testutil/testHelpers'

test('ListItem produces output containing ReactElement children', () => {
        const para1 = createElement(TextElement, null, 'where are you?')
        const para2 = createElement(TextElement, null, 'over here!')
        let listItemElement: React.ReactElement
        listItemElement = createElement(ListItem, {path: 'page1.para1'}, para1, para2)
        snapshot(listItemElement!)()
    }
)

