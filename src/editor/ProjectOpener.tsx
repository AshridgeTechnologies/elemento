import React, {useState} from 'react'
import {OnGetFromGitHubFn, OnNewFn, OnOpenFn, OnOpenFromGitHubFn, VoidFn} from './Types'
import AppBar from '../appsShared/AppBar'
import MenuBar from './MenuBar'

import {Box, Button, Grid, Icon, List, ListItem, ListItemIcon, Typography, useTheme} from '@mui/material'
import FileMenu from './FileMenu'
import './splitPane.css'
import {useGitHubSignInState} from '../appsShared/gitHubAuthentication'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import MainHelpPanel from '../docs/MainHelpPanel'
import ToolsMenu from './ToolsMenu'
import HelpMenu from './HelpMenu'


    function OpenOption({text, iconClass, onClick}: {text: string, iconClass: string, onClick: VoidFn}) {
        const theme = useTheme()
        const iconSx = { fontSize: '3em', color: theme.palette.primary.main }

        return <ListItem disablePadding>
            <ListItemButton onClick={onClick}>
                <ListItemIcon>
                    <Icon sx={iconSx}>{iconClass}</Icon>
                </ListItemIcon>
                <ListItemText  primary={
                    <Typography sx={{fontSize: '1.3em'}}>{text}</Typography>}/>
            </ListItemButton>
        </ListItem>
    }



export default function ProjectOpener({onNew, onOpen, onOpenFromGitHub, onOpenTool, onHelp, onTutorials}: { onOpen: OnOpenFn, onNew: OnNewFn,
                        onGetFromGitHub: OnGetFromGitHubFn, onOpenFromGitHub: OnOpenFromGitHubFn,
                        onHelp: () => void,
                        onTutorials: () => void,
                        onOpenTool: (url: string) => void, }) {
    const signedIn = useGitHubSignInState()
    const appBarTitle = `Elemento Studio`
    const OverallAppBar = <Box flex='0'>
        <AppBar title={appBarTitle}/>
    </Box>
    const EditorHeader = <Box flex='0'>
        <MenuBar>
            <FileMenu onNew={onNew} onOpen={onOpen} onOpenFromGitHub={onOpenFromGitHub}  signedIn={signedIn}/>
            <ToolsMenu toolItems={{}} openFromUrlFn={onOpenTool}/>
            <HelpMenu onReference={onHelp} onTutorials={onTutorials}/>
        </MenuBar>
    </Box>

    const WelcomeText = <Box p={3} maxHeight='100%' overflow='auto' boxSizing='border-box'>
        <Typography variant={'h4'}>Welcome to the Elemento Studio</Typography>
        <Typography variant={'body1'} fontSize='1.3em' mt={2}>Choose one of these options to open an Elemento project and get started</Typography>
        <Typography variant={'body1'} fontSize='1.3em' mt={2}>Or click Help to learn more about using Elemento</Typography>

        <nav aria-label="Open an Elemento project">
        <List sx={{maxWidth: '35em', maxHeight: '100%'}}>
            <OpenOption text='Create a new project' iconClass='create_new_folder_two_tone' onClick={onNew}/>
            <OpenOption text='Get a project from GitHub' iconClass='download_two_tone' onClick={onOpenFromGitHub}/>
            <OpenOption text='Open an existing project on your computer' iconClass='folder_open_two_tone' onClick={onOpen}/>
            <OpenOption text='Help' iconClass='help_two_tone' onClick={onHelp}/>
        </List>
        </nav>

    </Box>

    return <Box display='flex' flexDirection='column' height='100%' width='100%'>
        {OverallAppBar}
        <Box flex='1' minHeight={0}>
            <Grid container columns={20} spacing={0} height='100%'>
                <Grid size={20} height='100%' className='editorDialogContainer' position='relative'>
                    {EditorHeader}
                    <Box display='flex' flexDirection='column' height='100%' width='100%'>
                        {WelcomeText}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    </Box>
}
