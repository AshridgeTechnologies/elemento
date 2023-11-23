import * as React from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {editorMenuPositionProps} from './Editor'

import {editorElement} from './EditorElement'

export default function ToolsMenu({toolItems}:
    {toolItems: {[name: string]: VoidFunction}}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}

    const menuItem = (label: string, action?: () => void) => {
        if (!action) {
            return null
        }
        const onClick = () => { action(); handleClose() }

        return <MenuItem onClick={onClick} key={label}>{label}</MenuItem>
    }
    return (
        <div>
            <Button
                id="toolsButton"
                aria-controls="toolsMenu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                Tools
            </Button>
            <Menu
                id="toolsMenu"
                data-testid="toolsMenu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{dense: true, 'aria-labelledby': 'fileButton'}}
                anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}
                transformOrigin={{vertical: 45, horizontal: 'left',}}
                container={editorElement()}
                slotProps={editorMenuPositionProps}
            >
                {Object.entries(toolItems).map( ([name, openToolFn]) => menuItem(name, openToolFn))}
            </Menu>
        </div>
    )
}