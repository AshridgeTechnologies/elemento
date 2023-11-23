import React, {ChangeEvent, useState} from 'react'
import {useAsync} from 'react-async'
import {Button, Stack, TextField, Typography} from '@mui/material'
import {googleAccessToken, useAuthorizedState} from '../shared/gisProvider'
import {currentUser, gitHubAccessToken, useSignedInState} from '../shared/authentication'
import {Editor} from '../editorToolApis/EditorControllerClient'
import GitHubConnection from '../shared/GitHubConnection'
import GoogleConnection from '../shared/GoogleConnection'

const deployProject = async (gitRepoUrl: string, firebaseProjectId: string) => {
    console.log('Deploying from', gitRepoUrl, 'to', firebaseProjectId)
    const deployUrl = `https://europe-west2-${firebaseProjectId}.cloudfunctions.net/ext-elemento-app-server-adminServer/deploy`
    const data = {gitRepoUrl}
    try {
        const response = await fetch(deployUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Access-Token': gitHubAccessToken()!,
                'X-Firebase-Access-Token': googleAccessToken()!
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error(`Status: ${response.status} ${response.statusText}`);
        }
    } catch (e: any) {
        throw new Error(`Deploy failed: ${e.message}`)
    }
}

const getSettings = ()=> Editor.GetSettings('firebase').then( (settings: any) => settings.projectId)

function GitHubLogin() {
    const signedIn = useSignedInState()
    const user = currentUser()

    return (
        <Stack direction='row' spacing={4}>
            <GitHubConnection/>
            <Typography>{signedIn
                ? `Connected to GitHub as ${user!.email} - ${user!.displayName ?? ''}`
                : 'Connection to GitHub required'}</Typography>
        </Stack>
    )
}

function GoogleLogin() {
    const signedIn = useAuthorizedState()

    return (
        <Stack direction='row' spacing={4}>
            <GoogleConnection/>
            <Typography>{signedIn
                ? `Connected to Google`
                : 'Connection to Google required'}</Typography>
        </Stack>
    )
}

export default function FirebaseDeploy() {
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('')
    const {data: firebaseProjectIdFromSettings} = useAsync({promiseFn: getSettings})
    const [firebaseProject, setFirebaseProject] = useState<string | null>(null)
    const [message, setMessage] = useState<string>('')

    const updateGitRepoUrl = (event: ChangeEvent) => {setGitRepoUrl((event.target as HTMLInputElement).value)}
    const updateFirebaseProject = (event: ChangeEvent) => {setFirebaseProject((event.target as HTMLInputElement).value || null)}
    const deploy = () => {
        setMessage('Deploying...')
        deployProject(gitRepoUrl, firebaseProject!).then(
            () => setMessage('Deploy succeeded'),
            (e: Error) => setMessage('Deploy failed: ' + e.message)
        )
    }
    const readyToDeploy = googleAccessToken() && gitHubAccessToken() && gitRepoUrl && firebaseProject
    const updateSettings = () => {
        Editor.UpdateSettings('firebase', {projectId: firebaseProject})
    }
    const canUpdateSettings = window.parent !== window.self
    const firebaseProjectIdValue = firebaseProject ?? firebaseProjectIdFromSettings ?? ''
    return <Stack padding={2} spacing={2}>
        <Typography variant={'h1'} mb={2} fontSize={36}>Deploy to Firebase</Typography>
        <GitHubLogin/>
        <GoogleLogin/>
        <TextField label='Git Repo URL' size='small' sx={{width: '40em'}} onChange={updateGitRepoUrl}/>
        <TextField label='Firebase Project Id' size='small' sx={{width: '40em'}} onChange={updateFirebaseProject} value={firebaseProjectIdValue}/>
        <Stack direction='row' spacing={2}>
            <Button variant='contained'  sx={{width: '10em'}} disabled={!readyToDeploy} onClick={deploy}>Deploy</Button>
            {canUpdateSettings ? <Button variant='outlined'  sx={{width: '15em'}} onClick={updateSettings}>Update Settings</Button> : null}
        </Stack>
        <Typography variant={'h1'} mt={4} fontSize={18}>{message}</Typography>
    </Stack>
}