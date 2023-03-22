import React, {useState} from 'react'
import {OnGetFromGitHubFn, OnNewFn, OnOpenFn, VoidFn} from './Types'
import AppBar from '../shared/AppBar'
import MenuBar from './MenuBar'
import {ElementType} from '../model/Types'
import {elementTypes} from '../model/elements'

import {Box, Button, Grid, Icon, List, ListItem, ListItemIcon, Typography, useTheme} from '@mui/material'
import FileMenu from './FileMenu'
import './splitPane.css'
import Project from '../model/Project'
import {useSignedInState} from '../shared/authentication'
import EditorHelpPanel from './EditorHelpPanel'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

Object.keys(elementTypes()) as ElementType[]
React.createContext<Project | null>(null)

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



export default function ProjectOpener({onNew, onOpen, onGetFromGitHub,}: { onOpen: OnOpenFn, onNew: OnNewFn, onGetFromGitHub: OnGetFromGitHubFn}) {
    const [helpVisible, setHelpVisible] = useState(false)
    const onHelp = () => {setHelpVisible(!helpVisible)}

    const signedIn = useSignedInState()
    const appBarTitle = `Elemento Studio`
    const OverallAppBar = <Box flex='0'>
        <AppBar title={appBarTitle}/>
    </Box>
    const EditorHeader = <Box flex='0'>
        <MenuBar>
            <FileMenu onNew={onNew} onOpen={onOpen} onGetFromGitHub={onGetFromGitHub} signedIn={signedIn}/>
            <Button id='downloads' href='/downloads'>Downloads</Button>
            <Button id='help' color={'secondary'} onClick={onHelp}>Help</Button>
        </MenuBar>
    </Box>

    const WelcomeText = <Box p={3} maxHeight='100%' overflow='auto' boxSizing='border-box'>
        <Typography variant={'h4'}>Welcome to the Elemento Studio</Typography>
        <Typography variant={'body1'} fontSize='1.3em' mt={2}>Choose one of these options to open an Elemento project and get started</Typography>
        <Typography variant={'body1'} fontSize='1.3em' mt={2}>Or click Help to learn more about using Elemento</Typography>

        <nav aria-label="Open an Elemento project">
        <List sx={{maxWidth: '35em', maxHeight: '100%'}}>
            <OpenOption text='Create a new project' iconClass='create_new_folder_two_tone' onClick={onNew}/>
            <OpenOption text='Open an existing project on your computer' iconClass='folder_open_two_tone' onClick={onOpen}/>
            <OpenOption text='Get a project stored in GitHub' iconClass='download_two_tone' onClick={onGetFromGitHub}/>
            <OpenOption text='Help' iconClass='help_two_tone' onClick={onHelp}/>
        </List>
        </nav>

    </Box>

    return <Box display='flex' flexDirection='column' height='100%' width='100%'>
        {OverallAppBar}
        <Box flex='1' minHeight={0}>
            <Grid container columns={20} spacing={0} height='100%'>
                <Grid item xs={20} height='100%'>
                    {EditorHeader}
                    <Box display='flex' flexDirection='column' height='100%' width='100%'>
                        <Box flex='1' maxHeight={helpVisible ? '50%' : '100%'}>
                            {WelcomeText}
                        </Box>
                        {helpVisible ?
                            <Box flex='1' maxHeight='50%'>
                                <EditorHelpPanel onClose={onHelp}/>
                            </Box> : null
                        }
                    </Box>
                </Grid>
            </Grid>
        </Box>
    </Box>
}