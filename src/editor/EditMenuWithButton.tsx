import * as React from 'react'
import Button from '@mui/material/Button'
import {ActionsAvailableFn, AppElementAction, OnActionFn} from './Types'
import {ElementId} from '../model/Types'
import EditMenu from './EditMenu'
import {noop} from '../util/helpers'

export default function EditMenuWithButton({onAction, actionsAvailableFn, selectedItemIds, itemNameFn}: {
    onAction: OnActionFn,
    actionsAvailableFn: ActionsAvailableFn,
    selectedItemIds: ElementId[],
    itemNameFn: (id: ElementId) => string
}) {
    const buttonId = 'editButton'
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget as HTMLElement)}
    return (
        <div>
            <Button
                id={buttonId}
                aria-controls="editMenu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleButtonClick}
            >
                Edit
            </Button>
            <EditMenu anchorEl={anchorEl}
                      anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                      transformOrigin={{vertical: 45, horizontal: 'left'}}
                      selectedItemIds={selectedItemIds} onInsert={noop} onAction={onAction} onClose={handleClose}
                      actionsAvailableFn={actionsAvailableFn} insertMenuItemFn={null} itemNameFn={itemNameFn}  labelledBy={buttonId}
            />
        </div>
    )
}
