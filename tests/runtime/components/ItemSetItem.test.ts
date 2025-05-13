import {test} from "vitest"
/**
 * @vitest-environment jsdom
 */
import React, {createElement} from 'react'
import {ItemSetItem, TextElement} from '../../../src/runtime/components'
import {inDndContext, snapshot, valueObj} from '../../testutil/testHelpers'

test('ItemSetItem produces output containing ReactElement children', () => {
    const childEl = createElement(TextElement, {path: 'item1', content: 'where are you?'})
    const styles = {color: 'red', borderWidth: 20, backgroundColor: valueObj('blue')}
    const itemElement: React.ReactElement = createElement(ItemSetItem, {
        path: 'page1.para1', item: 'red', index: 3, itemId: '3', onClick: () => console.log('Click'), styles, children: childEl})
    const elementInDndContext = inDndContext(itemElement)
    snapshot(elementInDndContext)()
})

test('ItemSetItem produces output containing ReactElement children if draggable', () => {
    const childEl = createElement(TextElement, {path: 'item1', content: 'where are you?'})
    const styles = {color: 'red', borderWidth: 20, backgroundColor: valueObj('blue')}
    const itemElement: React.ReactElement = createElement(ItemSetItem, {
        path: 'page1.para1', item: 'red', index: 3, itemId: '3', onClick: () => console.log('Click'), canDragItem: true, styles, children: childEl})
    const elementInDndContext = inDndContext(itemElement)
    snapshot(elementInDndContext)()
})

test('ItemSetItem produces output containing ReactElement children is draggable is a false value object', () => {
    const childEl = createElement(TextElement, {path: 'item1', content: 'where are you?'})
    const styles = {color: 'red', borderWidth: 20, backgroundColor: valueObj('blue')}
    const itemElement: React.ReactElement = createElement(ItemSetItem, {
        path: 'page1.para1', item: 'red', index: 3, itemId: '3', onClick: () => console.log('Click'), canDragItem: valueObj(false), styles, children: childEl})
    const elementInDndContext = inDndContext(itemElement)
    snapshot(elementInDndContext)()
})
