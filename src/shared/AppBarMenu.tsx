import {Menu as MenuIcon} from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import * as React from 'react'
import Menu from '@mui/material/Menu'
import {editorElement} from '../editor/EditorElement'
import {editorMenuPositionProps} from '../editor/Editor'
import MenuItem from '@mui/material/MenuItem'
import {Link} from '@mui/material'

export default function AppBarMenu(props: object) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}

    const menuItem = (label: string, href: string) => {
        const onClick = () => { handleClose() }
        return <MenuItem onClick={onClick}
                         component={Link}
                        href={href}
        >{label}</MenuItem>
    }
    return <>
        <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{mr: 2}}
            onClick={handleClick}
        >
            <MenuIcon/>
        </IconButton>
        <Menu
            id="appBarMenu"
            data-testid="appBarMenu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{dense: true, 'aria-labelledby': 'fileButton',
                // @ts-expect-error https://github.com/mui-org/material-ui/issues/17579
                component: 'nav'}}
            anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}
            transformOrigin={{vertical: 5, horizontal: -5,}}
            container={editorElement()}
            slotProps={editorMenuPositionProps}
        >
            {menuItem('Home', '/')}
            {menuItem('Learning', '/learn')}
            {menuItem('Studio', '/studio')}
            {menuItem('App Runner', '/run')}
        </Menu>
    </>
}