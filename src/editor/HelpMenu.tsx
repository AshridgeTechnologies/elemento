import {VoidFn} from './Types'
import React from 'react'
import {Menu, MenuItem} from '@mui/material'
import {editorDialogContainer} from './EditorElement'
import {editorMenuPositionProps} from './Editor'
import Button from '@mui/material/Button'
import {compose} from 'ramda'

export default function HelpMenu({
                                     onReference,
                                     onTutorials,
                                 }: {
    onReference: VoidFn,
    onTutorials: VoidFn,
}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const closeMenus = () => setAnchorEl(null)

    return (
        <div>
            <Button
                id="helpButton"
                aria-controls="helpMenu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                color={'secondary'}
                onClick={handleClick}
            >
                Help
            </Button>
            <Menu
                id="helpMenu"
                data-testid="helpMenu"
                anchorEl={anchorEl}
                anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}
                transformOrigin={{vertical: 45, horizontal: 'left',}}
                open={open}
                onClose={closeMenus}
                MenuListProps={{dense: true, 'aria-labelledby': 'helpButton'}}
                container={editorDialogContainer()}
                slotProps={editorMenuPositionProps}
            >
                <MenuItem onClick={compose(onReference, closeMenus)} key={'reference'}>Reference Guide</MenuItem>
                <MenuItem onClick={compose(onTutorials, closeMenus)} key={'tutorials'}>Tutorials</MenuItem>
            </Menu>
        </div>
    )
}

