import * as React from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {MenuItemFn} from './Types'

export default function FileMenu({onOpen, onSave, onPublish, signedIn}: {onOpen?: MenuItemFn, onSave?: MenuItemFn, onPublish?: MenuItemFn, signedIn: boolean}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}

    const menuItem = (label: string, action: () => void) => {
        const onClick = () => { action(); handleClose() }
        return <MenuItem onClick={onClick}>{label}</MenuItem>
    }

    const signedInMenuItem = (label: string, action: () => void) => signedIn ?
        menuItem(label, action) :
        <MenuItem disabled>{`${label} - please Login` }</MenuItem>

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
                {onPublish ? signedInMenuItem('Publish', onPublish): null}
            </Menu>
        </div>
    )
}