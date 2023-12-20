import React, {useState} from 'react'
import {VoidFn} from './Types'
import AppBar from '../appsShared/AppBar'

import {AlertColor, Box, Grid, Icon, List, ListItem, ListItemIcon, Typography, useTheme} from '@mui/material'
import './splitPane.css'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import {RunLocalDialog} from './actions/RunLocal'
import {RunFromDiskDialog} from './actions/RunFromDisk'
import {AlertMessage, UIManager} from './actions/actionHelpers'
import {theme} from '../appsShared/styling'
import {ThemeProvider} from '@mui/material/styles'
import {RunAppFn} from './runLocalApp'
import {RunGitHubDialog} from './actions/RunGitHub'


function OpenOption({text, iconClass, onClick}: { text: string, iconClass: string, onClick: VoidFn }) {
    const theme = useTheme()
    const iconSx = {fontSize: '3em', color: theme.palette.primary.main}

    return <ListItem disablePadding>
        <ListItemButton onClick={onClick}>
            <ListItemIcon>
                <Icon sx={iconSx}>{iconClass}</Icon>
            </ListItemIcon>
            <ListItemText primary={
                <Typography sx={{fontSize: '1.3em'}}>{text}</Typography>}/>
        </ListItemButton>
    </ListItem>
}

export default function AppChooser({runAppFn}: {runAppFn: RunAppFn}) {

    const [dialog, setDialog] = useState<React.ReactNode | null>(null)
    const [alertMessage, setAlertMessage] = useState<React.ReactNode | null>(null)

    const onRunLocal = async () => {
        setDialog(<RunLocalDialog openProjectFn={runAppFn}
                                  uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)
    }

    const onRunFromDisk = async () => {
        setDialog(<RunFromDiskDialog openProjectFn={runAppFn}
                                  uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)
    }

    const onRunFromGitHub = async () => {
        setDialog(<RunGitHubDialog openProjectFn={runAppFn}
                                  uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)
    }

    const removeDialog = () => setDialog(null)

    const showAlert = (title: string, message: string, detail: React.ReactNode, severity: AlertColor) => {
        const removeAlert = () => setAlertMessage(null)
        setAlertMessage(AlertMessage({severity, removeAlert, title, message, detail}))
    }

    const appBarTitle = `Elemento App Runner`
    const OverallAppBar = <Box flex='0'>
        <AppBar title={appBarTitle}/>
    </Box>
    const WelcomeText = <Box p={3} maxHeight='100%' overflow='auto' boxSizing='border-box'>
        <Typography variant={'h4'}>Choose the Elemento App you want to run</Typography>

        <nav aria-label="Run an Elemento app">
        <List sx={{maxWidth: '35em', maxHeight: '100%'}}>
            <OpenOption text='Run an app stored in your browser' iconClass='folder_open' onClick={onRunLocal}/>
            <OpenOption text='Run an app on your computer disk' iconClass='folder_open_two_tone' onClick={onRunFromDisk}/>
            <OpenOption text='Run an app from GitHub' iconClass='download_two_tone' onClick={onRunFromGitHub}/>
        </List>
        </nav>
    </Box>

    const mainContent = <Box display='flex' flexDirection='column' height='100%' width='100%'>
        {OverallAppBar}
        <Box flex='1' minHeight={0}>
            <Grid container columns={20} spacing={0} height='100%'>
                <Grid item xs={20} height='100%'>
                    <Box display='flex' flexDirection='column' height='100%' width='100%'>
                        <Box flex='1' maxHeight='100%'>
                            {WelcomeText}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    </Box>

    return <ThemeProvider theme={theme}>
        {alertMessage}
        {dialog}
        {mainContent}
    </ThemeProvider>
}