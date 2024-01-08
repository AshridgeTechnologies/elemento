import Tree, {TreeNodeProps} from 'rc-tree'
import React, {useState} from 'react'
import {DataNode, EventDataNode, Key} from 'rc-tree/es/interface'
import 'rc-tree/assets/index.less'
import {Icon, useTheme} from '@mui/material'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {elementOfType} from '../model/elements'
import {ActionsAvailableFn, OnActionFn, OnInsertFnWithPositionFn} from './Types'
import {flatten, union, without} from 'ramda'
import EditMenu from './EditMenu'

export class ModelTreeItem implements DataNode {
    constructor(public id: string,
                public title: string,
                public kind: ElementType,
                public children?: ModelTreeItem[]) {}
    get key() { return this.id }

    ancestorKeysOf = (id: Key | undefined): Key[] => {
        const hasChildWithId = this.children?.some( item => item.id === id)
        if (hasChildWithId) {
            return [this.id]
        }

        const childPathToId = this.children?.map( child => child.ancestorKeysOf(id)).find( result => result.length )
        if (childPathToId) {
            return [this.id, ...childPathToId]
        }

        return []
    }

    containsKey = (id: Key | undefined) => Boolean(this.ancestorKeysOf(id).length)

    findItem(id: string): ModelTreeItem | null {
        if (this.id === id) return this
        const childWithId = this.children?.map( child => child.findItem(id)).find( result => result !== null )
        return childWithId ?? null
    }
}

function TreeNodeIcon(color: string, props: TreeNodeProps) {
    const kind = (props.data as ModelTreeItem)!.kind
    const sx = { fontSize: 16, color }
    const elementClass = elementOfType(kind)
    const {iconClass} = elementClass
    return <Icon sx={sx}>{iconClass}</Icon>
}

export default function AppStructureTree({treeData, onSelect, selectedItemIds = [], onAction, onInsert,
                                             insertMenuItemFn, actionsAvailableFn, onMove}: {
    treeData: ModelTreeItem, onSelect?: (ids: string[]) => void, selectedItemIds?: string[],
    onAction: OnActionFn,
    insertMenuItemFn: (insertPosition: InsertPosition, targetElementId: ElementId) => ElementType[],
    actionsAvailableFn: ActionsAvailableFn,
    onInsert: OnInsertFnWithPositionFn,
    onMove: (insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) => void,
}) {

    const theme = useTheme()
    const [actionEl, setActionEl] = useState<null | HTMLElement>(null)
    const [actionNode, setActionNode] = useState<null | {id: string, name: string}>(null)
    const [expandedKeys, setExpandedKeys] = useState<Key[]>([])

    const showContextMenu = (event: React.MouseEvent, nodeId: React.Key,  nodeTitle: string) => {
        setActionEl((event as React.MouseEvent<HTMLElement>).currentTarget)
        setActionNode({id: nodeId.toString(), name: nodeTitle})
    }

    const closeContextMenu = () => {
        setActionEl(null)
        setActionNode(null)
    }

    const itemNameFn = (id:ElementId) => treeData.findItem(id)?.title ?? id
    function itemSelected(selectedKeys: Key[], info: any) {
        const selectedIds = selectedKeys.map(k => k.toString())
        const addToSelect = info.nativeEvent.metaKey || info.nativeEvent.ctrlKey
        const newSelectedIds = addToSelect ? selectedIds : without(selectedItemIds, selectedIds)
        onSelect?.(newSelectedIds)
    }

    const onExpand = (newExpandedKeys: Key[], {expanded, node}: {expanded: boolean, node: DataNode}) => {
        setExpandedKeys(newExpandedKeys)
        if (!expanded && (node as ModelTreeItem).containsKey(selectedItemIds[0])) {
            onSelect?.([node.key.toString()])
        }
    }

    const onDrop = ({node: dropNode, dragNode}: {node: EventDataNode<DataNode>, dragNode: EventDataNode<DataNode>}) => {
        const insertPosition: InsertPosition = dropNode.expanded ? 'inside' : 'after'
        const dragNodeIds = dragNode.selected ? selectedItemIds : [dragNode.key.toString()]
        onMove(insertPosition, dropNode.key.toString(), dragNodeIds)
    }

    const undraggables = ['Project', 'File', 'FileFolder']
    const canDrag = (node: DataNode) => !undraggables.includes((node as ModelTreeItem).kind)

    const alwaysShownKeys = flatten([treeData.ancestorKeysOf(selectedItemIds[0]), treeData.key, (treeData.children?? []).map( child => child.key )])

    const allExpandedKeys = union(expandedKeys, alwaysShownKeys)
    if (allExpandedKeys.length > expandedKeys.length) {
        setExpandedKeys(allExpandedKeys)
    }

    return <>
        <Tree treeData={[treeData] as DataNode[]}
            draggable={canDrag}
            multiple
            icon={TreeNodeIcon.bind(null, theme.palette.secondary.main)}
            selectedKeys={selectedItemIds}
            expandedKeys={expandedKeys}
            onSelect={itemSelected}
            onExpand={onExpand}
            // @ts-ignore
            onDrop={onDrop}
            onRightClick={({event, node}: { event: React.MouseEvent, node: EventDataNode<DataNode> }) => {
                showContextMenu(event, node.key, node.title as string)
            }}
            style={{fontFamily: theme.typography.fontFamily, fontSize: 14}}/>
        <EditMenu anchorEl={actionEl}
                  anchorOrigin={{vertical: 'top', horizontal: 'right',}}
                  transformOrigin={{vertical: 60, horizontal: 'left',}}
                  selectedItemIds={selectedItemIds} clickedItemId={actionNode?.id} onAction={onAction} onInsert={onInsert} onClose={closeContextMenu}
                  actionsAvailableFn={actionsAvailableFn} insertMenuItemFn={insertMenuItemFn} itemNameFn={itemNameFn}
        />
    </>
}
