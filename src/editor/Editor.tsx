import React, {useState} from 'react'
import App from '../model/App'
import Page from '../model/Page'
import Element from '../model/Element'
import AppStructureTree, {ModelTreeItem} from './AppStructureTree'
import PropertyEditor from './PropertyEditor'
import {OnChangeFn} from './Types'


const treeData = (app: App): ModelTreeItem => {
    const treeNodeFromElement = (el: Element): ModelTreeItem => new ModelTreeItem(el.id, el.name)
    const treeFromPage = (page: Page): ModelTreeItem => new ModelTreeItem(page.id, page.name, page.elementArray().map(treeNodeFromElement))

    return new ModelTreeItem(app.id, app.name, app.pages.map(treeFromPage))
}

export default function Editor({app, onChange }: {app: App, onChange: OnChangeFn}) {
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

    return <div>
        <div>Elemento Studio</div>
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{width: '20%', height: 400}}>
                <AppStructureTree treeData={treeData(app)} onSelect={setSelectedItemId}/>
            </div>
            <div style={{width: '59%',}}>
                <div style={{backgroundColor: 'lightblue', width: '98%', margin: 'auto'}}>
                    <iframe name='appFrame' src="/runtime/app.html"  style={{width: '100%', height: 600}}/>
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