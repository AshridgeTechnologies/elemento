import React, {createElement, useEffect} from 'react'
import {useGetObjectState} from '../appData'
import {Box, Button, Container, Theme, Typography, useTheme} from '@mui/material'
import {SnackbarProvider, enqueueSnackbar, closeSnackbar} from 'notistack'
import CookieConsent from 'react-cookie-consent'
import {AppData} from './AppData'
import {noop} from '../../util/helpers'
import {isSignedIn, useSignedInState} from './authentication'
import {subscribeToNotifications, type Notification} from './notifications'

import {dndWrappedComponent} from './ComponentHelpers'

type Properties = {path: string, maxWidth?: string | number, fonts?: string[], startupAction?: () => void, cookieMessage?: string, children?: any, topChildren?: any}

const containerBoxCss = {
    height: '100%',
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

function CookieMessage({path, message}: {path: string, message: string}) {
    const theme = useTheme()
    return <CookieConsent cookieName={`CookieConsent_${path}`}
                          buttonText='OK'
                          enableDeclineButton declineButtonText='Not Ok' flipButtons
                          style={{backgroundColor: theme.palette.primary.main, color: 'white', left: '5px', width: 'calc(100% - 10px)'}}
                          buttonStyle={{backgroundColor: '#16f316', borderRadius: '5px'}}
                          declineButtonStyle={{backgroundColor: '#dd3535', color: 'white', borderRadius: '5px'}}>
        <Typography>{message}</Typography>
    </CookieConsent>
}

const App: any = dndWrappedComponent(function App({path, maxWidth, fonts = [], startupAction = noop, cookieMessage, children, topChildren}: Properties) {
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
            <Container maxWidth={false} disableGutters sx={{...containerBoxCss, maxWidth}}>
                {createElement(pageToDisplay, {path: pagePath} as React.Attributes) /*we do not know the properties of each page*/}
            </Container>
        </Box>
        <Box flex='0'>
            {children}
        </Box>
        {cookieMessage ? <CookieMessage path={path} message={cookieMessage}/> : null}
    </Box>

})

App.State = AppData

export default App
