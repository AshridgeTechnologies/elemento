import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {OnInsertFn} from './Types'
import {ElementType} from '../model/Types'
import {startCase} from 'lodash'
import {Alert, Popover} from '@mui/material'

export default function InsertMenu({onInsert, items}: {onInsert: OnInsertFn, items: ElementType[]}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
    const open = Boolean(anchorEl)
    const hasItems = Boolean(items.length)
    const handleClose = () => setAnchorEl(null)
    const handleClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleInsert = (elementType: ElementType) => () => {
        onInsert(elementType.replace(/ /g, '') as ElementType)
        handleClose()
    }

    const menuItem = (elementType: ElementType) => <MenuItem onClick={handleInsert(elementType)}>{startCase(elementType)}</MenuItem>

    return (
        <div>
            <Button
                id="insertButton"
                aria-controls="insertMenu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                Insert
            </Button>
            <Menu
                id="insertMenu"
                data-testid="insertMenu"
                anchorEl={anchorEl}
                open={open && hasItems}
                onClose={handleClose}
                MenuListProps={{'aria-labelledby': 'insertButton'}}
            >
                {React.Children.toArray(items.map(menuItem))}
            </Menu>
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