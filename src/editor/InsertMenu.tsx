import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {OnInsertFn} from './Types'

export default function InsertMenu({onInsert}: {onInsert: OnInsertFn}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleInsert = () => {
        onInsert("Text")
        handleClose()
    }

    return (
        <div>
            <Button
                id="insertButton"
                aria-controls="insertMenu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="contained"
                disableElevation
                endIcon={<KeyboardArrowDownIcon />}
            >
                Insert
            </Button>
            <Menu
                id="insertMenu"
                data-testid="insertMenu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'insertButton',
                }}
            >
                <MenuItem onClick={handleInsert}>Text</MenuItem>
            </Menu>
        </div>
    );
}