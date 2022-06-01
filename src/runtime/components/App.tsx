import React, {createElement} from 'react'
import * as Elemento from '../index'
import {Box, Container} from '@mui/material'

type Properties = {id: string, maxWidth?: string | number, pages: { [key: string]: React.FunctionComponent<any> },
    children?: any, topChildren?: any}

export default function App({id, maxWidth, pages, children, topChildren}: Properties) {
    const state = Elemento.useObjectStateWithDefaults(`app._data`, {currentPage: Object.keys(pages)[0]})
    const {currentPage} = state
    const pagePath = id + '.' + currentPage

    return <Box id={id} display='flex' flexDirection='column' height='100%' width='100%'>
        <Box flex='0'>
            {topChildren}
        </Box>
        <Box flex='1' minHeight={0}>
            <Container sx={{maxWidth, mt: 2, mb: 2, height: '100%', width: '100%'}}>
                {createElement(pages[currentPage], {path: pagePath})}
            </Container>
        </Box>
        <Box flex='0'>
            {children}
        </Box>
    </Box>

}