import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {OnOpenFn, OnSaveFn} from './Types'

export default function FileMenu({onOpen, onSave}: {onOpen?: OnOpenFn, onSave?: OnSaveFn}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}

    const menuItem = (label: string, action: () => void) => <MenuItem onClick={action}>{label}</MenuItem>

    return (
        <div>
            <Button
                id="fileButton"
                aria-controls="fileMenu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                File
            </Button>
            <Menu
                id="fileMenu"
                data-testid="fileMenu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'fileButton',
                }}
            >
                {onOpen ? menuItem('Open', onOpen): null}
                {onSave ? menuItem('Save', onSave): null}
            </Menu>
        </div>
    );
}