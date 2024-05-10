/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import {ItemSetItem, TextElement} from '../../../src/runtime/components'
import {snapshot, valueObj} from '../../testutil/testHelpers'

test('ItemSetItem produces output containing ReactElement children', () => {
    const itemContentComponent = (props: { path: string, $item: any }) => createElement(TextElement, null, 'where are you?')
    const styles = {color: 'red', borderWidth: 20, backgroundColor: valueObj('blue')}
    const itemElement: React.ReactElement = createElement(ItemSetItem, {
        path: 'page1.para1', selected: false, onClick: () => console.log('Click'), item: {a: 10}, styles, itemContentComponent})
    snapshot(itemElement!)()
})
