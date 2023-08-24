/**
 * @jest-environment jsdom
 */

import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import HelpPanel from '../../src/docs/HelpPanel'
import {actWait} from '../testutil/rtlHelpers'

window.HTMLElement.prototype.scrollIntoView = function() {}

let container: any

// const treeItemSelector = 'li[role="treeitem"]'
const treeItemSelector = '.MuiTreeItem-label'
const itemLabels = () => {
    const treeNodesShown = container.querySelectorAll(treeItemSelector)
    return [...treeNodesShown.values()].map( (it: any) => it.textContent)
}
const treeExpandControlSelector = '.MuiTreeItem-iconContainer'

let expandControl = function (index: number) {
    return container.querySelectorAll(treeExpandControlSelector).item(index)
}

const helpContent = (<>
    <section id='item-1'>
        <h4>Help item 1</h4>
        <article id='item-1-1'>
            <h5>Help subsection 1-1</h5>
            <p>Stuff about 1-1</p>
        </article>
        <article id='item-1-2'>
            <h5>Help subsection 1-2</h5>
            <p>Stuff about 1-2</p>
        </article>
    </section>
    <section id='item-2'>
        <h4>Help item 2</h4>
        <article id='item-2-1'>
            <h5>Help subsection 2-1</h5>
            <p>Stuff about 2-1</p>
        </article>
        <article id='item-2-2'>
            <h5>Help subsection 2-2</h5>
            <p>Stuff about 2-2</p>
        </article>
    </section>
</>
)

test("content tree shows headings from help contents",  async () => {
    await actWait( () => ({container} = render(<HelpPanel>{helpContent}</HelpPanel>)))
    expect(itemLabels()).toStrictEqual(['Help item 1', 'Help item 2'])

    await actWait(() => fireEvent.click(expandControl(0)))
    expect(itemLabels()).toStrictEqual(['Help item 1', 'Help subsection 1-1', 'Help subsection 1-2', 'Help item 2'])

})





