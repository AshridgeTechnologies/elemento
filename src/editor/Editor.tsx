import React, {useEffect, useRef, useState} from 'react'
import App from '../model/App'
import Page from '../model/Page'
import Element from '../model/Element'
import AppStructureTree, {ModelTreeItem} from './AppStructureTree'
import PropertyEditor from './PropertyEditor'
import {OnChangeFn, OnInsertWithSelectedFn, OnOpenFn, OnSaveFn} from './Types'
import AppBar from './AppBar'
import MenuBar from './MenuBar'
import InsertMenu from './InsertMenu'
import {ElementType} from '../model/Types'
import {Button, Grid} from '@mui/material'
import HelpPanel from './HelpPanel'


const treeData = (app: App): ModelTreeItem => {
    const treeNodeFromElement = (el: Element): ModelTreeItem => new ModelTreeItem(el.id, el.name)
    const treeFromPage = (page: Page): ModelTreeItem => new ModelTreeItem(page.id, page.name, page.elementArray().map(treeNodeFromElement))

    return new ModelTreeItem(app.id, app.name, app.pages.map(treeFromPage))
}

export default function Editor({
                                   app,
                                   onChange,
                                   onInsert,
                                   onOpen,
                                   onSave
                               }: { app: App, onChange: OnChangeFn, onInsert: OnInsertWithSelectedFn, onOpen?: OnOpenFn, onSave?: OnSaveFn }) {
    const [selectedItemId, setSelectedItemId] = useState('')
    const [helpVisible, setHelpVisible] = useState(false)

    const propertyArea = () => {
        if (selectedItemId) {
            const element = app.findElement(selectedItemId)
            if (element) {
                return <PropertyEditor element={element} onChange={onChange}/>
            }
        }

        return null
    }

    const onMenuInsert = (elementType: ElementType) => {
        const newElementId = onInsert(selectedItemId, elementType)
        setSelectedItemId((newElementId))
    }

    const onHelp = () => setHelpVisible(!helpVisible)

    const appFrameRef = useRef<HTMLIFrameElement>(null);

    function setAppInAppFrame(): boolean {
        const appWindow = appFrameRef.current?.contentWindow
        if (appWindow) {
            const setAppFn = appWindow['setAppFromJSONString' as keyof Window];
            if (setAppFn) {
                setAppFn(JSON.stringify(app))
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


    return <div>
        <AppBar/>
        <MenuBar>
            <Button id='open' color={'primary'} onClick={onOpen}>Open</Button>
            <Button id='save' color={'primary'} onClick={onSave}>Save</Button>
            <InsertMenu onInsert={onMenuInsert}/>
            <Button id='help' color={'primary'} onClick={onHelp}>Help</Button>
        </MenuBar>
        <Grid container mt={1} columnSpacing={1}  height={800}>
            <Grid item xs={true}>
                <Grid container columns={10} spacing={1}>
                    <Grid item xs id='navigationPanel' height='100%' overflow='scroll'>
                        <AppStructureTree treeData={treeData(app)} onSelect={setSelectedItemId}
                                          selectedItemId={selectedItemId}/>
                    </Grid>
                    <Grid item xs={6} height='100%'>
                        <div style={{backgroundColor: 'lightblue', width: '98%', margin: 'auto'}}>
                            <iframe name='appFrame' src="/runtime/app.html" ref={appFrameRef}
                                    style={{width: '100%', height: 600}}/>
                        </div>
                    </Grid>
                    <Grid item xs height='100%' overflow='scroll'>
                        <div id='propertyPanel' style={{backgroundColor: 'lightblue', width: '100%'}}>
                            {propertyArea()}
                        </div>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={3} sx={{display: helpVisible ? 'block' : 'none'}}>
                <HelpPanel onHelp={onHelp} />
            </Grid>
        </Grid>
    </div>

}