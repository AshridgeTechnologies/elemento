import {test} from "vitest"
/**
 * @vitest-environment jsdom
 */
import React, {createElement} from 'react'
import {ListItem, TextElement} from '../../../src/runtime/components'
import {snapshot} from '../../testutil/testHelpers'

test('ListItem produces output containing ReactElement children', () => {
        const itemContentComponent = (_props: { path: string, $item: any }) => createElement(TextElement, {path: 'path1', content: 'where are you?'})
        let listItemElement: React.ReactElement
        listItemElement = createElement(ListItem, {path: 'page1.para1', selected: false, onClick: () => { console.log('Click')}, item: {a: 10}, itemContentComponent})
        snapshot(listItemElement!)()
    }
)

