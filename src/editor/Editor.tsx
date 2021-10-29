import React from 'react'
import App from '../model/App.js'
// import { SortableTreeWithoutDndContext as SortableTree } from 'react-sortable-tree'
import {UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider, TreeItemIndex, TreeItem} from 'react-complex-tree'
import Page from '../model/Page.js'
import Element from '../model/Element.js'


class ModelTreeItem {
    constructor(public id: string,
                public title: string,
                public children?: ModelTreeItem[]) {}
    allItems(): ModelTreeItem[] {
        return [this, ...(this.children ? this.children.map( item => item.allItems()).flat() : [])]
    }
}

const treeNodeFromElement = (el: Element): ModelTreeItem => new ModelTreeItem(el.id, el.name)

const treeFromPage = (page: Page): ModelTreeItem => new ModelTreeItem(page.id, page.name, page.elements.map(treeNodeFromElement))

const treeFrom = (app: App): ModelTreeItem => new ModelTreeItem(app.id, app.name, app.pages.map(treeFromPage))



function rctTreeData(rootItem: ModelTreeItem): Record<TreeItemIndex, TreeItem<string>> {
    const items: [string, TreeItem][] = rootItem.allItems().map( item => [item.id, {
        index: item.id,
        canMove: true,
        hasChildren: !!item.children,
        children: item.children ? item.children.map( item => item.id ) : [],
        data: item.title,
        canRename: true,
    }])

    items[0][0] = 'root'
    items[0][1].index = 'root'
    return Object.fromEntries(items)
}

export default function Editor({app }: {app: App}) {
    const treeData = treeFrom(app)
    const items = rctTreeData(treeData)

    return <div>
        <div>Elemento Studio</div>
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{width: '20%',  height: 400 }}>
                <UncontrolledTreeEnvironment
                    dataProvider={new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))}
                    getItemTitle={item => item.data}
                    viewState={{}}
                >
                    <Tree treeId="tree-1" rootItem="root" treeLabel="App Structure" />
                </UncontrolledTreeEnvironment>
            </div>
            <div style={{width: '59%', }}>
            </div>
            <div style={{width: '20%', }}>
            </div>
        </div>
    </div>

}