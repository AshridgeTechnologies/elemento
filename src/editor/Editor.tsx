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
import {Button} from '@mui/material'


const treeData = (app: App): ModelTreeItem => {
    const treeNodeFromElement = (el: Element): ModelTreeItem => new ModelTreeItem(el.id, el.name)
    const treeFromPage = (page: Page): ModelTreeItem => new ModelTreeItem(page.id, page.name, page.elementArray().map(treeNodeFromElement))

    return new ModelTreeItem(app.id, app.name, app.pages.map(treeFromPage))
}

export default function Editor({app, onChange, onInsert, onOpen, onSave }: {app: App, onChange: OnChangeFn, onInsert: OnInsertWithSelectedFn, onOpen?: OnOpenFn, onSave?: OnSaveFn}) {
    const [selectedItemId, setSelectedItemId] = useState('');

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
        const interval = setInterval( () => {
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
        </MenuBar>
        <div style={{display: 'flex', flexDirection: 'row', marginTop: 15}}>
            <div style={{width: '20%', height: 400}}>
                <AppStructureTree treeData={treeData(app)} onSelect={setSelectedItemId} selectedItemId={selectedItemId}/>
            </div>
            <div style={{width: '59%',}}>
                <div style={{backgroundColor: 'lightblue', width: '98%', margin: 'auto'}}>
                    <iframe name='appFrame' src="/runtime/app.html" ref={appFrameRef} style={{width: '100%', height: 600}}/>
                </div>
            </div>
            <div style={{width: '20%',}}>
                <div style={{backgroundColor: 'lightblue', width: '100%'}}>
                    {propertyArea()}
                </div>
            </div>
        </div>
    </div>

}