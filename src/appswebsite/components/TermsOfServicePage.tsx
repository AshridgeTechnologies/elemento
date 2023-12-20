import React from 'react'
import {Box, Stack, Typography} from '@mui/material'
import AppBar from '../../appsShared/AppBar'

export default function TermsOfServicePage() {

    return <Box display='flex' flexDirection='column' height='100%' width='100%'>
        <Box flex='0'>
            <AppBar title='Terms of Service'/>
        </Box>
        <Box flex='1' minHeight={0}>
            <Stack spacing={2}>
                <Typography variant='h4'>Elemento Online - Terms of Service</Typography>
                <Typography variant='body1'>Coming soon</Typography>
            </Stack>
        </Box>
    </Box>
}
