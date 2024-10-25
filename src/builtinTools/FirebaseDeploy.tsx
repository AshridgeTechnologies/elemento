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
    serverFound?: boolean,
    description: string
}

const elementoOnlineUrl = 'elemento.online'

const deployProject = async (gitRepoUrl: string, firebaseProjectId: string) => {
    console.log('Deploying from', gitRepoUrl, 'to', firebaseProjectId)
    const deployUrl = `https://${firebaseProjectId}.web.app/admin/deploy`
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

const installProject = async (firebaseProject: string) => {
    console.log('Installing Elemento server to', firebaseProject)
    const installUrl = `https://${elementoOnlineUrl}/install/`
    const data = {firebaseProject}
    try {
        const response = await fetch(installUrl, {
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
        throw new Error(`Install failed: ${e.message}`)
    }
}

const initFirebaseProject = async (firebaseProject: string, previewPassword: string) => {
    console.log('Initialising', 'project', firebaseProject)
    const initUrl = `https://${firebaseProject}.web.app/admin/setup`
    const data = {firebaseProject, settings: {previewPassword}}
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

const getFirebaseProjectStatus = async (firebaseProjectId: string): Promise<ProjectStatus> => {
    console.log('Check status', firebaseProjectId)
    const elementoServerUrl = `https://${firebaseProjectId}.web.app`
    const statusUrl = `${elementoServerUrl}/admin/status`
    try {
        const response = await fetch(statusUrl)
        if (response.status === 404) {
            return {ok: false, serverFound: false, description: `Could not find Elemento Server at ${elementoServerUrl}`}
        }
        if (!response.ok) {
            return {ok: false, serverFound: true, description: 'Error checking Elemento Server - status: ' + response.status}
        }

        return {ok: true, serverFound: true, description: `Elemento Server set up OK at ${elementoServerUrl}`}
    } catch (e: any) {
        const message = e instanceof TypeError ? 'Project does not exist or Elemento Server not installed' : e.message
        return {ok: false, serverFound: false, description: 'Error checking Elemento Server - ' + message}
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

function FieldSet({id, title, children}: {id?: string, title: string, children: React.ReactNode}) {
    return <Stack id={id} mt={4} border='1px solid lightgray' borderRadius={2} padding={2} spacing={2}>
        <Typography variant='h2' mb={2} fontSize={24}>{title}</Typography>
        {children}
    </Stack>
}

export default function FirebaseDeploy() {
    useGitHubSignInState()  // so refresh when it changes
    useAuthorizedState() // so refresh when it changes

    const [settingsUpdateTime, setSettingsUpdateTime] = useState(0)
    const settings = useAsync({promiseFn: getSettings, watch: settingsUpdateTime})

    const {previewPassword: previewPasswordFromSettings, previewFirebaseProject: previewFirebaseProjectFromSettings} = settings.data ?? {}
    const [previewPassword, setPreviewPassword] = useState<string | null>(null)
    const [previewFirebaseProject, setPreviewFirebaseProject] = useState<string | null>(null)
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('')
    const [deployFirebaseProject, setDeployFirebaseProject] = useState<string | null>(null)
    const [installFirebaseProject  , setInstallFirebaseProject] = useState<string | null>(null)
    const [message, setMessage] = useState<React.ReactNode>(null)
    const [installMessage, setInstallMessage] = useState<React.ReactNode>(null)
    const [projectStatusRequested, setProjectStatusRequested] = useState(false)
    const [projectStatus, setProjectStatus] = useState<ProjectStatus>()

    const updateGitRepoUrl = (event: ChangeEvent) => {setGitRepoUrl((event.target as HTMLInputElement).value)}
    const updateDeployFirebaseProject = (event: ChangeEvent) => {setDeployFirebaseProject((event.target as HTMLInputElement).value ?? null)}
    const updateInstallFirebaseProject = (event: ChangeEvent) => {setInstallFirebaseProject((event.target as HTMLInputElement).value ?? null)}
    const updatePreviewPassword = (event: ChangeEvent) => {setPreviewPassword((event.target as HTMLInputElement).value ?? null)}
    const updatePreviewFirebaseProject = (event: ChangeEvent) => {setPreviewFirebaseProject((event.target as HTMLInputElement).value ?? null)}
    const previewFirebaseProjectValue = previewFirebaseProject ?? previewFirebaseProjectFromSettings ?? ''
    const previewPasswordValue = previewPassword ?? previewPasswordFromSettings ?? ''
    const deployFirebaseProjectValue = deployFirebaseProject ?? ''
    const readyToSetup = googleAccessToken() && previewPasswordValue && previewFirebaseProject
    const readyToDeploy = googleAccessToken() && gitHubAccessToken() && gitRepoUrl && deployFirebaseProjectValue && projectStatus?.ok
    const readyToInstall = googleAccessToken() && installFirebaseProject
    const isInToolWindow = window.parent !== window.self

    const updateSettings = async () => {
        await Editor.UpdateSettings('firebase', {previewPassword: previewPasswordValue, previewFirebaseProject: previewFirebaseProjectValue})
        setSettingsUpdateTime(Date.now())
        await initFirebase()
    }

    const deploy = () => {
        setMessage('Deploying...')
        deployProject(gitRepoUrl, deployFirebaseProjectValue!).then(
            () => {
                setMessage(<span>Deploy succeeded</span>)
            },
            (e: Error) => setMessage('Deploy failed: ' + e.message)
        )
    }

    const install = () => {
        setInstallMessage('Installing...')
        installProject(installFirebaseProject!).then(
            () => {
                setInstallMessage(<span>Install succeeded</span>)
            },
            (e: Error) => setInstallMessage('Install failed: ' + e.message)
        )
    }

    const initFirebase = () => {
        setProjectStatus({ok: false, serverFound: true, description: 'Setting up Firebase project...'})
        // handle both success and error by checking status
        const checkStatus = () => checkProjectStatus(previewFirebaseProject!)
        return initFirebaseProject(previewFirebaseProject!, previewPasswordValue).then(checkStatus, checkStatus)
    }

    const checkProjectStatus = (firebaseProjectId: string) => {
        setProjectStatus({ok: false, serverFound: undefined, description: 'Checking Firebase project status...'})
        return getFirebaseProjectStatus(firebaseProjectId).then(setProjectStatus,
            (e: Error) => setProjectStatus({ok: false, description: 'Could not get Firebase project status: ' + e.message})
        )
    }

    if (!projectStatusRequested && previewFirebaseProjectFromSettings) {
        checkProjectStatus(previewFirebaseProjectFromSettings)
        setProjectStatusRequested(true)
    }

    const deployedUrl = deployFirebaseProjectValue && `https://${deployFirebaseProjectValue}.web.app`
    const installedUrl = installFirebaseProject && `https://${installFirebaseProject}.web.app/admin/`

    return <Stack padding={2} spacing={2}>
        <Typography variant='h1' mb={2} fontSize={32}>Firebase</Typography>

        {isInToolWindow ?
            <>
                <FieldSet title='Project Settings'>
                    <GoogleLogin/>
                    <TextField label='Firebase project' size='small' sx={{width: '40em'}} onChange={updatePreviewFirebaseProject}
                               value={previewFirebaseProjectValue}/>
                    <TextField label='Preview password' type='password' size='small' sx={{width: '40em'}} onChange={updatePreviewPassword}
                               value={previewPasswordValue}/>
                    <Button variant='outlined' sx={{width: '10em'}} onClick={updateSettings} disabled={!readyToSetup}>Save</Button>
                    <Typography variant='h1' mt={4} fontSize={18}>{projectStatus?.description}</Typography>
                    {projectStatus?.serverFound === false && <Link variant='body1' href='#install'>Install Elemento server</Link>}
                </FieldSet>
            </>
            : null}

        <FieldSet title='Deploy (Publish)'>
            <GitHubLogin/>
            <GoogleLogin/>
            <TextField label='Deploy from Git Repo URL' size='small' sx={{width: '40em'}} onChange={updateGitRepoUrl} />
            <TextField label='Firebase project' size='small' sx={{width: '40em'}} onChange={updateDeployFirebaseProject}
                       value={deployFirebaseProjectValue}/>
            <Typography variant='h1' mt={4} fontSize={16} fontWeight='600'>
                Note: the project is deployed from GitHub, not this computer.
                If you have made changes that you have not saved to GitHub, they will not be included.
            </Typography>

            <Button variant='contained'  sx={{width: '10em'}} disabled={!readyToDeploy} onClick={deploy}>Deploy</Button>
            <Typography variant='h1' mt={4} fontSize={18}>{message}</Typography>
            <Typography variant='h1' mt={4} fontSize={18}>App URL when deployed: <Link href={deployedUrl} target='_blank'>{deployedUrl}</Link></Typography>

        </FieldSet>

        <FieldSet title='Install Elemento Server' id='install'>
            <GoogleLogin/>
            <TextField label='Firebase Project' size='small' sx={{width: '40em'}} onChange={updateInstallFirebaseProject} value={installFirebaseProject}/>

            <Button variant='contained'  sx={{width: '10em'}} disabled={!readyToInstall} onClick={install}>Install</Button>
            <Typography variant='h1' mt={4} fontSize={18}>{installMessage}</Typography>
            {installedUrl ? <Typography variant='h1' mt={4} fontSize={18}>Elemento server admin URL (when installed): <Link href={installedUrl} target='_blank'>{installedUrl}</Link></Typography> : null}
        </FieldSet>
    </Stack>
}
