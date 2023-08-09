import React, {useState} from 'react'

import Element from '../model/Element'
import AppStructureTree, {ModelTreeItem} from './AppStructureTree'
import PropertyEditor from './PropertyEditor'
import {
    AppElementAction,
    OnActionFn,
    OnChangeFn,
    OnGetFromGitHubFn,
    OnInsertWithSelectedFn,
    OnMoveFn,
    OnNewFn,
    OnOpenFn,
    OnSaveToGitHubFn,
    OnUpdateFromGitHubFn
} from './Types'
import MenuBar from './MenuBar'
import InsertMenuWithButton from './InsertMenuWithButton'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {elementTypes} from '../model/elements'

import {Box, Button, Grid} from '@mui/material'
import FileMenu from './FileMenu'
import './splitPane.css'
import Project from '../model/Project'
import {useSignedInState} from '../shared/authentication'
import {AllErrors} from '../generator/Types'
import EditorHelpPanel from './EditorHelpPanel'
import {noop} from '../util/helpers'

const treeData = (project: Project): ModelTreeItem => {
    const treeNodeFromElement = (el: Element): ModelTreeItem => {
        const children = el.elements?.map(treeNodeFromElement)
        return new ModelTreeItem(el.id, el.name, el.kind, children)
    }
    return treeNodeFromElement(project)
}

const allElementTypes = Object.keys(elementTypes()) as ElementType[]
export const ProjectContext = React.createContext<Project | null>(null)

export default function Editor({
    project,
    onChange,
    onInsert,
    onMove,
    onAction,
    onNew,
    onOpen,
    onSaveToGitHub,
    onGetFromGitHub,
    onUpdateFromGitHub,
    selectedItemIds,
    onSelectedItemsChange,
    errors
                               }: { project: Project, onChange: OnChangeFn, onInsert: OnInsertWithSelectedFn, onMove: OnMoveFn, onAction: OnActionFn,
                                    onOpen?: OnOpenFn, onNew?: OnNewFn,
                                    onSaveToGitHub: OnSaveToGitHubFn, onGetFromGitHub: OnGetFromGitHubFn, onUpdateFromGitHub?: OnUpdateFromGitHubFn,
                                    selectedItemIds: string[], onSelectedItemsChange: (ids: string[]) => void,
                                    errors: AllErrors}) {
    const firstSelectedItemId = selectedItemIds[0]
    const [helpVisible, setHelpVisible] = useState(false)

    const propertyArea = () => {
        if (firstSelectedItemId) {
            const element = project.findElement(firstSelectedItemId)
            if (element) {
                return <PropertyEditor element={element} onChange={onChange} errors={errors[element.id]}/>
            }
        }

        return null
    }

    const insertMenuItems = (insertPosition: InsertPosition, targetItemId: ElementId): ElementType[] => {
        return allElementTypes.filter(type => project.canInsert(insertPosition, targetItemId, type))
    }

    const actionsAvailable = (targetItemId: ElementId): AppElementAction[] => project.actionsAvailable(targetItemId)

    const onMenuInsert = (elementType: ElementType) => {
        const newElementId = onInsert('after', firstSelectedItemId, elementType)
        onSelectedItemsChange([newElementId])
    }

    const onContextMenuInsert = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType) => {
        const newElementId = onInsert(insertPosition, targetElementId, elementType)
        onSelectedItemsChange([newElementId])
    }

    const onHelp = () => setHelpVisible(!helpVisible)

    const onTreeAction = async ({action, ids}: { action: AppElementAction, ids: (string | number)[] }) => {
        const newSelectedItemId = await onAction(ids.map(id => id.toString()), action)
        if (newSelectedItemId) {
            onSelectedItemsChange([newSelectedItemId])
        }
    }
    const signedIn = useSignedInState()
    const EditorHeader = <Box flex='0'>
        <MenuBar>
            <FileMenu onNew={onNew} onOpen={onOpen}
                      onGetFromGitHub={onGetFromGitHub} onUpdateFromGitHub={onUpdateFromGitHub} onSaveToGitHub={onSaveToGitHub} signedIn={signedIn}/>
            <InsertMenuWithButton onInsert={onMenuInsert} items={insertMenuItems('after', firstSelectedItemId)}/>
            <Button id='downloads' href='/downloads'>Downloads</Button>
            <Button id='help' color={'secondary'} onClick={onHelp}>Help</Button>
        </MenuBar>
    </Box>

    /* Note on position attributes: Scrollable elements have position = 'relative' so EditorController can calculate pointer position */
    return <ProjectContext.Provider value={project}>
        <Box display='flex' flexDirection='column' height='100%' width='100%' id='editorMain' position='relative'>
            {EditorHeader}
            <Box height='calc(100% - 49px)'>
                <Grid container columns={10} spacing={0} height='100%'>
                    <Grid item xs={4} id='navigationPanel' height='100%' overflow='scroll'
                          position='relative'/* see comment above */>
                        <AppStructureTree treeData={treeData(project)} onSelect={onSelectedItemsChange}
                                          selectedItemIds={selectedItemIds}
                                          onAction={onTreeAction} onInsert={onContextMenuInsert}
                                          insertMenuItemFn={insertMenuItems}
                                          actionsAvailableFn={actionsAvailable}
                                          onMove={onMove}/>
                    </Grid>
                    <Grid item xs={6} height='100%' overflow='scroll' sx={{borderLeft: '1px solid lightgray'}}
                          position='relative'/* see comment above */>
                        <Box id='propertyPanel' width='100%' paddingLeft={1}>
                            {propertyArea()}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            {helpVisible ?
                <Box flex='1' maxHeight='50%'>
                    <EditorHelpPanel onClose={noop}/>
                </Box> : null
            }
        </Box>
    </ProjectContext.Provider>
}

export const editorElement = () => document.getElementById('editorMain')
export const editorMenuPositionProps = {
    root: {sx: {position: 'absolute'}},
    backdrop: {sx: {position: 'absolute'}},
}