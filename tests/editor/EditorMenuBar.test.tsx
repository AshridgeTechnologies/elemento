import {afterEach, expect, test, vi} from "vitest"
/**
 * @vitest-environment jsdom
 */
import React, {useState} from 'react'
import {act, fireEvent, render, screen, within} from '@testing-library/react/pure'
import lodash from 'lodash';
import {projectFixture1} from '../testutil/projectFixtures'
import {actWait} from '../testutil/rtlHelpers'
import EditorMenuBar from '../../src/editor/EditorMenuBar'
import {ElementId, InsertPosition} from '../../src/model/Types'

const {startCase} = lodash;

let unmount: any

const project = projectFixture1()

const onChange = ()=> {}
const onAction = vi.fn()
const onMove = vi.fn()
const onSaveToGitHub = vi.fn()
const onGetFromGitHub = vi.fn()
const onUpdateFromGitHub = vi.fn()
const onInsert = ()=> '123'
const insertMenuItems = vi.fn().mockImplementation((_, selectedItemId)=> selectedItemId ? ['Text', 'TextInput', 'NumberInput'] : [])
const toolItems = {'Tool 1': vi.fn(), 'Tool 2': vi.fn(), }

const onFunctions = {onChange, onAction, onMove, onInsert, onSaveToGitHub, onGetFromGitHub, onUpdateFromGitHub, insertMenuItems, toolItems}


afterEach( async () => act(() => {
    try{
        unmount && unmount()
    } catch(e: any) {
        if (!e.message?.match(/Cannot read properties of null \(reading 'removeEventListener'\)/)) {
            throw e
        }
    }
}))

function EditorMenuTestWrapper(props: any) {
    const [selectedItemIds] = useState<string[]>([])
    return React.createElement(EditorMenuBar, {selectedItemIds, ...onFunctions, ...props})
}

test('notifies copy', async () => {
    const onAction = vi.fn()
    const actionsAvailableFn = (_id: ElementId) => ['copy']

    await actWait(() =>  ({unmount} = render(<EditorMenuTestWrapper project={project} onAction={onAction}
                                                                               selectedItemIds={['id1', 'id2']} actionsAvailableFn={actionsAvailableFn}
                                                                                itemNameFn={(id: ElementId) => id + '_name'}
    />)))

    fireEvent.click(screen.getByText('Edit'))
    fireEvent.click(within(screen.getByTestId('editMenu')).getByText('Copy'))

    expect(onAction).toHaveBeenCalledWith(['id1', 'id2'], 'copy')
})

test('shows warning for insert menu if no item selected', async () => {
    const optionsShown = () => screen.queryByTestId('insertMenu') && within(screen.getByTestId('insertMenu')).queryAllByRole('menuitem').map( el => el.textContent)
    const warningMessage = () => screen.getByTestId('insertWarning')

    await actWait(() =>  ({unmount} = render(<EditorMenuTestWrapper project={project} selectedItemIds={[]}/>)))
    fireEvent.click(screen.getByText('Insert'))
    expect(optionsShown()).toBeNull()
    expect(warningMessage().textContent).toMatch(/Please select/)
})

test('shows allowed items in menu bar insert menu', async () => {
    const optionsShown = () => screen.queryByTestId('insertMenu') && within(screen.getByTestId('insertMenu')).queryAllByRole('menuitem').map( el => el.textContent)

    await actWait(() =>  ({unmount} = render(<EditorMenuTestWrapper project={project} selectedItemIds={['id1']}/>)))
    fireEvent.click(screen.getByText('Insert'))
    expect(optionsShown()).toStrictEqual(['Before', 'After', 'Inside', 'Text', 'Text Input', 'Number Input'])
})

test('only shows insert menu items if there are items to insert in that position', async () => {
    const itemsFn = vi.fn().mockImplementation( (position: InsertPosition, _targetItemId: ElementId) => (position === 'after' || position === 'before') ? ['Text'] : [])

    await actWait(() => ({unmount} = render(<EditorMenuTestWrapper project={project} selectedItemIds={['id1']} insertMenuItems={itemsFn}/>)))
    await actWait(() => fireEvent.click(screen.getByText(`Insert`)))
    expect(screen.queryByText(`Before`, {exact: true})).not.toBeNull()
    expect(screen.queryByText(`After`, {exact: true})).not.toBeNull()
    expect(within(screen.getByTestId('insertMenu')).queryByText(`Inside`, {exact: true})).toBeNull()
})

test.each(['Text', 'TextInput', 'NumberInput'])(`notifies insert of %s with item selected in tree`, async (elementType) => {
    const notionalNewElementId = 'text_1'
    const onInsert = vi.fn().mockReturnValue(notionalNewElementId)

    await actWait(() =>  ({unmount} = render(<EditorMenuTestWrapper project={project} onInsert={onInsert} selectedItemIds={['id1']}/>)))

    fireEvent.click(screen.getByText('Insert'))
    fireEvent.click(within(screen.getByTestId('insertMenu')).getByText(startCase(elementType)))

    expect(onInsert).toHaveBeenCalledWith('after', 'id1', elementType)
})

test('notifies open request and closes menu', async () => {
    let onOpen = vi.fn()
    await actWait(() =>  ({unmount} = render(<EditorMenuTestWrapper project={project} onOpen={onOpen}/>)))
    await actWait(() => fireEvent.click(screen.getByText('File')) )
    await actWait(() => fireEvent.click(screen.getByText('Open')) )
    expect(onOpen).toHaveBeenCalled()
    await actWait()
    expect(screen.queryByText('Open')).toBeNull()
})

test('notifies Get from GitHub request and closes menu', async () => {
    let onOpenFromGitHub = vi.fn()
    await actWait(() =>  ({unmount} = render(<EditorMenuTestWrapper project={project} onOpenFromGitHub={onOpenFromGitHub}/>)))
    await actWait(() => fireEvent.click(screen.getByText('File')) )
    await actWait(() => fireEvent.click(screen.getByText('Get from GitHub')) )
    expect(onOpenFromGitHub).toHaveBeenCalled()
    await actWait()
    expect(screen.queryByText('Get from GitHub')).toBeNull()
})

test('notifies Update from GitHub request and closes menu', async () => {
    let onUpdateFromGitHub = vi.fn()
    await actWait(() =>  ({unmount} = render(<EditorMenuTestWrapper project={project} onUpdateFromGitHub={onUpdateFromGitHub}/>)))
    await actWait(() => fireEvent.click(screen.getByText('File')) )
    await actWait(() => fireEvent.click(screen.getByText('Update from GitHub')) )
    expect(onUpdateFromGitHub).toHaveBeenCalled()
    await actWait()
    expect(screen.queryByText('Update from GitHub')).toBeNull()
})

test('notifies new request', async () => {
    let onNew = vi.fn()
    await actWait(() =>  ({unmount} = render(<EditorMenuTestWrapper project={project} onNew={onNew}/>)))
    fireEvent.click(screen.getByText('File'))
    fireEvent.click(screen.getByText('New'))
    expect(onNew).toHaveBeenCalled()
})
