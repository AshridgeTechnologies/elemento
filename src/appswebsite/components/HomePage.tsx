import React from 'react'
import {Box, Container, Link, Stack, Typography} from '@mui/material'
import AppBar from '../../shared/AppBar'
import {theme} from '../../shared/styling'
import {ThemeProvider} from '@mui/material/styles'
import HomeIcon from '@mui/icons-material/Home'
import LightbulbIcon from '@mui/icons-material/LightbulbTwoTone'
import CreateIcon from '@mui/icons-material/CreateTwoTone'
import AodIcon from '@mui/icons-material/AodTwoTone'
import ArrowCircleRightTwoToneIcon from '@mui/icons-material/ArrowCircleRightTwoTone';

const primary = theme.palette.primary.main
const secondary = theme.palette.secondary.main

function Logo() {
    return <Box color={secondary} border='8px solid' borderRadius={4} width={108} height={104} paddingTop='10px' paddingX='3px'>
        <Stack>
            <Typography fontSize='100px' fontFamily='"Helvetica"' align='center' lineHeight={0.8}>El</Typography>
            <Typography fontSize='16px' lineHeight={1}>42</Typography>
        </Stack>
    </Box>
}

function SectionLink(props: {title: string, href: string, icon: any, children: any}) {
    const Icon = props.icon
    return <Box border='4px solid' borderColor={primary} borderRadius={4} width='300px' paddingY='10px' paddingX='16px'>
        <Link href={props.href} underline='none'>
            <Stack spacing={2}>
                <Box textAlign='center'><Icon sx={{ fontSize: 180 }} /></Box>
                <Link component='div' underline='hover' href={props.href} variant='h5' textAlign='center'>{props.title}</Link>
                <Typography fontSize='20px' color='#555'>{props.children}</Typography>
                <Box textAlign='center'><ArrowCircleRightTwoToneIcon sx={{ fontSize: 32, color: secondary }} /></Box>
            </Stack>
        </Link>
    </Box>
}

export default function HomePage() {

    return <ThemeProvider theme={theme}>
        <Box display='flex' flexDirection='column' height='100%' width='100%'>
            <Box flex='0'>
                <AppBar title='Elemento Apps - Home'/>
            </Box>
            <Box flex='1' minHeight={0} mt={2}>
                <Container maxWidth="lg">
                    <Stack spacing={2}>
                        <Stack direction='row'>
                            <Logo/>
                            <Stack ml={4}>
                                <Typography fontWeight='bold' variant='h3'  color={secondary} align='center'>Elemento</Typography>
                                <Typography variant='h4' color={secondary} align='center' mt={2}>
                                    Everything you need to make and use your own software
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack direction='row' justifyContent='space-between' alignItems='stretch' marginTop='30px'>
                            <SectionLink title='Learn' href='/learn' icon={LightbulbIcon}>
                                A great range of resources to teach you how to get started and create your first app with Elemento.
                            </SectionLink>
                            <SectionLink title='Create' href='/studio' icon={CreateIcon}>
                                Put your app together and preview it live in Elemento Studio
                            </SectionLink>
                            <SectionLink title='Use' href='/run' icon={AodIcon}>
                                Run your app - or go back to the apps you have already made.
                            </SectionLink>
                        </Stack>
                    </Stack>
                </Container>
            </Box>
        </Box>
    </ThemeProvider>
}
