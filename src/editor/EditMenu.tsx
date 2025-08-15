import {Action, ActionsAvailableFn, AppElementAction, ConfirmAction, InsertMenuItemsFn, OnActionFn, OnInsertFnWithPositionFn} from './Types'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import React, {useState} from 'react'
import {ListItemText, Menu, MenuItem, PopoverOrigin} from '@mui/material'
import ArrowRight from '@mui/icons-material/ArrowRight'
import {editorDialogContainer} from './EditorElement'
import {editorMenuPositionProps} from './Editor'
import {InsertMenu} from './InsertMenu'
import {startCase} from 'lodash'

export default function EditMenu({
                                     anchorEl,
                                     anchorOrigin,
                                     transformOrigin,
                                     labelledBy,
                                     selectedItemIds,
                                     clickedItemId,
                                     onAction,
                                     onInsert,
                                     onClose,
                                     actionsAvailableFn,
                                     itemNameFn,
                                     insertMenuItemFn,
                                 }: {
    anchorEl: HTMLElement | null,
    anchorOrigin: PopoverOrigin,
    transformOrigin: PopoverOrigin,
    labelledBy?: string,
    selectedItemIds: ElementId[],
    clickedItemId?: ElementId,
    onAction: OnActionFn,
    onInsert: OnInsertFnWithPositionFn,
    onClose: () => void,
    actionsAvailableFn: ActionsAvailableFn,
    itemNameFn: (id: ElementId) => string,
    insertMenuItemFn: InsertMenuItemsFn | null
}) {

    const [confirmingEl, setConfirmingEl] = useState<null | HTMLElement>(null)
    const [actionToConfirm, setActionToConfirm] = useState<null | Action>(null)
    const [insertMenuEl, setInsertMenuEl] = useState<null | HTMLElement>(null)
    const [insertionId, setInsertionId] = useState<null | ElementId>(null)

    const clickedOrSelectedIds: ElementId[] = clickedItemId ? [clickedItemId] : selectedItemIds ?? []

    const closeMenus = () => {
        setConfirmingEl(null)
        setActionToConfirm(null)
        setInsertMenuEl(null)
        setInsertionId(null)
        onClose()
    }

    const immediateAction = (action: AppElementAction) => {
        const details = actionDetails(action)
        onAction(details.ids as string[], action)
        closeMenus()
    }

    const showInsertMenu = (event: React.MouseEvent) => {
        setInsertMenuEl((event as React.MouseEvent<HTMLElement>).currentTarget)
        setInsertionId(clickedOrSelectedIds[0])
    }

    const insertConfirmed = (insertPosition: InsertPosition, targetItemId: ElementId, elementType: ElementType) => {
        onInsert(insertPosition, targetItemId, elementType)
        closeMenus()
    }

    const confirmAction = (event: React.MouseEvent, action: ConfirmAction) => {
        setConfirmingEl((event as React.MouseEvent<HTMLElement>).currentTarget)
        setActionToConfirm(actionDetails(action.name))
    }

    const actionConfirmed = () => {
        const action = actionToConfirm!.action
        const ids = actionToConfirm!.ids as ElementId[]
        onAction(ids, action)
        closeMenus()
    }

    const menuItems = (actions: AppElementAction[]) => {
        return actions.map(action => {
            const name = action.toString()
            const label = startCase(name)
            if (action instanceof ConfirmAction) {
                return <MenuItem key={name}
                                 onClick={(event: React.MouseEvent) => confirmAction(event, action)}>Delete</MenuItem>
            }
            if (action === 'insert' && insertMenuItemFn) {
                return <MenuItem onClick={(event: React.MouseEvent) => showInsertMenu(event)} key={'insert'}>
                    <ListItemText sx={{minWidth: 2}}>Insert</ListItemText><ArrowRight/>
                </MenuItem>
            }

            return <MenuItem onClick={() => immediateAction(action)} key={action}>{label}</MenuItem>
        })
    }

    function actionDetails(action: AppElementAction): Action {
        const selectedItemClicked = clickedItemId && selectedItemIds.includes(clickedItemId)
        const actionItemIds = !clickedItemId ? selectedItemIds : selectedItemClicked ? selectedItemIds : [clickedItemId] as string[]
        const actionItemNames = actionItemIds.map(itemNameFn)
        return {action, ids: actionItemIds, itemNames: actionItemNames}
    }

    const labelledByProps = labelledBy ? {'aria-labelledby': labelledBy} : {}

    const mainMenuOpen = Boolean(anchorEl)
    const confirmMenuOpen = mainMenuOpen && Boolean(confirmingEl)
    const insertMenuOpen = mainMenuOpen && Boolean(insertMenuEl)

    const mainMenuIfOpen = mainMenuOpen && (
        <Menu
            id="editMenu"
            data-testid="editMenu"
            anchorEl={anchorEl}
            anchorOrigin={anchorOrigin}
            transformOrigin={transformOrigin}
            open={true}
            onClose={closeMenus}
            MenuListProps={{dense: true, ...labelledByProps, sx: {paddingBottom: '1em'}}}
            container={editorDialogContainer()}
            slotProps={editorMenuPositionProps}
        >
            {menuItems(actionsAvailableFn(clickedOrSelectedIds))}
        </Menu>
    )

    const confirmMenuIfOpen = confirmMenuOpen && (
        <Menu
            id="tree-confirm-menu"
            anchorEl={confirmingEl}
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            transformOrigin={{vertical: 60, horizontal: 'left',}}
            open={confirmMenuOpen}
            MenuListProps={{dense: true}}
            onClose={closeMenus}
            container={editorDialogContainer()}
            slotProps={editorMenuPositionProps}
        >
            <MenuItem onClick={actionConfirmed}>Yes
                - {actionToConfirm!.action + ' ' + actionToConfirm!.itemNames.join(', ')}</MenuItem>
            <MenuItem onClick={onClose}>No - go back</MenuItem>
        </Menu>
    )

    const insertMenuIfOpen = insertMenuOpen &&
        <InsertMenu anchorEl={insertMenuEl}
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    transformOrigin={{vertical: 60, horizontal: 'left',}}
                    open={insertMenuOpen} onClose={closeMenus}
                    onInsert={insertConfirmed}
                    insertMenuItems={insertMenuItemFn!}
                    targetItemId={insertionId!}/>

    return <>
        {mainMenuIfOpen}
        {confirmMenuIfOpen}
        {insertMenuIfOpen}
    </>
}
