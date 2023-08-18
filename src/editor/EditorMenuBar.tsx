import {ElementId} from '../model/Types'
import MenuBar from './MenuBar'
import FileMenu from './FileMenu'
import InsertMenuWithButton from './InsertMenuWithButton'
import {Button} from '@mui/material'
import React from 'react'
import {ActionsAvailableFn, InsertMenuItemsFn, OnActionFn, OnInsertFnWithPositionFn} from './Types'
import EditMenuWithButton from './EditMenuWithButton'

type EditorMenuProps = {
    onNew: () => void,
    onOpen: () => Promise<void>,
    onGetFromGitHub: () => void,
    onUpdateFromGitHub: () => Promise<void>,
    onSaveToGitHub: () => Promise<void>,
    signedIn: boolean,
    onInsert: OnInsertFnWithPositionFn,
    onAction: OnActionFn,
    actionsAvailableFn: ActionsAvailableFn,
    insertMenuItems: InsertMenuItemsFn,
    itemNameFn: (id: ElementId) => string,
    selectedItemIds: ElementId[],
    onHelp: () => void
}

export default function EditorMenuBar(props: EditorMenuProps) {
    const {
        onNew,
        onOpen,
        onHelp,
        onGetFromGitHub,
        onUpdateFromGitHub,
        onSaveToGitHub,
        onInsert,
        onAction,
        actionsAvailableFn,
        insertMenuItems,
        itemNameFn,
        selectedItemIds,
        signedIn
    } = props

    return <MenuBar>
        <FileMenu onNew={onNew} onOpen={onOpen}
                  onGetFromGitHub={onGetFromGitHub} onUpdateFromGitHub={onUpdateFromGitHub}
                  onSaveToGitHub={onSaveToGitHub} signedIn={signedIn}/>
        <EditMenuWithButton onAction={onAction} actionsAvailableFn={actionsAvailableFn} selectedItemIds={selectedItemIds} itemNameFn={itemNameFn}/>
        <InsertMenuWithButton onInsert={onInsert} insertMenuItems={insertMenuItems} targetItemId={selectedItemIds[0]}/>
        <Button id='help' color={'secondary'} onClick={onHelp}>Help</Button>
    </MenuBar>
}