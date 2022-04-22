import React from 'react'
import Toolbar from '@mui/material/Toolbar'
import {Box, Link, Stack, Typography} from '@mui/material'
import AppBar from './AppBar'

function MenuBar({children = [] }: {children?: React.ReactNode}) {
    return (
        <Box sx={{flexGrow: 1}}>
            <Toolbar variant="dense" sx={{borderBottom: '1px solid #ddd'}}>
                {children}
            </Toolbar>
        </Box>
    )
}

export default function HomePage() {

    return <Box display='flex' flexDirection='column' height='100%' width='100%'>
        <Box flex='0'>
            <AppBar/>
            <MenuBar/>
        </Box>
        <Box flex='1' minHeight={0}>
            <Stack spacing={2}>
                <Typography variant='h4'>Elemento Apps</Typography>
                <Link underline='hover' href="/studio" variant='h5'>Create Apps</Link>
                <Link underline='hover' href="/run" variant='h5'>Run Apps</Link>
            </Stack>
        </Box>
    </Box>
}
