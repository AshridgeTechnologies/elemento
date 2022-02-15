import Tree, {TreeNodeProps} from 'rc-tree'
import React from 'react'
import {BasicDataNode, EventDataNode, Key} from 'rc-tree/es/interface'
import 'rc-tree/assets/index.less'
import {Menu, MenuItem, useTheme} from '@mui/material'
import {Crop75, RectangleOutlined, MoneyOutlined, Subject, ToggleOn, Web} from '@mui/icons-material'
import {ElementType} from '../model/Types'
import {AppElementAction} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'

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
        case 'App': return <Web {...{sx}} />
        case 'Page': return <Web {...{sx}} />
        case 'Text': return <Subject {...{sx}}/>
        case 'TextInput': return <RectangleOutlined {...{sx}}/>
        case 'NumberInput': return <MoneyOutlined {...{sx}}/>
        case 'TrueFalseInput': return <ToggleOn {...{sx}}/>
        case 'Button': return <Crop75 {...{sx}}/>
        default: throw new UnsupportedValueError(kind)
    }
}

type Action = {
    action: AppElementAction,
    id: string | number,
    itemName: string
}

export default function AppStructureTree({treeData, onSelect, selectedItemId, onAction}: {
    treeData: ModelTreeItem, onSelect?: (id: string) => void, selectedItemId?: string, onAction: (action: Action) => void}) {

    const theme = useTheme()
    const [actionEl, setActionEl] = React.useState<null | HTMLElement>(null);
    const [actionNode, setActionNode] = React.useState<null | {id: string, name: string}>(null);
    const [confirmingEl, setConfirmingEl] = React.useState<null | HTMLElement>(null);
    const [actionToConfirm, setActionToConfirm] = React.useState<null | Action>(null);
    const contextMenuOpen = Boolean(actionEl)
    const confirmMenuOpen = Boolean(confirmingEl)

    const showContextMenu = (event: React.MouseEvent, nodeId: string | number,  nodeTitle: string) => {
        setActionEl((event as React.MouseEvent<HTMLElement>).currentTarget)
        setActionNode({id: nodeId.toString(), name: nodeTitle})
    }

    const confirmAction = (event: React.MouseEvent, action: AppElementAction) => {
        setConfirmingEl((event as React.MouseEvent<HTMLElement>).currentTarget)
        setActionToConfirm({action, id: actionNode!.id, itemName: actionNode!.name})
    }

    const actionConfirmed = () => {
        onAction(actionToConfirm!)
        closeMenus()
    }

    const closeMenus = () => {
        setActionEl(null)
        setActionNode(null)
        setConfirmingEl(null)
        setActionToConfirm(null)
    }

    function itemSelected(selectedKeys: Key[]) {
        const key = selectedKeys[0]?.toString()
        onSelect && key && onSelect(key)
    }

    return <>
        <Tree treeData={treeData.children as BasicDataNode[]}
                 draggable
                 icon={TreeNodeIcon.bind(null, theme.palette.secondary.main)}
                 selectedKeys={selectedItemId ? [selectedItemId] : []}
                 onSelect={itemSelected}
                 onRightClick={({event, node}: { event: React.MouseEvent, node: EventDataNode }) => {
                    showContextMenu(event, node.key, 'this item')
                 }}
                 style={{fontFamily: theme.typography.fontFamily, fontSize: 14}}/>
        {
            contextMenuOpen && (
                <Menu
                    id="tree-context-menu"
                    anchorEl={actionEl}
                    open={contextMenuOpen}
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
                    <MenuItem onClick={(event: React.MouseEvent) => confirmAction(event, 'delete')}>Delete</MenuItem>
                </Menu>
            )
        }
        {
            confirmMenuOpen && (
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
        }
        </>
}
