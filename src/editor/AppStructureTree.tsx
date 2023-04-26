import Tree, {TreeNodeProps} from 'rc-tree'
import React, {createElement, useState} from 'react'
import {DataNode, EventDataNode, Key} from 'rc-tree/es/interface'
import 'rc-tree/assets/index.less'
import {Icon, ListItemText, Menu, MenuItem, useTheme} from '@mui/material'
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {elementOfType} from '../model/elements'
import {AppElementAction, ConfirmAction, InsertAction} from './Types'
import {flatten, union, without} from 'ramda'
import {InsertMenu} from './InsertMenu'
import lodash from 'lodash'; const {startCase} = lodash;

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

type Action = {
    action: AppElementAction,
    ids: (string | number)[],
    itemNames: string[]
}
type Insertion = {
    insertPosition: InsertPosition,
    id: ElementId
}

type ActionsAvailableFn = (targetElementId: ElementId) => AppElementAction[]
export default function AppStructureTree({treeData, onSelect, selectedItemIds = [], onAction, onInsert,
                                             insertMenuItemFn, actionsAvailableFn, onMove}: {
    treeData: ModelTreeItem, onSelect?: (ids: string[]) => void, selectedItemIds?: string[], onAction: (action: Action) => void,
    insertMenuItemFn: (insertPosition: InsertPosition, targetElementId: ElementId) => ElementType[],
    actionsAvailableFn: ActionsAvailableFn
    onInsert: (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType) => void,
    onMove: (insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) => void,
}) {

    const theme = useTheme()
    const [actionEl, setActionEl] = useState<null | HTMLElement>(null)
    const [actionNode, setActionNode] = useState<null | {id: string, name: string}>(null)
    const [confirmingEl, setConfirmingEl] = useState<null | HTMLElement>(null)
    const [insertMenuEl, setInsertMenuEl] = useState<null | HTMLElement>(null)
    const [actionToConfirm, setActionToConfirm] = useState<null | Action>(null)
    const [insertion, setInsertion] = useState<null | Insertion>(null)
    const [expandedKeys, setExpandedKeys] = useState<Key[]>([])
    const contextMenuOpen = Boolean(actionEl)
    const confirmMenuOpen = Boolean(confirmingEl)
    const insertMenuOpen = Boolean(insertMenuEl)

    const showContextMenu = (event: React.MouseEvent, nodeId: string | number,  nodeTitle: string) => {
        setActionEl((event as React.MouseEvent<HTMLElement>).currentTarget)
        setActionNode({id: nodeId.toString(), name: nodeTitle})
    }

    function actionToPerform(action: AppElementAction) {
        const clickedId = actionNode!.id
        const selectedItemClicked = selectedItemIds.includes(clickedId)
        const actionItemIds = selectedItemClicked ? selectedItemIds : [clickedId]
        const actionItemNames = actionItemIds.map(id => treeData.findItem(id)?.title ?? id)
        return {action, ids: actionItemIds, itemNames: actionItemNames}
    }

    const showInsertMenu = (event: React.MouseEvent, insertPosition: InsertPosition) => {
        setInsertMenuEl((event as React.MouseEvent<HTMLElement>).currentTarget)
        setInsertion({insertPosition, id: actionNode!.id})
    }

    const actionConfirmed = () => {
        onAction(actionToConfirm!)
        closeMenus()
    }

    const insertConfirmed = (elementType: ElementType) => {
        onInsert(insertion!.insertPosition, insertion!.id, elementType)
        closeMenus()
    }

    const closeMenus = () => {
        setActionEl(null)
        setActionNode(null)
        setConfirmingEl(null)
        setInsertMenuEl(null)
        setActionToConfirm(null)
    }

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
    const insertMenuItem = (position: InsertPosition) => {
        const hasItemsToInsert = Boolean(insertMenuItemFn(position, actionNode!.id)?.length)
        return hasItemsToInsert ? (
            <MenuItem onClick={(event: React.MouseEvent) => showInsertMenu(event, position)} key={'insert_' + position}>
                <ListItemText sx={{minWidth: 2}}>Insert {position}</ListItemText><ArrowRightIcon/>
            </MenuItem>
        ) : null
    }

    const confirmAction = (event: React.MouseEvent, action: ConfirmAction) => {
        setConfirmingEl((event as React.MouseEvent<HTMLElement>).currentTarget)
        setActionToConfirm(actionToPerform(action.name))
    }

    const immediateAction = (action: AppElementAction) => {
        onAction(actionToPerform(action))
        closeMenus()
    }

    const menuItems = (actions: AppElementAction[]) => {
        return actions.map( action => {
            const name = action.toString()
            const label = startCase(name)
            if (action instanceof ConfirmAction) {
                return <MenuItem key={name} onClick={(event: React.MouseEvent) => confirmAction(event, action)} >Delete</MenuItem>
            }
            if (action instanceof InsertAction) {
                return insertMenuItem(action.position)
            }

            return <MenuItem onClick={() => immediateAction(action)} key={action}>{label}</MenuItem>
        })
    }

    const contextMenuIfOpen = contextMenuOpen && (
        <Menu
            id="tree-context-menu"
            anchorEl={actionEl}
            open={contextMenuOpen}
            onClose={closeMenus}
            anchorOrigin={{vertical: 'top', horizontal: 'right',}}
            transformOrigin={{vertical: 'top', horizontal: 'left',}}
        >
            {menuItems(actionsAvailableFn(actionNode!.id))}
        </Menu>
    )

    const confirmMenuIfOpen = confirmMenuOpen && (
        <Menu
            id="tree-confirm-menu"
            anchorEl={confirmingEl}
            open={confirmMenuOpen}
            onClose={closeMenus}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <MenuItem onClick={actionConfirmed}>Yes - {actionToConfirm!.action + ' ' + actionToConfirm!.itemNames.join(', ')}</MenuItem>
            <MenuItem onClick={closeMenus}>No - go back</MenuItem>
        </Menu>
    )

    const insertMenuIfOpen = insertMenuOpen && <InsertMenu anchorEl={insertMenuEl} anchorOrigin={{vertical: 'top', horizontal: 'right'}} open={insertMenuOpen} onClose={closeMenus}
                                                           items={insertMenuItemFn(insertion!.insertPosition, insertion!.id)}
                                                           onInsert={insertConfirmed}/>

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
        {contextMenuIfOpen}
        {confirmMenuIfOpen}
        {insertMenuIfOpen}
    </>
}
