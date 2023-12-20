import React, {ChangeEvent, useEffect, useState} from 'react'
import {useAsync} from 'react-async'
import {Button, Link, Stack, TextField, Typography} from '@mui/material'
import {googleAccessToken, useAuthorizedState} from '../appsShared/gisProvider'
import {currentUser, gitHubAccessToken, signIn, useSignedInState} from '../appsShared/gitHubAuthentication'
import {Editor} from '../editorToolApis/EditorControllerClient'
import GitHubConnection from '../appsShared/GitHubConnection'
import GoogleConnection from '../appsShared/GoogleConnection'

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

    useEffect(() => {
        if (signedIn && !gitHubAccessToken()) {
            signIn().then( ()=> console.log('Signed in to get access token'))
        }
    }, [signedIn])

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
    useSignedInState()  // so refresh when it changes
    useAuthorizedState() // so refresh when it changes

    const settings = useAsync({promiseFn: getSettings})
    const {projectId: firebaseProjectIdFromSettings, previewPassword: previewPasswordFromSettings} = settings.data ?? {}
    const [previewFirebaseProject, setPreviewFirebaseProject] = useState<string | null>(null)
    const [previewPassword, setPreviewPassword] = useState<string | null>(null)
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('')
    const [deployFirebaseProject, setDeployFirebaseProject] = useState<string | null>(null)
    const [message, setMessage] = useState<React.ReactNode>(null)

    const updateGitRepoUrl = (event: ChangeEvent) => {setGitRepoUrl((event.target as HTMLInputElement).value)}
    const updateDeployFirebaseProject = (event: ChangeEvent) => {setDeployFirebaseProject((event.target as HTMLInputElement).value ?? null)}
    const updatePreviewFirebaseProject = (event: ChangeEvent) => {setPreviewFirebaseProject((event.target as HTMLInputElement).value ?? null)}
    const updatePreviewPassword = (event: ChangeEvent) => {setPreviewPassword((event.target as HTMLInputElement).value ?? null)}
    const previewFirebaseProjectIdValue = previewFirebaseProject ?? firebaseProjectIdFromSettings ?? ''
    const previewPasswordValue = previewPassword ?? previewPasswordFromSettings ?? ''
    const deployFirebaseProjectIdValue = deployFirebaseProject ?? firebaseProjectIdFromSettings ?? ''
    const readyToDeploy = googleAccessToken() && gitHubAccessToken() && gitRepoUrl && deployFirebaseProjectIdValue
    const isInToolWindow = window.parent !== window.self

    const updateSettings = () => {
        Editor.UpdateSettings('firebase', {projectId: previewFirebaseProjectIdValue, previewPassword: previewPasswordValue})
    }

    const deploy = () => {
        setMessage('Deploying...')
        deployProject(gitRepoUrl, deployFirebaseProjectIdValue!).then(
            () => {
                setMessage(<span>Deploy succeeded</span>)
            },
            (e: Error) => setMessage('Deploy failed: ' + e.message)
        )
    }

    const deployedUrl = deployFirebaseProjectIdValue && `https://${deployFirebaseProjectIdValue}.web.app`

    return <Stack padding={2} spacing={2}>
        <Typography variant={'h1'} mb={2} fontSize={32}>Firebase</Typography>

        {isInToolWindow ?
        <FieldSet title='Preview Settings'>
            <TextField label='Firebase Project Id' size='small' sx={{width: '40em'}} onChange={updatePreviewFirebaseProject} value={previewFirebaseProjectIdValue}/>
            <TextField label='Preview password' type='password' size='small' sx={{width: '40em'}} onChange={updatePreviewPassword} value={previewPasswordValue}/>
            <Button variant='outlined'  sx={{width: '10em'}} onClick={updateSettings}>Save</Button>
        </FieldSet>
            : null}

        <FieldSet title='Deploy (Publish)'>
            <GitHubLogin/>
            <GoogleLogin/>
            <TextField label='Deploy from Git Repo URL' size='small' sx={{width: '40em'}} onChange={updateGitRepoUrl} />
            <TextField label='Deploy to Firebase Project Id' size='small' sx={{width: '40em'}} onChange={updateDeployFirebaseProject} value={deployFirebaseProjectIdValue}/>
            <Typography variant={'h1'} mt={4} fontSize={16} fontWeight='600'>
                Note: the project is deployed from GitHub, not this computer.
                If you have made changes that you have not saved to GitHub, they will not be included.
            </Typography>

            <Button variant='contained'  sx={{width: '10em'}} disabled={!readyToDeploy} onClick={deploy}>Deploy</Button>
            <Typography variant={'h1'} mt={4} fontSize={18}>{message}</Typography>
            <Typography variant={'h1'} mt={4} fontSize={18}>App URL when deployed: <Link href={deployedUrl} target='_blank'>{deployedUrl}</Link></Typography>

        </FieldSet>
    </Stack>
}