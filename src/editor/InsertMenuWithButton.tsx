import * as React from 'react'
import Button from '@mui/material/Button'
import {OnInsertFn} from './Types'
import {ElementType} from '../model/Types'
import {Alert, Popover} from '@mui/material'
import {InsertMenu} from './InsertMenu'

export default function InsertMenuWithButton({onInsert, items}: {onInsert: OnInsertFn, items: ElementType[]}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const hasItems = Boolean(items.length)
    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleInsert = (elementType: ElementType) => {
        onInsert(elementType)
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
            <InsertMenu anchorEl={anchorEl} anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                        open={open && hasItems} items={items} onClose={handleClose} onInsert={handleInsert} labelledBy={buttonId}/>

            <Popover
                id='insertWarning'
                data-testid="insertWarning"
                open={open && !hasItems}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}
            >
                <Alert severity="warning">Please select the item you want to insert after</Alert>
            </Popover>
        </div>
    )
}