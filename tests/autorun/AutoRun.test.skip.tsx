/**
 * @jest-environment jsdom
 */

import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import AutoRun from '../../src/autorun/AutoRun'
import {editorAutorunFixture1} from '../testutil/autorunFixtures'
import {actWait} from '../testutil/rtlHelpers'
import {treeItemLabels} from '../testutil/testHelpers'

let container: any = null

const app = editorAutorunFixture1()

const itemLabels = () => treeItemLabels(container)

const renderComponent = () => actWait(() => ({container} = render(<AutoRun script={app}/>)))

const title = () => container.querySelector('#title')

const click = fireEvent.click

test("shows tree with script steps",  async () => {
    await renderComponent()
    expect(itemLabels()).toStrictEqual(['Introduction', 'Navigation panel', 'Properties panel'])
})

test('shows first step in details panel', async () => {
    await renderComponent()

    expect(title().innerHTML).toBe('Introduction')
    expect(container.querySelector('#description').innerHTML).toBe('We are going to see how things work')
})
test('shows step selected in tree in details panel', async () => {
    await renderComponent()

    click(screen.getByText('Properties panel'))
    expect(title().innerHTML).toBe('Properties panel')
    expect(container.querySelector('#description').innerHTML).toBe('This shows the details')
})

test.skip('highlights element in target frame if any', async () => {
    await renderComponent()

    click(screen.getByText('Properties panel'))
    const targetFrame = container.querySelector('iframe[name=targetFrame]')
    const targetElement = targetFrame.contentDocument.querySelector('#propertyPanel')
    expect(targetElement.style.border).toBe('dashed')
})

test('can move selection to next and prev with buttons when possible', async () => {
    await renderComponent()
    const nextButton = () => screen.getByText('Next') as HTMLButtonElement
    const previousButton = () => screen.getByText('Previous') as HTMLButtonElement

    expect(title().innerHTML).toBe('Introduction')
    expect((screen.getByText('Previous') as any).disabled).toBe(true)

    click(nextButton())
    expect(title().innerHTML).toBe('Navigation panel')
    expect((screen.getByText('Previous') as any).disabled).toBe(false)

    click(nextButton())
    expect(title().innerHTML).toBe('Properties panel')
    expect(previousButton().disabled).toBe(false)
    expect((nextButton() as any).disabled).toBe(true)

    click(screen.getByText('Previous'))
    expect(title().innerHTML).toBe('Navigation panel')
    expect(previousButton().disabled).toBe(false)
    expect(nextButton().disabled).toBe(false)
})

test('has iframe for editor', async () => {
    await renderComponent()

    const targetFrame = container.querySelector('iframe[name="targetFrame"]')
    expect(targetFrame.src).toMatch(/.*\/editor\/index.html$/)
})