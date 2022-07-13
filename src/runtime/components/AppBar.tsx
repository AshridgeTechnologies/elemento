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
