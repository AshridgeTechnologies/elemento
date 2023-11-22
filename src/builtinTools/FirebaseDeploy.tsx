import React, {ChangeEvent, useState} from 'react'
import GitHubLogin from './GitHubLogin'
import {Button, Stack, TextField, Typography} from '@mui/material'
import GoogleLogin from './GoogleLogin'
import {googleAccessToken} from '../shared/gisProvider'
import {gitHubAccessToken} from '../shared/authentication'

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

export default function FirebaseDeploy() {
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('')
    const [firebaseProject, setFirebaseProject] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const updateGitRepoUrl = (event: ChangeEvent) => {setGitRepoUrl((event.target as HTMLInputElement).value)}
    const updateFirebaseProject = (event: ChangeEvent) => {setFirebaseProject((event.target as HTMLInputElement).value)}
    const deploy = () => {
        setMessage('Deploying...')
        deployProject(gitRepoUrl, firebaseProject).then(
            () => setMessage('Deploy succeeded'),
            (e: Error) => setMessage('Deploy failed: ' + e.message)
        )
    }
    const readyToDeploy = googleAccessToken() && gitHubAccessToken() && gitRepoUrl && firebaseProject
    return <Stack padding={2} spacing={2}>
        <Typography variant={'h1'} mb={2} fontSize={36}>Deploy to Firebase</Typography>
        <GitHubLogin/>
        <GoogleLogin/>
        <TextField label='Git Repo URL' size='small' sx={{width: '40em'}} onChange={updateGitRepoUrl}/>
        <TextField label='Firebase Project Id' size='small' sx={{width: '40em'}} onChange={updateFirebaseProject}/>
        <Button variant='outlined'  sx={{width: '10em'}} disabled={!readyToDeploy} onClick={deploy}>Deploy</Button>
        <Typography variant={'h1'} mt={4} fontSize={18}>{message}</Typography>
    </Stack>
}