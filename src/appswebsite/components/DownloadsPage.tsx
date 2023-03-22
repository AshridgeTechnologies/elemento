import React from 'react'
import {Box, Container, Link, Stack, Typography} from '@mui/material'
import AppBar from '../../shared/AppBar'
import {theme} from '../../shared/styling'
import {ThemeProvider} from '@mui/material/styles'

export default function LearnPage() {

    return <ThemeProvider theme={theme}>
        <Box display='flex' flexDirection='column' height='100%' width='100%'>
            <Box flex='0'>
                <AppBar title='Elemento Online - Downloads' userMenu={false}/>
            </Box>
            <Box flex='1' minHeight={0}>
                <Container>
                    <Stack maxWidth={600} spacing={3} mt={3}>
                        <Typography variant='h4'>Elemento Development Server</Typography>
                        <Typography>Please download the correct version for your operating system.</Typography>
                        <Typography>Your computer will complain that the app is not known, approved, signed etc.<br/>
                            We do not currently have the resources to jump through all the hoops required to get the app
                            approved on each operating system,
                            so you will just have to trust us here, and continue past all the warnings.
                        </Typography>
                        <Link href='/devServer/win/ElementoDevServer.exe'><Typography variant='h5'>Windows</Typography></Link>
                        <Link href='/devServer/macos/ElementoDevServer.zip'><Typography variant='h5'>Mac</Typography></Link>
                        <Link href='/devServer/linux/ElementoDevServer'><Typography variant='h5'>Linux</Typography></Link>
                    </Stack>
                </Container>
            </Box>
        </Box>
    </ThemeProvider>
}
