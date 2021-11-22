import Tree from 'rc-tree'
import React from 'react'
import {Key} from 'rc-tree/es/interface'
import 'rc-tree/assets/index.less'

export class ModelTreeItem {
    constructor(public id: string,
                public title: string,
                public children?: ModelTreeItem[]) {}
    get key() { return this.id }
}


export default function AppStructureTree({treeData, onSelect, selectedItemId}: {
    treeData: ModelTreeItem, onSelect?: (id: string) => void, selectedItemId?: string}) {

    function itemSelected(selectedKeys: Key[]) {
        const key = selectedKeys[0]?.toString()
        onSelect && key && onSelect(key)
    }

    return <Tree treeData={treeData.children}
                 draggable
                 selectedKeys={selectedItemId ? [selectedItemId] : []}
                 onSelect={itemSelected}>
    </Tree>
}
