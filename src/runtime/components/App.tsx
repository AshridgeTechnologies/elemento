import React, {createElement} from 'react'
import {useGetObjectState} from '../appData'
import {Box, Container} from '@mui/material'
import {BaseComponentState, ComponentState} from './ComponentState'
import shallow from 'zustand/shallow'

type Properties = {path: string, maxWidth?: string | number, children?: any, topChildren?: any}

const containerBoxCss = {
    height: '100%',
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
    paddingBottom: 1,
    marginTop: 0,
    marginBottom: 0,
}

export default function App({path, maxWidth, children, topChildren}: Properties) {
    const state = useGetObjectState<AppData>('app')
    const {currentPage} = state
    const pagePath = path + '.' + currentPage.name
    const sx = {maxWidth, ...containerBoxCss}

    return <Box id={path} display='flex' flexDirection='column' height='100%' width='100%' className='ElApp'>
        <Box flex='0'>
            {topChildren}
        </Box>
        <Box flex='1' minHeight={0}>
            <Container sx={sx}>
                {createElement(currentPage, {path: pagePath} as React.Attributes) /*we do not know the properties of each page*/}
            </Container>
        </Box>
        <Box flex='0'>
            {children}
        </Box>
    </Box>

}
type StateExternalProps = {
    pages: { [key: string]: React.FunctionComponent }
}

type StateInternalProps = {
    currentPage?: string
}

export class AppData extends BaseComponentState<StateExternalProps, StateInternalProps> implements ComponentState<AppData> {

    updateFrom(newObj: this): this {
        const {pages: thisPages, ...thisProps} = this.props
        const {pages: newPages, ...newProps} = newObj.props
        const pagesEqual = shallow(thisPages, newPages)
        const propsEqual = shallow(thisProps, newProps)
        return pagesEqual && propsEqual ? this : new AppData(newObj.props).withState(this.state) as this
    }

    get currentPage() {
        const {currentPage} = this.state
        return currentPage ? this.props.pages[currentPage] : Object.values(this.props.pages)[0]
    }

    ShowPage = (page: string | React.FunctionComponent) => {
        const latest = this.latest()
        const pageName = typeof page === 'string' ? page : page.name
        latest.updateState({currentPage: pageName})
    }
}

App.State = AppData