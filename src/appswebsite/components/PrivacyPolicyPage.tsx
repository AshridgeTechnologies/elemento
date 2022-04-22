import React from 'react'
import {Box, Stack, Typography} from '@mui/material'
import AppBar from './AppBar'

export default function PrivacyPolicyPage() {

    return <Box display='flex' flexDirection='column' height='100%' width='100%'>
        <Box flex='0'>
            <AppBar/>
        </Box>
        <Box flex='1' minHeight={0}>
            <Stack spacing={2}>
                <Typography variant='h4'>Elemento Apps - Privacy Policy</Typography>
                <Typography variant='body1'>Coming soon</Typography>
            </Stack>
        </Box>
    </Box>
}
