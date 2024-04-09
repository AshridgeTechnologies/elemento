import * as React from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {MenuItemFn, OnNewFn} from './Types'
import {editorMenuPositionProps} from './Editor'

import {editorDialogContainer} from './EditorElement'

export default function FileMenu({onNew, onOpen, onSaveAs, onSaveToGitHub, onOpenFromGitHub, onGetFromGitHub, onUpdateFromGitHub, signedIn}:
    {onNew?: OnNewFn, onOpen?: MenuItemFn, onSaveAs?: MenuItemFn,
        onSaveToGitHub?: MenuItemFn, onOpenFromGitHub?: MenuItemFn, onGetFromGitHub?: MenuItemFn, onUpdateFromGitHub?: MenuItemFn, signedIn: boolean}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}

    const menuItem = (label: string, action?: () => void) => {
        if (!action) {
            return null
        }
        const onClick = () => { action(); handleClose() }

        return <MenuItem onClick={onClick}>{label}</MenuItem>
    }
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
                MenuListProps={{dense: true, 'aria-labelledby': 'fileButton'}}
                anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}
                transformOrigin={{vertical: 45, horizontal: 'left',}}
                container={editorDialogContainer()}
                slotProps={editorMenuPositionProps}
            >
                {menuItem('New', onNew)}
                {menuItem('Open', onOpen)}
                {menuItem('Save As', onSaveAs)}
                {menuItem('Get from GitHub', onOpenFromGitHub)}
                {menuItem('Update from GitHub', onUpdateFromGitHub)}
                {menuItem('Save to GitHub', onSaveToGitHub)}
            </Menu>
        </div>
    )
}
