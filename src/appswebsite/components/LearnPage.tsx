import React from 'react'
import Toolbar from '@mui/material/Toolbar'
import {Box, Link, Stack, Typography} from '@mui/material'
import AppBar from '../../shared/AppBar'
import {theme} from '../../shared/styling'
import {ThemeProvider} from '@mui/material/styles'
import {TutorialRunner} from '../../tutorials/TutorialRunner'

export default function LearnPage() {

    return <ThemeProvider theme={theme}>
        <Box display='flex' flexDirection='column' height='100%' width='100%'>
            <Box flex='0'>
                <AppBar title='Elemento Apps - Learn' userMenu={false}/>
            </Box>
            <Box flex='1' minHeight={0}>
                <TutorialRunner/>
            </Box>
        </Box>
    </ThemeProvider>
}
