import Tree, {TreeNode, TreeNodeProps} from 'rc-tree'
import React, {useState} from 'react'
import {DataNode, EventDataNode, Key} from 'rc-tree/es/interface'
import 'rc-tree/assets/index.less'
import './appStructureTree.css'
import {Icon, useTheme} from '@mui/material'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {ActionsAvailableFn, InsertMenuItemsFn, OnActionFn, OnInsertFnWithPositionFn} from './Types'
import {flatten, union, without} from 'ramda'
import EditMenu from './EditMenu'

export class ModelTreeItem implements DataNode {
    constructor(public id: string,
                public title: string,
                public kind: ElementType,
                public iconClass: string,
                public hasErrors: boolean = false, public children?: ModelTreeItem[]) {}
    get key() { return this.id }
    get className() { return `${this.hasErrors ? 'rc-tree-error' : ''} ${this.hasChildErrors() ? 'rc-tree-child-error' : ''}`.trim()}

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

    hasChildErrors(): boolean {
        return (this.children ?? []).some( item => item.hasErrors || item.hasChildErrors())
    }
}

function TreeNodeIcon(color: string, props: TreeNodeProps) {
    // @ts-ignore
    const iconClass = (props.data.data as ModelTreeItem).iconClass
    const sx = { fontSize: 16, color }
    return <Icon sx={sx}>{iconClass}</Icon>
}

const asTreeNode = (modelItem: ModelTreeItem) => {
    const {key, title, className, children} = modelItem
    const hasChildren = children && children.length > 0
    return <TreeNode key={key} title={title} isLeaf={!hasChildren} data={modelItem} className={className}>
        {children?.map(asTreeNode)}
    </TreeNode>
}

export default function AppStructureTree({treeData, onSelect, selectedItemIds = [], onAction, onInsert,
                                             insertMenuItemFn, actionsAvailableFn, onMove}: {
    treeData: ModelTreeItem, onSelect?: (ids: string[]) => void, selectedItemIds?: string[],
    onAction: OnActionFn,
    insertMenuItemFn: InsertMenuItemsFn,
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
        const clickedId = info.node.key
        const addOrRemove = info.nativeEvent.metaKey || info.nativeEvent.ctrlKey
        if (addOrRemove) {
            const selectedIds = selectedKeys.map(k => k.toString())
            const newSelectedIds = addOrRemove ? selectedIds : without(selectedItemIds, selectedIds)
            onSelect?.(newSelectedIds)
        } else {
            onSelect?.([clickedId])
        }
    }

    const onExpand = (newExpandedKeys: Key[], {expanded, node}: {expanded: boolean, node: DataNode}) => {
        setExpandedKeys(newExpandedKeys)
        const nodeData = (node as TreeNodeProps).data  // if supply child nodes Tree passes the node props
        if (!expanded && (nodeData as ModelTreeItem).containsKey(selectedItemIds[0])) {
            onSelect?.([nodeData!.key.toString()])
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
        <Tree //treeData={[treeData] as DataNode[]}
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
            style={{fontFamily: theme.typography.fontFamily, fontSize: 14}}>
            {[asTreeNode(treeData)]}
        </Tree>
        <EditMenu anchorEl={actionEl}
                  anchorOrigin={{vertical: 'top', horizontal: 'right',}}
                  transformOrigin={{vertical: 'bottom', horizontal: 'left',}}
                  selectedItemIds={selectedItemIds} clickedItemId={actionNode?.id} onAction={onAction} onInsert={onInsert} onClose={closeContextMenu}
                  actionsAvailableFn={actionsAvailableFn} insertMenuItemFn={insertMenuItemFn} itemNameFn={itemNameFn}
        />
    </>
}
