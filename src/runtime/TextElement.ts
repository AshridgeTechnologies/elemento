import React from 'react'
import {Typography} from '@mui/material'

export default function TextElement({children}: {children: any}) {
    return React.createElement(Typography, {gutterBottom: true}, children)
}
