import * as React from 'react'
import Mui_AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import UserMenu from './UserMenu'
import AppBarMenu from './AppBarMenu'

type Properties = {title: string, userMenu?: boolean}
export default function AppBar({title, userMenu = true}: Properties) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Mui_AppBar position="sticky">
                <Toolbar variant="dense">
                    <AppBarMenu/>
                    <Typography variant="h6" component="div" sx={{ fontSize: 16, flexGrow: 1 }}>
                        {title}
                    </Typography>
                    {userMenu && <UserMenu/>}
                </Toolbar>
            </Mui_AppBar>
        </Box>
    )
}