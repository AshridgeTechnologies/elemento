import * as React from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'

import {editorMenuPositionProps} from './Editor'
import {editorDialogContainer} from './EditorElement'
import {Stack, TextField, Typography} from '@mui/material'

export default function ToolsMenu({toolItems, openFromUrlFn}: {toolItems: {[_: string]: VoidFunction}, openFromUrlFn: (url: string) => void}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const [urlToOpen, setUrlToOpen] = React.useState<string>('')
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const onUrlInput = (event: React.ChangeEvent) => {setUrlToOpen((event.currentTarget as HTMLInputElement).value)}
    const handleUrlFieldKey = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            onUrlOpen()
        }}
    const onUrlOpen = () => {
        openFromUrlFn(urlToOpen)
        handleClose()
    }
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
                MenuListProps={{dense: true, 'aria-labelledby': 'toolsButton'}}
                anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}
                transformOrigin={{vertical: 45, horizontal: 'left',}}
                container={editorDialogContainer()}
                slotProps={editorMenuPositionProps}
            >
                {Object.entries(toolItems).map( ([name, openToolFn]) => menuItem(name, openToolFn))}
                <Divider textAlign="left"><Typography variant='body2' color='#777'>Open Tool from URL</Typography></Divider>
                <Stack direction='row' mx={1} mt={2}>
                    <TextField label='Tool URL' variant='outlined' size='small' value={urlToOpen}
                               onChange={onUrlInput}
                               onKeyDown={handleUrlFieldKey}
                               sx={{minWidth: '20em', mr: 1}}/>
                    <Button variant='outlined' onClick={onUrlOpen}>Open</Button>
                </Stack>
            </Menu>
        </div>
    )
}
