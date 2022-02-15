import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {OnInsertFn} from './Types'
import {ElementType} from '../model/Types'
import {startCase} from 'lodash'

export default function InsertMenu({onInsert}: {onInsert: OnInsertFn}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleInsert = (elementType: ElementType) => () => {
        onInsert(elementType)
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
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'insertButton',
                }}
            >
                {menuItem('Text')}
                {menuItem('TextInput')}
                {menuItem('NumberInput')}
                {menuItem('TrueFalseInput')}
                {menuItem('Button')}
            </Menu>
        </div>
    );
}