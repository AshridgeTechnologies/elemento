import {StaticTreeDataProvider, Tree, TreeItem, TreeItemIndex, UncontrolledTreeEnvironment} from 'react-complex-tree'
import React from 'react'

export class ModelTreeItem {
    constructor(public id: string,
                public title: string,
                public children?: ModelTreeItem[]) {}
    allItems(): ModelTreeItem[] {
        return [this, ...(this.children ? this.children.map( item => item.allItems()).flat() : [])]
    }
}

export default function AppStructureTree({treeData}: {treeData: ModelTreeItem}) {
    const items = rctTreeData(treeData)
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

    return <UncontrolledTreeEnvironment
        dataProvider={new StaticTreeDataProvider(items, (item, data) => ({...item, data}))}
        getItemTitle={item => item.data}
        viewState={{}}
    >
        <Tree treeId="tree-1" rootItem="root" treeLabel="App Structure"/>
    </UncontrolledTreeEnvironment>
}
