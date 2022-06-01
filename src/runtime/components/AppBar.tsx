import React from 'react';
import {valueOfProps} from '../runtimeFunctions'
import {AppBar as MuiAppBar, IconButton, Stack, Toolbar, Typography} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

type Properties = { path: string, title?: string, children?: any }

export default function AppBar({children, path, ...props}: Properties) {
    const propVals = valueOfProps(props)
    const {title} = propVals
    return <MuiAppBar position="static" id={path}>
            <Toolbar variant="dense">
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{mr: 2}}
                >
                    <MenuIcon/>
                </IconButton>
                <Stack
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                {title && <Typography variant="h6" component="div" sx={{}}>
                    {title}
                </Typography>}
                {children}
                </Stack>
            </Toolbar>
        </MuiAppBar>
}
