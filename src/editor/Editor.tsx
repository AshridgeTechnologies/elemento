import React, {useEffect, useRef, useState} from 'react'
import App from '../model/App'
import Page from '../model/Page'
import Element from '../model/Element'
import AppStructureTree, {ModelTreeItem} from './AppStructureTree'
import PropertyEditor from './PropertyEditor'
import {OnChangeFn, OnInsertWithSelectedFn, OnOpenFn, OnSaveFn, OnActionFn, AppElementAction} from './Types'
import AppBar from './AppBar'
import MenuBar from './MenuBar'
import InsertMenu from './InsertMenu'
import {ElementType} from '../model/Types'
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
import Generator from '../generator/Generator'
import {without} from 'ramda'
import Project from '../model/Project'


const treeData = (project: Project): ModelTreeItem => {
    const treeNodeFromElement = (el: Element): ModelTreeItem => {
        const children = el.elements?.map(treeNodeFromElement)
        return new ModelTreeItem(el.id, el.name, el.kind, children)
    }
    return treeNodeFromElement(project)
}

export default function Editor({project,
                                   onChange,
                                   onInsert,
                                   onAction,
                                   onOpen,
                                   onSave
                               }: { project: Project, onChange: OnChangeFn, onInsert: OnInsertWithSelectedFn, onAction: OnActionFn, onOpen?: OnOpenFn, onSave?: OnSaveFn }) {
    const [selectedItemId, setSelectedItemId] = useState('')
    const [helpVisible, setHelpVisible] = useState(false)

    const app = project.elementArray()[0] as App
    const {errors} = new Generator(app).output()

    const propertyArea = () => {
        if (selectedItemId) {
            const element = project.findElement(selectedItemId)
            if (element) {
                return <PropertyEditor element={element} onChange={onChange} errors={errors[element.id]}/>
            }
        }

        return null
    }

    function insertMenuItems() : ElementType[] {
        if (selectedItemId) {
            const element = app.findElement(selectedItemId)
            if (element) {
                const allItems = ['Text', 'TextInput', 'NumberInput','SelectInput', 'TrueFalseInput', 'Button', 'Data', 'Page'] as ElementType[]
                if (Page.is(element)) {
                    return allItems
                } else {
                    return without(['Page'], allItems) as ElementType[]
                }
            }
        }

        return []
    }

    const onMenuInsert = (elementType: ElementType) => {
        const newElementId = onInsert(selectedItemId, elementType)
        setSelectedItemId(newElementId)
    }

    const onHelp = () => setHelpVisible(!helpVisible)

    const onTreeAction = ({action, id}: { action: AppElementAction, id: string | number }) => { onAction(id.toString(), action)}

    const appFrameRef = useRef<HTMLIFrameElement>(null);

    function handleAppFrameClick(event: PointerEvent) {
        if (event.altKey) {
            const path = (event.target as HTMLElement).id
            const element = app.findElementByPath(path)
            if (element) {
                setSelectedItemId(element.id)
                event.preventDefault()
            }
        }
    }

    function setAppInAppFrame(): boolean {
        const appWindow = appFrameRef.current?.contentWindow
        if (appWindow) {
            const setAppFn = appWindow['setAppFromJSONString' as keyof Window]
            if (setAppFn) {
                setAppFn(JSON.stringify(app))
                const setEventListenerFn = appWindow['setAppEventListener' as keyof Window]
                if (setEventListenerFn) {
                    setEventListenerFn('click', handleAppFrameClick)
                    return true
                }
            }
        }

        return false
    }

    function highlightElementInAppFrame(id: string | null) {
        const appWindow = appFrameRef.current?.contentWindow
        if (appWindow) {
            const highlightFn = appWindow['highlightElement' as keyof Window];
            if (highlightFn) {
                highlightFn(id)
                return true
            }
        }

        return false

    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (setAppInAppFrame()) {
                clearInterval(interval)
            }
        }, 200)
    }, []);

    setAppInAppFrame()
    highlightElementInAppFrame(app.findElementPath(selectedItemId))

    const EditorMenuBar = () => <MenuBar>
        <FileMenu onOpen={onOpen} onSave={onSave}/>
        <InsertMenu onInsert={onMenuInsert} items={insertMenuItems()}/>
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

    return <Box display='flex' flexDirection='column' height='100%' width='100%'>
        <Box flex='0'>
            <AppBar/>
            <EditorMenuBar/>
        </Box>
        <Box flex='1' minHeight={0}>
            <Grid container columns={20} spacing={0} height='100%'>
                <Grid item xs={10} height='100%'>
                    <Box display='flex' flexDirection='column' height='100%' width='100%'>
                        <Box flex='1' maxHeight={helpVisible ? '50%' : '100%'}>
                            <Grid container columns={10} spacing={0} height='100%'>
                                <Grid item xs={2} id='navigationPanel' height='100%' overflow='scroll'>
                                    <AppStructureTree treeData={treeData(project)} onSelect={setSelectedItemId}
                                                      selectedItemId={selectedItemId} onAction={onTreeAction}/>
                                </Grid>
                                <Grid item xs={8} height='100%' overflow='scroll'>
                                    <Box id='propertyPanel' width='100%'>
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
                    <Box sx={{backgroundColor: '#ddd', padding: '20px', height: 'calc(100% - 40px)'}}>
                        <iframe name='appFrame' src="/runtime/app.html" ref={appFrameRef}
                                style={{width: '100%', height: '100%', border: 'none', backgroundColor: 'white'}}/>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    </Box>

}