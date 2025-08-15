import React, {createElement, useEffect} from 'react'
import {Box, Button, Container, Typography, useTheme} from '@mui/material'
import {closeSnackbar, enqueueSnackbar, SnackbarProvider} from 'notistack'
import CookieConsent from 'react-cookie-consent'
import {AppData} from './AppData'
import {noop} from '../../util/helpers'
import {isSignedIn, useSignedInState} from './authentication'
import {type Notification, subscribeToNotifications} from './notifications'

import {dndWrappedComponent} from './ComponentHelpers'
import {ThemeProvider} from '@mui/material/styles'
import {useObject} from '../appStateHooks'
import {ElementMetadata, ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'
import {InputComponentMetadata} from './InputComponentState'

type Properties = {path: string, maxWidth?: string | number, fonts?: string[], startupAction?: () => void,
    messageAction?: ($sender: Window, $data: any) => void, cookieMessage?: string, faviconUrl?: string, children?: any, topChildren?: any}

export const AppSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "App",
    "description": "Organises a group of elements within a page.  The elements contained in the layout can be arranged vertically, as normal, or horizontally.\n" +
        "Layouts can also contain other Layouts; one use of this is to split a Page into two columns, and display a group of elements on each side.\n" +
        "When doing this, it can be useful to set the Width property to allocate the right amount of the total width to each column",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "App",
    "icon": "web",
    "elementType": "app",
    "canContain": "elementsWithThisParentType",
    "parentType": "Project",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "author": {
                    "description": "Who created this element app",
                    "type": "string",
                },
                "maxWidth": {
                    "description": "The maximum width of this app when displayed on the page",
                    "$ref": "#/definitions/StringOrNumberOrExpression"
                },
                "fonts": {
                    "description": "The Google fonts available for this app",
                    "$ref": "#/definitions/StringMultiline"
                },
                "startupAction": {
                    "description": "The action to carry out when the app is first started",
                    "$ref": "#/definitions/ActionExpression",
                    "argNames": []
                },
                "messageAction": {
                    "description": "The action to carry out when a message is received from another app",
                    "$ref": "#/definitions/ActionExpression",
                    "argNames": ['$sender', '$message']
                },
                "cookieMessage": {
                    "description": "The message displayed when asking the user to approve cookies",
                    "$ref": "#/definitions/StringOrExpression"
                },
                "faviconUrl": {
                    "description": "The URL of the favicon for this app",
                    "$ref": "#/definitions/StringOrExpression"
                },
                "themeOptions": {
                    "description": "A record containing options to configure the Material UI theme.\n" +
                        "See https://mui.com/material-ui/customization/theming/",
                    "$ref": "#/definitions/Expression"
                },
            }
        },
        "elements": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/BaseElement"
            }
        }
    },
    "required": ["kind", "properties"],
    "unevaluatedProperties": false,

    "definitions": Definitions
}

export const AppMetadata: ElementMetadata = {
    stateProps: ['themeOptions']
}

const containerBoxCss = {
    height: '100%',
    paddingTop: 0,
    paddingBottom: 0,
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

const insertFaviconLink = (href: string | undefined) => {
    if (href) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
        if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
        }
        link.href = href
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

const App: any = dndWrappedComponent(function App({path, maxWidth, fonts = [],
                                                      startupAction = noop, messageAction, cookieMessage, faviconUrl, children, topChildren}: Properties) {
    const state: AppData = useObject(path)
    const {currentPage} = state
    const pagePath = path + '.' + currentPage.name

    useEffect( () => { insertFontLink(fonts) }, [] )
    const fullFaviconUrl = state.urlContext.getFullUrl(faviconUrl)
    useEffect( () => { insertFaviconLink(fullFaviconUrl) }, [fullFaviconUrl] )
    useEffect( () => { startupAction() }, [] ) // wrap startupAction to ensure no result is returned to useEffect
    useEffect(() => subscribeToNotifications( notify ), [])
    useEffect(() => {
        if (messageAction) {
            const listener = (event: MessageEvent) => messageAction(event.source as Window, event.data)
            globalThis.addEventListener('message', listener)
            return ()=> globalThis.removeEventListener('message', listener)
        }
    }, [messageAction])
    useSignedInState()
    const pageToDisplay = state.pageToDisplay(isSignedIn())

    return <ThemeProvider theme={state.Theme()}>
    <Box id={path} display='flex' flexDirection='column' height='100%' width='100%'  className='ElApp'>
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
    </ThemeProvider>

})

App.State = AppData
App.Schema = AppSchema
App.Metadata = AppMetadata

export default App
