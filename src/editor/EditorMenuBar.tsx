import {ElementId} from '../model/Types'
import MenuBar from './MenuBar'
import FileMenu from './FileMenu'
import InsertMenuWithButton from './InsertMenuWithButton'
import {Box, Button} from '@mui/material'
import React from 'react'
import {ActionsAvailableFn, InsertMenuItemsFn, OnActionFn, OnInsertFnWithPositionFn} from './Types'
import EditMenuWithButton from './EditMenuWithButton'
import ToolsMenu from './ToolsMenu'

type EditorMenuProps = {
    onNew: () => void,
    onOpen: () => Promise<void>,
    onSaveAs: () => void,
    onOpenFromGitHub: () => void,
    onGetFromGitHub?: () => void,
    onUpdateFromGitHub: () => Promise<void>,
    onSaveToGitHub: () => Promise<void>,
    signedIn: boolean,
    onInsert: OnInsertFnWithPositionFn,
    onAction: OnActionFn,
    actionsAvailableFn: ActionsAvailableFn,
    insertMenuItems: InsertMenuItemsFn,
    itemNameFn: (id: ElementId) => string,
    selectedItemIds: ElementId[],
    toolItems: {[name: string]: VoidFunction}
    onHelp: () => void,
    onOpenTool: (url: string) => void,
    status: React.ReactNode
}

export default function EditorMenuBar(props: EditorMenuProps) {
    const {
        onNew,
        onOpen,
        onSaveAs,
        onHelp,
        onOpenTool,
        onOpenFromGitHub,
        onGetFromGitHub,
        onUpdateFromGitHub,
        onSaveToGitHub,
        onInsert,
        onAction,
        actionsAvailableFn,
        insertMenuItems,
        itemNameFn,
        selectedItemIds,
        signedIn,
        toolItems,
        status
    } = props

    return <MenuBar>
        <FileMenu onNew={onNew} onOpen={onOpen} onSaveAs={onSaveAs}
                  onOpenFromGitHub={onOpenFromGitHub}
                  onGetFromGitHub={onGetFromGitHub} onUpdateFromGitHub={onUpdateFromGitHub}
                  onSaveToGitHub={onSaveToGitHub} signedIn={signedIn}/>
        <EditMenuWithButton onAction={onAction} actionsAvailableFn={actionsAvailableFn} selectedItemIds={selectedItemIds} itemNameFn={itemNameFn}/>
        <InsertMenuWithButton onInsert={onInsert} insertMenuItems={insertMenuItems} targetItemId={selectedItemIds[0]}/>
        <ToolsMenu toolItems={toolItems} openFromUrlFn={onOpenTool}/>
        <Button id='help' color={'secondary'} onClick={onHelp}>Help</Button>
        <Box id='_filler' flexGrow={1}/>
        {status}
    </MenuBar>
}
