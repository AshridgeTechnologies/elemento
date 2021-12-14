/**
 * @jest-environment jsdom
 */

import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {actWait, treeItemLabels} from '../util/testHelpers'
import AutoRun from '../../src/autorun/AutoRun'
import {editorAutorunFixture1} from '../util/autorunFixtures'

let container: any = null

const app = editorAutorunFixture1()

const itemLabels = () => treeItemLabels(container)

const renderComponent = () => actWait(() => ({container} = render(<AutoRun script={app}/>)))

test("shows tree with script steps",  async () => {
    await renderComponent()
    expect(itemLabels()).toStrictEqual(['Introduction', 'Navigation panel', 'Properties panel'])
})

test('shows first step in details panel', async () => {
    await renderComponent()

    expect(container.querySelector('#title').innerHTML).toBe('Introduction')
    expect(container.querySelector('#description').innerHTML).toBe('We are going to see how things work')
})

test('shows step selected in tree in details panel', async () => {
    await renderComponent()

    fireEvent.click(screen.getByText('Properties panel'))
    expect(container.querySelector('#title').innerHTML).toBe('Properties panel')
    expect(container.querySelector('#description').innerHTML).toBe('This shows the details')
})

test('has iframe for editor', async () => {
    await renderComponent()

    const targetFrame = container.querySelector('iframe[name="targetFrame"]')
    expect(targetFrame.src).toMatch(/.*\/editor\/index.html$/)
})