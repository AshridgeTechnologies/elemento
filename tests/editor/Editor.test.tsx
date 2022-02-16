/**
 * @jest-environment jsdom
 */

import React from 'react'
import Editor from '../../src/editor/Editor'
import {treeExpandControlSelector} from './Selectors'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {appFixture1, appFixture2} from '../util/appFixtures'
import {ElementType} from '../../src/model/Types'
import {startCase} from 'lodash'
import {actWait, treeItemLabels} from '../util/testHelpers'

let container: any = null

const itemLabels = () => treeItemLabels(container)

const app = appFixture1()

const onPropertyChange = ()=> {}
const onAction = jest.fn()
const onInsert = ()=> '123'


test("renders tree with app elements",  async () => {
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    expect(container.querySelector('.MuiTypography-h6').textContent).toBe("Elemento Studio")
    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])
})

test('shows Text element selected in tree in property editor', async () => {
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])

    fireEvent.click(screen.getByText('Second Text'))

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement
    expect(nameInput.value).toBe('Second Text')
})

test('property kind button state does not leak into other properties', async () => {
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    expect(itemLabels()).toStrictEqual(['Main Page', 'First Text', 'Second Text', 'Other Page'])

    fireEvent.click(screen.getByText('Second Text'))

    const contentInput = () => container.querySelector('.property-input button') as HTMLInputElement
    expect(contentInput().textContent).toBe('fx=')
    fireEvent.click(contentInput())
    expect(contentInput().textContent).toBe('abc')

    fireEvent.click(screen.getByText('First Text'))
    expect(contentInput().textContent).toBe('fx=')
})

test('shows TextInput element selected in tree in property editor', async () => {
    await actWait(() =>  ({container} = render(<Editor app={appFixture2()} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await actWait(() =>  fireEvent.click(container.querySelectorAll(treeExpandControlSelector)[1]))

    expect(itemLabels()).toStrictEqual(['Main Page', 'Other Page', 'Some Text', 'Another Text Input'])

    fireEvent.click(screen.getByText('Another Text Input'))

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement
    expect(nameInput.value).toBe('Another Text Input')

    const initialValueInput = screen.getByLabelText('Initial Value') as HTMLInputElement
    expect(initialValueInput.value).toBe('"Type the text"')

    const maxLengthInput = screen.getByLabelText('Max Length') as HTMLInputElement
    expect(maxLengthInput.value).toBe('50')
})


const testInsert = (elementType: ElementType) => test(`notifies insert of ${elementType} with item selected in tree and selects new item`, async () => {
    let onInsertArgs: any
    const notionalNewElementId = 'text_1'
    const onInsert = (selectedItemId: string, elementType: ElementType) => {
        onInsertArgs = [selectedItemId, elementType]
        return notionalNewElementId
    }

    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    fireEvent.click(screen.getByText('Second Text'))
    fireEvent.click(screen.getByText('Insert'))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(elementType)))

    expect(onInsertArgs).toStrictEqual(['text_2', elementType])
    const idInput = screen.getByLabelText('Id') as HTMLInputElement
    expect(idInput.value).toBe(notionalNewElementId)
})

testInsert('Text')
testInsert('TextInput')
testInsert('NumberInput')
testInsert('SelectInput')
testInsert('TrueFalseInput')
testInsert('Button')

test('notifies open request', async () => {
    let opened: boolean = false
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction} onOpen={() => opened = true}/>)))
    fireEvent.click(screen.getByText('File'))
    fireEvent.click(screen.getByText('Open'))
    expect(opened).toBe(true)
})

test('notifies save request', async () => {
    let saved: boolean = false
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction} onSave={() => saved = true}/>)))
    fireEvent.click(screen.getByText('File'))
    fireEvent.click(screen.getByText('Save'))
    expect(saved).toBe(true)
})

test(`notifies tree action with item selected in tree`, async () => {
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))
    await actWait(() =>  fireEvent.click(container.querySelector(treeExpandControlSelector)))

    await actWait(() => fireEvent.contextMenu(screen.getByText('Second Text')))
    await actWait(() => fireEvent.click(screen.getByText('Delete')))
    await actWait(() => fireEvent.click(screen.getByText('Yes', {exact: false})))

    expect(onAction).toHaveBeenCalledWith('text_2', 'delete')
})

test('has iframe for running app', async () => {
    await actWait(() =>  ({container} = render(<Editor app={app} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction}/>)))

    const appFrame = container.querySelector('iframe[name="appFrame"]')
    expect(appFrame.src).toMatch(/.*\/runtime\/app.html$/)
})
