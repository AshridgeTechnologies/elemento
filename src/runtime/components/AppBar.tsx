import React from 'react';
import {PropVal, StylesProps, valueOfProps} from '../runtimeFunctions'
import {AppBar as MuiAppBar, Stack, Toolbar, Typography} from '@mui/material'
import {typographyStyles} from './InputComponentHelpers'
import {pick} from 'ramda'

type Properties = { path: string, title?: PropVal<string>, children?: any, show?: PropVal<boolean>,
    styles?: StylesProps
}

export default function AppBar({children, path, ...props}: Properties) {
    const propVals = valueOfProps(props)
    const {title, show = true, styles = {}} = propVals
    const showProps = show ? {} : {display: 'none'}
    const sxProps = {
        ...showProps,
        ...styles
    }
    const typographySxProps = pick(typographyStyles, styles)
    return <MuiAppBar position="static" id={path} sx={sxProps}>
            <Toolbar variant="dense">
                <Stack
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                {title && <Typography variant="h6" component="div" sx={typographySxProps}>
                    {title}
                </Typography>}
                {children}
                </Stack>
            </Toolbar>
        </MuiAppBar>
}
