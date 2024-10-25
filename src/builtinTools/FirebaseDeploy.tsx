import React, {ChangeEvent, useEffect, useState} from 'react'
import {useAsync} from 'react-async'
import {Button, Link, Stack, TextField, Typography} from '@mui/material'
import {googleAccessToken, useAuthorizedState} from '../appsShared/gisProvider'
import {currentUser, gitHubAccessToken, signIn, useGitHubSignInState} from '../appsShared/gitHubAuthentication'
import {Editor} from '../editorToolApis/EditorControllerClient'
import GitHubConnection from '../appsShared/GitHubConnection'
import GoogleConnection from '../appsShared/GoogleConnection'

type ProjectStatus = {
    ok: boolean,
    extensionFound?: boolean,
    description: string
}

const serverBaseUrl = 'http://localhost:9090'
const serverUrl = (type: 'app' | 'admin' | 'preview') => serverBaseUrl + '/' + type

const deployProject = async (gitRepoUrl: string, elementoServerUrl: string) => {
    console.log('Deploying from', gitRepoUrl, 'to', elementoServerUrl)
    const deployUrl = `${elementoServerUrl}/admin/deploy`
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

const initFirebaseProject = async (elementoServerUrl: string, previewPassword: string) => {
    console.log('Initialising', elementoServerUrl)
    const initUrl = `${elementoServerUrl}/admin/setup`
    const data = {previewPassword}
    try {
        const response = await fetch(initUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Firebase-Access-Token': googleAccessToken()!
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error(`Status: ${response.status} ${response.statusText}`);
        }
    } catch (e: any) {
        throw new Error(`Firebase project setup failed: ${e.message}`)
    }
}

const getFirebaseProjectStatus = async (elementoServerUrl: string): Promise<ProjectStatus> => {
    console.log('Check status', elementoServerUrl)
    const statusUrl = `${elementoServerUrl}/admin/status`
    try {
        const response = await fetch(statusUrl)
        if (response.status === 404) {
            return {ok: false, extensionFound: false, description: `Could not find Elemento Server at ${elementoServerUrl}`}
        }
        if (!response.ok) {
            return {ok: false, extensionFound: true, description: 'Error checking Elemento Server - status: ' + response.status}
        }

        return {ok: true, extensionFound: true, description: `Elemento Server set up OK at ${elementoServerUrl}`}
    } catch (e: any) {
        const message = e instanceof TypeError ? 'Project does not exist or Elemento Server not installed' : e.message
        return {ok: false, extensionFound: false, description: 'Error checking Elemento Server - ' + message}
    }
}

const getSettings = ()=> Editor.GetSettings('firebase')

function GitHubLogin() {
    const signedIn = useGitHubSignInState()
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
        <Typography variant='h2' mb={2} fontSize={24}>{title}</Typography>
        {children}
    </Stack>
}

export default function FirebaseDeploy() {
    useGitHubSignInState()  // so refresh when it changes
    useAuthorizedState() // so refresh when it changes

    const [settingsUpdateTime, setSettingsUpdateTime] = useState(0)
    const settings = useAsync({promiseFn: getSettings, watch: settingsUpdateTime})

    const {elementoServerUrl: elementoServerUrlFromSettings, previewPassword: previewPasswordFromSettings} = settings.data ?? {}
    const [previewElementoServerUrl, setPreviewElementoServerUrl] = useState<string | null>(null)
    const [previewPassword, setPreviewPassword] = useState<string | null>(null)
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('')
    const [deployElementoServerUrl, setDeployElementoServerUrl] = useState<string | null>(null)
    const [message, setMessage] = useState<React.ReactNode>(null)
    const [projectStatusRequested, setProjectStatusRequested] = useState(false)
    const [projectStatus, setProjectStatus] = useState<ProjectStatus>()

    const updateGitRepoUrl = (event: ChangeEvent) => {setGitRepoUrl((event.target as HTMLInputElement).value)}
    const updateDeployElementoServerUrl = (event: ChangeEvent) => {setDeployElementoServerUrl((event.target as HTMLInputElement).value ?? null)}
    const updatePreviewElementoServerUrl = (event: ChangeEvent) => {
        setPreviewElementoServerUrl((event.target as HTMLInputElement).value ?? null)
    }
    const updatePreviewPassword = (event: ChangeEvent) => {setPreviewPassword((event.target as HTMLInputElement).value ?? null)}
    const previewElementoServerUrlValue = previewElementoServerUrl ?? elementoServerUrlFromSettings ?? ''
    const previewPasswordValue = previewPassword ?? previewPasswordFromSettings ?? ''
    const deployElementoServerUrlValue = deployElementoServerUrl ?? elementoServerUrlFromSettings ?? ''
    const readyToSetup = googleAccessToken() && previewElementoServerUrlValue && previewPasswordValue
    const readyToDeploy = googleAccessToken() && gitHubAccessToken() && gitRepoUrl && deployElementoServerUrlValue && projectStatus?.ok
    const isInToolWindow = window.parent !== window.self

    const updateSettings = async () => {
        await Editor.UpdateSettings('firebase', {elementoServerUrl: previewElementoServerUrlValue, previewPassword: previewPasswordValue})
        setSettingsUpdateTime(Date.now())
        await initFirebase()
    }

    const deploy = () => {
        setMessage('Deploying...')
        deployProject(gitRepoUrl, deployElementoServerUrlValue!).then(
            () => {
                setMessage(<span>Deploy succeeded</span>)
            },
            (e: Error) => setMessage('Deploy failed: ' + e.message)
        )
    }

    const initFirebase = () => {
        setProjectStatus({ok: false, extensionFound: true, description: 'Setting up Firebase project...'})
        // handle both success and error by checking status
        const checkStatus = () => checkProjectStatus(previewElementoServerUrlValue)
        return initFirebaseProject(previewElementoServerUrlValue, previewPasswordValue).then(checkStatus, checkStatus)
    }

    const checkProjectStatus = (elementoServerUrl: string) => {
        setProjectStatus({ok: false, extensionFound: undefined, description: 'Checking Firebase project status...'})
        return getFirebaseProjectStatus(elementoServerUrl).then(setProjectStatus,
            (e: Error) => setProjectStatus({ok: false, description: 'Could not get Firebase project status: ' + e.message})
        )
    }

    if (!projectStatusRequested && elementoServerUrlFromSettings) {
        checkProjectStatus(elementoServerUrlFromSettings)
        setProjectStatusRequested(true)
    }

    const deployedUrl = deployElementoServerUrlValue && `https://${deployElementoServerUrlValue}.web.app`

    return <Stack padding={2} spacing={2}>
        <Typography variant='h1' mb={2} fontSize={32}>Firebase</Typography>

        {isInToolWindow ?
            <>
                <FieldSet title='Project Settings'>
                    <GoogleLogin/>
                    <TextField label='Elemento Server URL' size='small' sx={{width: '40em'}} onChange={updatePreviewElementoServerUrl}
                               value={previewElementoServerUrlValue}/>
                    <TextField label='Preview password' type='password' size='small' sx={{width: '40em'}} onChange={updatePreviewPassword}
                               value={previewPasswordValue}/>
                    <Button variant='outlined' sx={{width: '10em'}} onClick={updateSettings} disabled={!readyToSetup}>Save</Button>
                    <Typography variant='h1' mt={4} fontSize={18}>{projectStatus?.description}</Typography>
                    {/*{projectStatus?.extensionFound === false && <Link variant='body1'*/}
                    {/*       href={`https://console.firebase.google.com/project/${elementoServerUrlFromSettings}/extensions/install?ref=elemento/elemento-app-server@${elementoAppServerVersion}`}*/}
                    {/*       target='_blank'>Install Elemento server at {elementoServerUrlFromSettings}</Link>}*/}
                </FieldSet>
            </>
            : null}

        <FieldSet title='Deploy (Publish)'>
            <GitHubLogin/>
            <GoogleLogin/>
            <TextField label='Deploy from Git Repo URL' size='small' sx={{width: '40em'}} onChange={updateGitRepoUrl} />
            <TextField label='Deploy to Elemento Server URL' size='small' sx={{width: '40em'}} onChange={updateDeployElementoServerUrl} value={deployElementoServerUrlValue}/>
            <Typography variant='h1' mt={4} fontSize={16} fontWeight='600'>
                Note: the project is deployed from GitHub, not this computer.
                If you have made changes that you have not saved to GitHub, they will not be included.
            </Typography>

            <Button variant='contained'  sx={{width: '10em'}} disabled={!readyToDeploy} onClick={deploy}>Deploy</Button>
            <Typography variant='h1' mt={4} fontSize={18}>{message}</Typography>
            <Typography variant='h1' mt={4} fontSize={18}>App URL when deployed: <Link href={deployedUrl} target='_blank'>{deployedUrl}</Link></Typography>

        </FieldSet>
    </Stack>
}
