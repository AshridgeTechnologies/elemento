import React from 'react'
import GitHubLogin from './GitHubLogin'
import {Box, Typography} from '@mui/material'
import GoogleLogin from './GoogleLogin'

export default function FirebaseDeploy() {
    return <Box padding={2}>
        <Typography variant={'h1'} mb={2} fontSize={36}>Deploy to Firebase</Typography>
        <GitHubLogin/>
        <GoogleLogin/>
    </Box>
}