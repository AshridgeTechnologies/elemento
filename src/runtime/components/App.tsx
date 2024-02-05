import React, {createElement, useEffect} from 'react'
import {useGetObjectState} from '../appData'
import {Box, Button, Container, Typography} from '@mui/material'
import {SnackbarProvider, enqueueSnackbar, closeSnackbar} from 'notistack'
import {AppData} from './AppData'
import {noop} from '../../util/helpers'
import {isSignedIn, useSignedInState} from './authentication'
import {subscribeToNotifications, type Notification} from './notifications'

type Properties = {path: string, maxWidth?: string | number, startupAction?: () => void, children?: any, topChildren?: any}

const containerBoxCss = {
    height: '100%',
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
    paddingBottom: 1,
    marginTop: 0,
    marginBottom: 0,
}

const notify = (notification: Notification) => {
    const {level, message, details} = notification
    console.log('Notification', level, message, details)
    const snackbarMessage = <div>
        <Typography color='white'>{message}</Typography>
        <Typography color='white' variant='body2'>{details}</Typography>
    </div>
    enqueueSnackbar(snackbarMessage, {variant: level})
}

export default function App({path, maxWidth, startupAction = noop, children, topChildren}: Properties) {
    const state = useGetObjectState<AppData>('app')
    const {currentPage} = state
    const pagePath = path + '.' + currentPage.name

    useEffect( () => { startupAction() }, [] ) // wrap startupAction to ensure no result is returned to useEffect
    useEffect(() => subscribeToNotifications( notify ), [])
    useSignedInState()
    const pageToDisplay = state.pageToDisplay(isSignedIn())
    return <Box id={path} display='flex' flexDirection='column' height='100%' width='100%'  className='ElApp'>
        <SnackbarProvider action={(snackbarId) => (
            <Button sx={{color: 'white'}} onClick={() => closeSnackbar(snackbarId)}>
                Dismiss
            </Button>
        )}/>
        <Box flex='0'>
            {topChildren}
        </Box>
        <Box flex='1' minHeight={0}>
            <Container maxWidth={false} sx={{...containerBoxCss, maxWidth}}>
                {createElement(pageToDisplay, {path: pagePath} as React.Attributes) /*we do not know the properties of each page*/}
            </Container>
        </Box>
        <Box flex='0'>
            {children}
        </Box>
    </Box>

}

App.State = AppData
