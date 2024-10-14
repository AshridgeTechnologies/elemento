import React from 'react';
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {AppBar as MuiAppBar, Stack, Toolbar, Typography} from '@mui/material'
import {sxProps, typographyStyles} from './ComponentHelpers'
import {pick} from 'ramda'

type Properties = { path: string, title?: PropVal<string>, children?: any, show?: PropVal<boolean>,
    styles?: StylesPropVals
}

export default function AppBar({children, path, ...props}: Properties) {
    const propVals = valueOfProps(props)
    const {title, show, styles = {}} = propVals
    const typographySxProps = sxProps(pick(typographyStyles, styles))
    return <MuiAppBar position="static" id={path} sx={sxProps(styles, show)}>
            <Toolbar variant="dense">
                <Stack
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                    flexWrap='wrap'
                    useFlexGap
                    rowGap={0}
                >
                {title && <Typography variant="h6" component="div" marginRight={2} sx={typographySxProps}>
                    {title}
                </Typography>}
                    <Stack direction="row"
                           justifyContent="flex-start"
                           alignItems="center"
                           spacing={1.5}
                           flexWrap='wrap'
                           useFlexGap
                           rowGap={0}
                    >
                        {children}
                    </Stack>
                </Stack>
            </Toolbar>
        </MuiAppBar>
}
