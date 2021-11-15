import Tree from 'rc-tree'
import React from 'react'
import {Key} from 'rc-tree/es/interface'

export class ModelTreeItem {
    constructor(public id: string,
                public title: string,
                public children?: ModelTreeItem[]) {}
    allItems(): ModelTreeItem[] {
        return [this, ...(this.children ? this.children.map( item => item.allItems()).flat() : [])]
    }
    get key() { return this.id }
}


export default function AppStructureTree({treeData, onSelect}: {
    treeData: ModelTreeItem, onSelect?: (id: string) => void}) {

    function itemSelected(selectedKeys: Key[]) {
        const key = selectedKeys[0]?.toString()
        onSelect && key && onSelect(key)
    }

    return <Tree treeData={treeData.children}
                 draggable
                 onSelect={itemSelected}>
    </Tree>
}
