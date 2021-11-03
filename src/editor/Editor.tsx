import React from 'react'
import App from '../model/App'
import Page from '../model/Page'
import Element from '../model/Element'
import AppStructureTree, {ModelTreeItem} from './AppStructureTree'


const treeData = (app: App): ModelTreeItem => {
    const treeNodeFromElement = (el: Element): ModelTreeItem => new ModelTreeItem(el.id, el.name)
    const treeFromPage = (page: Page): ModelTreeItem => new ModelTreeItem(page.id, page.name, page.elements.map(treeNodeFromElement))

    return new ModelTreeItem(app.id, app.name, app.pages.map(treeFromPage))
}

export default function Editor({app }: {app: App}) {
    return <div>
        <div>Elemento Studio</div>
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{width: '20%', height: 400}}>
                <AppStructureTree treeData={treeData(app)} onSelect={(id) => console.log('Selected', id)}/>
            </div>
            <div style={{width: '59%',}}>
                <div style={{backgroundColor: 'lightblue', width: '98%', margin: 'auto'}}>Running app</div>
            </div>
            <div style={{width: '20%',}}>
                <div style={{backgroundColor: 'lightblue', width: '100%'}}>Property area</div>
            </div>
        </div>
    </div>

}