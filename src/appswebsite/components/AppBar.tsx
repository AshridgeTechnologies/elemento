import * as React from 'react';
import Mui_AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import UserMenu from '../../shared/UserMenu'

export default function AppBar() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Mui_AppBar position="sticky">
                <Toolbar variant="dense">
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ fontSize: 16, flexGrow: 1 }}>
                        Elemento Apps
                    </Typography>
                    <UserMenu/>
                </Toolbar>
            </Mui_AppBar>
        </Box>
    );
}