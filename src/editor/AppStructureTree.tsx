import Tree, {TreeNodeProps} from 'rc-tree'
import React from 'react'
import {BasicDataNode, Key} from 'rc-tree/es/interface'
import 'rc-tree/assets/index.less'
import {useTheme} from '@mui/material'
import {Web, Subject, RectangleOutlined} from '@mui/icons-material'
import {ElementType} from '../model/Types'

export class ModelTreeItem {
    constructor(public id: string,
                public title: string,
                public kind: ElementType,
                public children?: ModelTreeItem[]) {}
    get key() { return this.id }
}

function TreeNodeIcon(color: string, props: TreeNodeProps) {
    const kind = (props.data as ModelTreeItem)!.kind
    const sx = { fontSize: 16, color }
    switch (kind) {
        case 'Page': return <Web {...{sx}} />
        case 'Text': return <Subject {...{sx}}/>
        case 'TextInput': return <RectangleOutlined {...{sx}}/>
        default: throw new Error(`Unknown element kind for icon: ${kind}`)
    }
}

export default function AppStructureTree({treeData, onSelect, selectedItemId}: {
    treeData: ModelTreeItem, onSelect?: (id: string) => void, selectedItemId?: string}) {

    const theme = useTheme()
    function itemSelected(selectedKeys: Key[]) {
        const key = selectedKeys[0]?.toString()
        onSelect && key && onSelect(key)
    }

    return <Tree treeData={treeData.children as BasicDataNode[]}
                 draggable
                 icon={TreeNodeIcon.bind(null, theme.palette.secondary.main)}
                 selectedKeys={selectedItemId ? [selectedItemId] : []}
                 onSelect={itemSelected}
                 style={{fontFamily: theme.typography.fontFamily, fontSize: 14}}/>
}
