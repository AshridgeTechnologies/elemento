import React, {createElement, useEffect} from 'react'
import {useGetObjectState} from '../appData'
import {Box, Button, Container, Typography} from '@mui/material'
import {SnackbarProvider, enqueueSnackbar, closeSnackbar} from 'notistack'
import {AppData} from './AppData'
import {noop} from '../../util/helpers'
import {isSignedIn, useSignedInState} from './authentication'
import {subscribeToNotifications, type Notification} from './notifications'

import {dndWrappedComponent} from './ComponentHelpers'

type Properties = {path: string, maxWidth?: string | number, fonts?: string[], startupAction?: () => void, children?: any, topChildren?: any}

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
    enqueueSnackbar(snackbarMessage, {variant: level, persist: level === 'error'})
}

const insertFontLink = (fonts: string[]) => {
    if (fonts.length && !document.head.querySelector('link#web-font-link')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        const fontFamilies = fonts.map(font => `family=${font}`).join('&')
        link.href=`https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`
        document.head.appendChild(link)
    }
}

const App: any = dndWrappedComponent(function App({path, maxWidth, fonts = [], startupAction = noop, children, topChildren}: Properties) {
    const state = useGetObjectState<AppData>(path)
    const {currentPage} = state
    const pagePath = path + '.' + currentPage.name

    useEffect( () => { insertFontLink(fonts) }, [] ) // wrap startupAction to ensure no result is returned to useEffect
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

})

App.State = AppData

export default App
