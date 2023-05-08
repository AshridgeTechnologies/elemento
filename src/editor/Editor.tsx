import React, {useRef, useState} from 'react'
import App from '../model/App'

import Element from '../model/Element'
import AppStructureTree, {ModelTreeItem} from './AppStructureTree'
import PropertyEditor from './PropertyEditor'
import {
    AppElementAction,
    OnActionFn,
    OnChangeFn,
    OnExportFn,
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
import {generate, generateServerApp, generateTypes} from '../generator/Generator'
import Project from '../model/Project'
import {useSignedInState} from '../shared/authentication'
import PreviewPanel from './PreviewPanel'
import FirebasePublish from '../model/FirebasePublish'
import ServerApp from '../model/ServerApp'
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
    onExport,
    onSaveToGitHub,
    onGetFromGitHub,
    onUpdateFromGitHub,
    runUrl,
    previewUrl,
    selectedItemIds,
    onSelectedItemsChange
}: { project: Project, projectStoreName?: string, onChange: OnChangeFn, onInsert: OnInsertWithSelectedFn, onMove: OnMoveFn, onAction: OnActionFn,
                                    onOpen?: OnOpenFn, onExport?: OnExportFn, onNew?: OnNewFn,
                                    onSaveToGitHub: OnSaveToGitHubFn, onGetFromGitHub: OnGetFromGitHubFn, onUpdateFromGitHub?: OnUpdateFromGitHubFn,
                                    runUrl?: string, previewUrl?: string, selectedItemIds: string[], onSelectedItemsChange: (ids: string[]) => void}) {
    const firstSelectedItemId = selectedItemIds[0]
    const [helpVisible, setHelpVisible] = useState(false)
    const [firebaseConfigName, setFirebaseConfigName] = useState<string|null>(null)


    const getErrorsAndCode = (): [AllErrors, string] => {
        let code = '', errors: AllErrors = {}
        const apps = project.elementArray().filter( el => el.kind === 'App') as App[]
        apps.forEach( app => {
            const {errors: appErrors, code: appCode} = generate(app, project)
            code += appCode + '\n\n'
            errors = {...errors, ...appErrors}
        })

        const serverApps = project.elementArray().filter( el => el.kind === 'ServerApp') as ServerApp[]
        serverApps.forEach( app => {
            const {errors: appErrors} = generateServerApp(app)
            errors = {...errors, ...appErrors}
        })

        const {errors: typesErrors} = generateTypes(project)
        errors = {...errors, ...typesErrors}

        return [errors, code]
    }

    const [errors, allCode] = getErrorsAndCode()

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
    const EditorMenuBar = () => <MenuBar>
        <FileMenu onNew={onNew} onOpen={onOpen} onExport={onExport}
                  onGetFromGitHub={onGetFromGitHub} onUpdateFromGitHub={onUpdateFromGitHub} onSaveToGitHub={onSaveToGitHub} signedIn={signedIn}/>
        <InsertMenuWithButton onInsert={onMenuInsert} items={insertMenuItems('after', firstSelectedItemId)}/>
        <Button id='downloads' href='/downloads'>Downloads</Button>
        <Button id='help' color={'secondary'} onClick={onHelp}>Help</Button>
    </MenuBar>

    const appBarTitle = `Elemento Studio - ${projectStoreName}`
    const OverallAppBar = <Box flex='0'>
        <AppBar title={appBarTitle}/>
    </Box>
    const EditorHeader = <Box flex='0'>
        <EditorMenuBar/>
    </Box>

    return <ProjectContext.Provider value={project}>
    <Box display='flex' flexDirection='column' height='100%' width='100%'>
        {OverallAppBar}
        <Box flex='1' minHeight={0}>
            <Grid container columns={20} spacing={0} height='100%'>
                <Grid item xs={10} height='100%'>
                    {EditorHeader}
                    <Box display='flex' flexDirection='column' height='100%' width='100%'>
                        <Box flex='1' maxHeight={helpVisible ? '50%' : '100%'}>
                            <Grid container columns={10} spacing={0} height='100%'>
                                <Grid item xs={4} id='navigationPanel' height='100%' overflow='scroll'>
                                    <AppStructureTree treeData={treeData(project)} onSelect={onSelectedItemsChange}
                                        selectedItemIds={selectedItemIds}
                                                      onAction={onTreeAction} onInsert={onContextMenuInsert}
                                                      insertMenuItemFn={insertMenuItems}
                                                      actionsAvailableFn={actionsAvailable}
                                        onMove={onMove}/>
                                </Grid>
                                <Grid item xs={6} height='100%' overflow='scroll' sx={{borderLeft: '1px solid lightgray'}}>
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
                                 }}>{allCode}
                                    </pre>}
                    configName={firebaseConfigName} runUrl={runUrl}/>
                </Grid>
            </Grid>
        </Box>
    </Box>
    </ProjectContext.Provider>

}