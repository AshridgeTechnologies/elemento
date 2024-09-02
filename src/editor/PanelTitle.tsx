import {Stack, Typography} from '@mui/material'
import React from 'react'

export function PanelTitle(props: {name: string, children?: React.ReactNode}) {
    return <Stack direction='row' width='100%' sx={{backgroundColor: 'primary.main', color: 'white'}} justifyContent='space-between'>
        <Typography sx={{px: 2, py: 0.5}}>{props.name}</Typography>
        <Stack direction='row'>
            {props.children}
        </Stack>
    </Stack>
}
