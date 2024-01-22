import React, {createElement, useEffect} from 'react'
import {useGetObjectState} from '../appData'
import {Box, Container} from '@mui/material'
import {AppData} from './AppData'
import {noop} from '../../util/helpers'
import {isSignedIn, useSignedInState} from './authentication'

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

export default function App({path, maxWidth, startupAction = noop, children, topChildren}: Properties) {
    const state = useGetObjectState<AppData>('app')
    const {currentPage} = state
    const pagePath = path + '.' + currentPage.name

    useEffect( startupAction, [] )
    useSignedInState()
    const pageToDisplay = state.pageToDisplay(isSignedIn())
    return <Box id={path} display='flex' flexDirection='column' height='100%' width='100%'  className='ElApp'>
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
