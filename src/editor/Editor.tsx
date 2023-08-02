import React, {useRef, useState} from 'react'

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
import AppBar from '../shared/AppBar'
import MenuBar from './MenuBar'
import InsertMenuWithButton from './InsertMenuWithButton'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {elementTypes} from '../model/elements'

import {Box, Button, Grid} from '@mui/material'
import FileMenu from './FileMenu'
import './splitPane.css'
import Project from '../model/Project'
import {useSignedInState} from '../shared/authentication'
import PreviewPanel from './PreviewPanel'
import FirebasePublish from '../model/FirebasePublish'
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
    projectStoreName = project.name,
    onChange,
    onInsert,
    onMove,
    onAction,
    onNew,
    onOpen,
    onSaveToGitHub,
    onGetFromGitHub,
    onUpdateFromGitHub,
    runUrl,
    previewUrl,
    selectedItemIds,
    onSelectedItemsChange,
    errors,
    previewCode
}: { project: Project, projectStoreName?: string, onChange: OnChangeFn, onInsert: OnInsertWithSelectedFn, onMove: OnMoveFn, onAction: OnActionFn,
                                    onOpen?: OnOpenFn, onNew?: OnNewFn,
                                    onSaveToGitHub: OnSaveToGitHubFn, onGetFromGitHub: OnGetFromGitHubFn, onUpdateFromGitHub?: OnUpdateFromGitHubFn,
                                    runUrl?: string, previewUrl?: string, selectedItemIds: string[], onSelectedItemsChange: (ids: string[]) => void,
                                    errors: AllErrors, previewCode: string}) {
    const firstSelectedItemId = selectedItemIds[0]
    const [helpVisible, setHelpVisible] = useState(false)
    const [firebaseConfigName, setFirebaseConfigName] = useState<string|null>(null)

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
    const appFrameRef = useRef<HTMLIFrameElement>(null)
    const firebasePublishForPreview = project.findChildElements(FirebasePublish)[0]
    const projectFirebaseConfigName = firebasePublishForPreview?.name

    if (projectFirebaseConfigName && projectFirebaseConfigName !== firebaseConfigName) {
        setFirebaseConfigName(projectFirebaseConfigName)
    }
    const signedIn = useSignedInState()
    const appBarTitle = `Elemento Studio - ${projectStoreName}`
    const OverallAppBar = <Box flex='0'>
        <AppBar title={appBarTitle}/>
    </Box>
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
    <Box display='flex' flexDirection='column' height='100%' width='100%'>
        {OverallAppBar}
        <Box flex='1' minHeight={0}>
            <Grid container columns={20} spacing={0} height='100%'>
                <Grid item xs={10} height='100%'>
                    <Box display='flex' flexDirection='column' height='100%' width='100%' id='editorMain' position='relative'>
                        {EditorHeader}
                        <Box height='calc(100% - 49px)'>
                            <Grid container columns={10} spacing={0} height='100%'>
                                <Grid item xs={4} id='navigationPanel' height='100%' overflow='scroll'  position='relative'/* see comment above */>
                                    <AppStructureTree treeData={treeData(project)} onSelect={onSelectedItemsChange}
                                        selectedItemIds={selectedItemIds}
                                                      onAction={onTreeAction} onInsert={onContextMenuInsert}
                                                      insertMenuItemFn={insertMenuItems}
                                                      actionsAvailableFn={actionsAvailable}
                                        onMove={onMove}/>
                                </Grid>
                                <Grid item xs={6} height='100%' overflow='scroll' sx={{borderLeft: '1px solid lightgray'}}  position='relative'/* see comment above */>
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
                        <svg viewBox='11.8 9 16 22' className='pointer' id='editorPointer'
                             style={{width: '25px', top: 0, left: 0, position: 'absolute', zIndex: 2000, opacity: '0'}}>
                            <path d='M20,21l4.5,8l-3.4,2l-4.6-8.1L12,29V9l16,12H20z'></path>
                        </svg>
                    </Box>
                </Grid>
                <Grid item xs={10} height='100%' overflow='scroll'>
                    <PreviewPanel preview={
                        <Box sx={{backgroundColor: '#ddd', padding: '20px', height: 'calc(100% - 40px)'}}>
                        <iframe name='appFrame' src={previewUrl} ref={appFrameRef}
                                                      style={{width: '100%', height: '100%', border: 'none', backgroundColor: 'white'}}/>
                        </Box>}
                                  code={<pre style={{
                                     fontSize: 12,
                                     lineHeight: 1.5,
                                     fontFamily: 'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New'
                                 }}>{previewCode}
                                    </pre>}
                    configName={firebaseConfigName} runUrl={runUrl}/>
                </Grid>
            </Grid>
        </Box>
    </Box>
    </ProjectContext.Provider>

}

export const editorElement = () => document.getElementById('editorMain')
export const editorPointerElement = () => document.getElementById('editorPointer')
export const editorMenuPositionProps = {
    root: {sx: {position: 'absolute'}},
    backdrop: {sx: {position: 'absolute'}},
}