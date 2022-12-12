import React, {useEffect, useRef, useState} from 'react'
import App from '../model/App'

import Element from '../model/Element'
import AppStructureTree, {ModelTreeItem} from './AppStructureTree'
import PropertyEditor from './PropertyEditor'
import {
    AppElementAction,
    OnActionFn,
    OnChangeFn,
    OnInsertWithSelectedFn,
    OnMoveFn,
    OnNewFn,
    OnOpenFn,
    OnPublishFn,
    OnExportFn
} from './Types'
import AppBar from '../shared/AppBar'
import MenuBar from './MenuBar'
import InsertMenuWithButton from './InsertMenuWithButton'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {elementTypes} from '../model/elements'

import {Box, Button, Grid} from '@mui/material'
import HelpPanel from './HelpPanel'
import WhatIsElemento from '../docs/overview/WhatIsElemento'
import ElementoStudio from '../docs/overview/ElementoStudio'
import Controls from '../docs/overview/Controls'
import Formulas from '../docs/overview/Formulas'
import ControlReference from '../docs/reference/ControlReference'
import FunctionReference from '../docs/reference/FunctionReference'
import FileMenu from './FileMenu'
import './splitPane.css'
import {generate} from '../generator/Generator'
import Project from '../model/Project'
import {useSignedInState} from '../shared/authentication'
import PreviewPanel from './PreviewPanel'
import FirebasePublish from '../model/FirebasePublish'

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
    onPublish
}: { project: Project, projectStoreName?: string, onChange: OnChangeFn, onInsert: OnInsertWithSelectedFn, onMove: OnMoveFn, onAction: OnActionFn,
                                    onOpen?: OnOpenFn, onExport?: OnExportFn, onNew?: OnNewFn, onPublish?: OnPublishFn }) {
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
    const firstSelectedItemId = selectedItemIds[0]
    const [helpVisible, setHelpVisible] = useState(false)
    const [firebaseConfig, setFirebaseConfig] = useState<object|null>(null)
    const [firebaseConfigName, setFirebaseConfigName] = useState<string|null>(null)

    const app = project.elementArray().find( el => el.kind === 'App') as App
    const {errors, code: appCode} = generate(app, project)

    const propertyArea = () => {
        if (firstSelectedItemId) {
            const element = project.findElement(firstSelectedItemId)
            if (element) {
                return <PropertyEditor element={element} onChange={onChange} errors={errors[element.id]}/>
            }
        }

        return null
    }

    function insertMenuItems(insertPosition: InsertPosition, targetItemId: ElementId): ElementType[] {
        return allElementTypes.filter( type => project.canInsert(insertPosition, targetItemId, type))
    }

    const onMenuInsert = (elementType: ElementType) => {
        const newElementId = onInsert('after', firstSelectedItemId, elementType)
        setSelectedItemIds([newElementId])
    }

    const onContextMenuInsert = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType) => {
        const newElementId = onInsert(insertPosition, targetElementId, elementType)
        setSelectedItemIds([newElementId])
    }

    const onHelp = () => setHelpVisible(!helpVisible)

    const onTreeAction = ({action, ids}: { action: AppElementAction, ids: (string | number)[] }) => {
        onAction(ids.map( id => id.toString()), action)
    }


    function handleComponentSelected(id: string) {
        const listItemIdRegExp = /\.#[^.]+/g
        const idWithoutIndexes = id.replace(listItemIdRegExp, '')

        const element = app.findElementByPath(idWithoutIndexes)
        if (element) {
            setSelectedItemIds([element.id])
        }
    }

    const appFrameRef = useRef<HTMLIFrameElement>(null)

    function setAppInAppFrame(appCode: string, firebaseConfig: object | null): boolean {
        const appWindow = appFrameRef.current?.contentWindow
        if (appWindow) {
            // @ts-ignore  -- https://github.com/facebook/react/issues/18945#issuecomment-630421386
            appWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
            const setAppCode = appWindow['setAppCode' as keyof Window]
            if (setAppCode) {
                setAppCode(appCode)
                if (firebaseConfig) {
                    const setAppFirebaseConfig = appWindow['setFirebaseConfig' as keyof Window]
                    if (setAppFirebaseConfig) {
                        setAppFirebaseConfig(firebaseConfig)
                    }
                }
                const setEventListenerFn = appWindow['setComponentSelectedListener' as keyof Window]
                if (setEventListenerFn) {
                    setEventListenerFn(handleComponentSelected)
                    return true
                }
            }
        }

        return false
    }

    function highlightElementInAppFrame(id: string | null) {
        const appWindow = appFrameRef.current?.contentWindow
        if (appWindow) {
            const highlightFn = appWindow['highlightElement' as keyof Window]
            if (highlightFn) {
                highlightFn(id)
                return true
            }
        }

        return false
    }

    const firebasePublishForPreview = project.findChildElements(FirebasePublish)[0]
    const projectFirebaseConfigName = firebasePublishForPreview?.name

    if (projectFirebaseConfigName && projectFirebaseConfigName !== firebaseConfigName) {
        firebasePublishForPreview.getConfig(project).then( config => {
            console.log('Using firebase config', config)
            setFirebaseConfig(config)
            setFirebaseConfigName(projectFirebaseConfigName)
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (setAppInAppFrame(appCode, firebaseConfig)) {
                clearInterval(interval)
            }
        }, 200)
    }, [])

    setAppInAppFrame(appCode, firebaseConfig)
    highlightElementInAppFrame(app.findElementPath(firstSelectedItemId))

    const signedIn = useSignedInState()

    const onPublishMenu = () => {
        if (onPublish) {
            const name = app.name
            const code = generate(app, project).code
            onPublish({name, code})
        }
    }

    const EditorMenuBar = () => <MenuBar>
        <FileMenu onNew={onNew} onOpen={onOpen} onExport={onExport} onPublish={onPublishMenu} signedIn={signedIn}/>
        <InsertMenuWithButton onInsert={onMenuInsert} items={insertMenuItems('after', firstSelectedItemId)}/>
        <Button id='help' color={'secondary'} onClick={onHelp}>Help</Button>
    </MenuBar>

    const EditorHelpPanel = () => <HelpPanel onClose={onHelp}>
        <WhatIsElemento/>
        <ElementoStudio/>
        <Controls/>
        <Formulas/>
        <ControlReference/>
        <FunctionReference/>
    </HelpPanel>

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
                                    <AppStructureTree treeData={treeData(project)} onSelect={setSelectedItemIds}
                                        selectedItemIds={selectedItemIds} onAction={onTreeAction} onInsert={onContextMenuInsert} insertMenuItemFn={insertMenuItems}
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
                                <EditorHelpPanel/>
                            </Box> : null
                        }
                    </Box>
                </Grid>
                <Grid item xs={10} height='100%' overflow='scroll'>
                    <PreviewPanel preview={
                        <Box sx={{backgroundColor: '#ddd', padding: '20px', height: 'calc(100% - 40px)'}}>
                        <iframe name='appFrame' src="/run/editorPreview" ref={appFrameRef}
                                                      style={{width: '100%', height: '100%', border: 'none', backgroundColor: 'white'}}/>
                        </Box>}
                                  code={<pre style={{
                                     fontSize: 12,
                                     lineHeight: 1.5,
                                     fontFamily: 'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New'
                                 }}>{appCode}
                                    </pre>}
                    configName={firebaseConfigName}/>
                </Grid>
            </Grid>
        </Box>
    </Box>
    </ProjectContext.Provider>

}