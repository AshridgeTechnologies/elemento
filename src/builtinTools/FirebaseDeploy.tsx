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

const getSettings = ()=> Editor.GetSettings('firebase')

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

function FieldSet({title, children}: {title: string, children: React.ReactNode}) {
    return <Stack mt={4} border='1px solid lightgray' borderRadius={2} padding={2} spacing={2}>
        <Typography variant={'h2'} mb={2} fontSize={24}>{title}</Typography>
        {children}
    </Stack>
}

export default function FirebaseDeploy() {
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('')
    const settings = useAsync({promiseFn: getSettings})
    const {projectId: firebaseProjectIdFromSettings, previewPassword: previewPasswordFromSettings} = settings.data ?? {}
    const [firebaseProject, setFirebaseProject] = useState<string | null>(null)
    const [previewPassword, setPreviewPassword] = useState<string | null>(null)
    const [message, setMessage] = useState<string>('')

    const updateGitRepoUrl = (event: ChangeEvent) => {setGitRepoUrl((event.target as HTMLInputElement).value)}
    const updateFirebaseProject = (event: ChangeEvent) => {setFirebaseProject((event.target as HTMLInputElement).value ?? null)}
    const updatePreviewPassword = (event: ChangeEvent) => {setPreviewPassword((event.target as HTMLInputElement).value ?? null)}
    const firebaseProjectIdValue = firebaseProject ?? firebaseProjectIdFromSettings ?? ''
    const previewPasswordValue = previewPassword ?? previewPasswordFromSettings ?? ''
    const readyToDeploy = googleAccessToken() && gitHubAccessToken() && gitRepoUrl && firebaseProjectIdValue
    const isInToolWindow = window.parent !== window.self

    const updateSettings = () => {
        Editor.UpdateSettings('firebase', {projectId: firebaseProjectIdValue, previewPassword: previewPasswordValue})
    }

    const deploy = () => {
        setMessage('Deploying...')
        deployProject(gitRepoUrl, firebaseProjectIdValue!).then(
            () => setMessage('Deploy succeeded'),
            (e: Error) => setMessage('Deploy failed: ' + e.message)
        )
    }
    return <Stack padding={2} spacing={2}>
        <Typography variant={'h1'} mb={2} fontSize={32}>Deploy to Firebase</Typography>

        <FieldSet title='Settings'>
            <TextField label='Firebase Project Id' size='small' sx={{width: '40em'}} onChange={updateFirebaseProject} value={firebaseProjectIdValue}/>
            {isInToolWindow ?
                <>
                    <TextField label='Preview password' type='password' size='small' sx={{width: '40em'}} onChange={updatePreviewPassword} value={previewPasswordValue}/>
                    <Button variant='outlined'  sx={{width: '10em'}} onClick={updateSettings}>Save</Button>
                </> : null}
        </FieldSet>

        <FieldSet title='Deploy (Publish)'>
            <GitHubLogin/>
            <GoogleLogin/>
            <TextField label='Git Repo URL' size='small' sx={{width: '40em'}} onChange={updateGitRepoUrl}/>
            <Button variant='contained'  sx={{width: '10em'}} disabled={!readyToDeploy} onClick={deploy}>Deploy</Button>
            <Typography variant={'h1'} mt={4} fontSize={18}>{message}</Typography>
        </FieldSet>
    </Stack>
}