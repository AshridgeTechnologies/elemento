import * as React from 'react'
import Button from '@mui/material/Button'
import {InsertMenuItemsFn, OnInsertFnWithPositionFn} from './Types'
import {Alert, Popover} from '@mui/material'
import {InsertMenu} from './InsertMenu'
import {ElementId, ElementType, InsertPosition} from '../model/Types'

export default function InsertMenuWithButton({onInsert, insertMenuItems, targetItemId}: {
    onInsert: OnInsertFnWithPositionFn,
    insertMenuItems: InsertMenuItemsFn,
    targetItemId: ElementId}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleInsert = (insertPosition: InsertPosition, targetItemId: ElementId, elementType: ElementType) => {
        onInsert(insertPosition, targetItemId, elementType)
        handleClose()
    }

    const buttonId = 'insertButton'
    return (
        <div>
            <Button
                id={buttonId}
                aria-controls="insertMenu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleButtonClick}
            >
                Insert
            </Button>
            <InsertMenu anchorEl={anchorEl}
                        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                        transformOrigin={{vertical: 45, horizontal: 'left'}}
                        open={open && !!targetItemId} onClose={handleClose} onInsert={handleInsert}
                        insertMenuItems={insertMenuItems} targetItemId={targetItemId} labelledBy={buttonId}/>

            <Popover
                id='insertWarning'
                data-testid="insertWarning"
                open={open && !targetItemId}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}
            >
                <Alert severity="warning">Please select the item where you want to insert</Alert>
            </Popover>
        </div>
    )
}