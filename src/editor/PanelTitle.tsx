import {Typography} from '@mui/material'
import React from 'react'

export function PanelTitle(props: {name: string}) {
    return <Typography sx={{backgroundColor: 'primary.main', color: 'white', px: 2, py: 0.5}}>{props.name}</Typography>
}
