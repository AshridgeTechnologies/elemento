import Tree, {TreeNodeProps} from 'rc-tree'
import React, {useState} from 'react'
import {BasicDataNode, DataNode, EventDataNode, Key} from 'rc-tree/es/interface'
import 'rc-tree/assets/index.less'
import {ListItemText, Menu, MenuItem, useTheme} from '@mui/material'
import {Crop75, DensitySmall, MoneyOutlined, Note, RectangleOutlined, Subject, ToggleOn, Web} from '@mui/icons-material'
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion'
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ViewListIcon from '@mui/icons-material/ViewList'
import MemoryIcon from '@mui/icons-material/Memory'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {AppElementAction} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {union, without} from 'ramda'
import {InsertMenu} from './InsertMenu'

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
}

function TreeNodeIcon(color: string, props: TreeNodeProps) {
    const kind = (props.data as ModelTreeItem)!.kind
    const sx = { fontSize: 16, color }
    switch (kind) {
    case 'Project': return <Web {...{sx}} />
    case 'App': return <Web {...{sx}} />
    case 'Page': return <Web {...{sx}} />
    case 'Layout': return <ViewModuleIcon {...{sx}} />
    case 'AppBar': return <WebAssetIcon {...{sx}} />
    case 'Text': return <Subject {...{sx}}/>
    case 'TextInput': return <RectangleOutlined {...{sx}}/>
    case 'NumberInput': return <MoneyOutlined {...{sx}}/>
    case 'SelectInput': return <DensitySmall {...{sx}}/>
    case 'TrueFalseInput': return <ToggleOn {...{sx}}/>
    case 'Button': return <Crop75 {...{sx}}/>
    case 'List': return <ViewListIcon {...{sx}}/>
    case 'Data': return <Note {...{sx}}/>
    case 'Collection': return <AutoAwesomeMotionIcon {...{sx}}/>
    case 'MemoryDataStore': return <MemoryIcon {...{sx}}/>
    case 'FileDataStore': return <InsertDriveFileIcon {...{sx}}/>
    default: throw new UnsupportedValueError(kind)
    }
}

type Action = {
    action: AppElementAction,
    id: string | number,
    itemName: string
}
type Insertion = {
    insertPosition: InsertPosition,
    id: ElementId
}

export default function AppStructureTree({treeData, onSelect, selectedItemIds = [], onAction, onInsert, insertMenuItemFn, onMove}: {
    treeData: ModelTreeItem, onSelect?: (ids: string[]) => void, selectedItemIds?: string[], onAction: (action: Action) => void,
    insertMenuItemFn: (insertPosition: InsertPosition, targetElementId: ElementId) => ElementType[],
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

    const confirmAction = (event: React.MouseEvent, action: AppElementAction) => {
        setConfirmingEl((event as React.MouseEvent<HTMLElement>).currentTarget)
        setActionToConfirm({action, id: actionNode!.id, itemName: actionNode!.name})
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

    const onDrop = ({node: dropNode, dragNode}: {node: EventDataNode, dragNode: EventDataNode}) => {
        console.log('drop', dragNode, dropNode)
        const insertPosition: InsertPosition = dropNode.expanded ? 'inside' : 'after'
        const dragNodeIds = dragNode.selected ? selectedItemIds : [dragNode.key.toString()]
        onMove(insertPosition, dropNode.key.toString(), dragNodeIds)
    }

    const canDrag = (node: DataNode) => (node as ModelTreeItem).kind !== 'Project'

    const allExpandedKeys = union(expandedKeys, treeData.ancestorKeysOf(selectedItemIds[0]))
    if (allExpandedKeys.length > expandedKeys.length) {
        setExpandedKeys(allExpandedKeys)
    }

    const insertMenuItem = (position: InsertPosition) => {
        const hasItemsToInsert = Boolean(insertMenuItemFn(position, actionNode!.id)?.length)
        return hasItemsToInsert ? (
            <MenuItem onClick={(event: React.MouseEvent) => showInsertMenu(event, position)}>
                <ListItemText sx={{minWidth: 2}}>Insert {position}</ListItemText><ArrowRightIcon/>
            </MenuItem>
        ) : null
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
            {insertMenuItem('before')}
            {insertMenuItem('after')}
            {insertMenuItem('inside')}
            <MenuItem onClick={(event: React.MouseEvent) => confirmAction(event, 'delete')}>Delete</MenuItem>
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
            <MenuItem onClick={actionConfirmed}>Yes - {actionToConfirm!.action} {actionToConfirm!.itemName}</MenuItem>
            <MenuItem onClick={closeMenus}>No - go back</MenuItem>
        </Menu>
    )

    const insertMenuIfOpen = insertMenuOpen && <InsertMenu anchorEl={insertMenuEl} anchorOrigin={{vertical: 'top', horizontal: 'right'}} open={insertMenuOpen} onClose={closeMenus}
                                                           items={insertMenuItemFn(insertion!.insertPosition, insertion!.id)}
                                                           onInsert={insertConfirmed}/>

    return <>
        <Tree treeData={[treeData] as BasicDataNode[]}
            draggable={canDrag}
            multiple
            icon={TreeNodeIcon.bind(null, theme.palette.secondary.main)}
            selectedKeys={selectedItemIds}
            expandedKeys={expandedKeys}
            onSelect={itemSelected}
            onExpand={onExpand}
            // @ts-ignore
            onDrop={onDrop}
            onRightClick={({event, node}: { event: React.MouseEvent, node: EventDataNode }) => {
                showContextMenu(event, node.key, 'this item')
            }}
            style={{fontFamily: theme.typography.fontFamily, fontSize: 14}}/>
        {contextMenuIfOpen}
        {confirmMenuIfOpen}
        {insertMenuIfOpen}
    </>
}
