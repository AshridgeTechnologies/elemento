import * as React from 'react'
import GitHub from '@mui/icons-material/GitHub'
import {currentUser, signIn, signOut, useGitHubSignInState} from './gitHubAuthentication'
import ServiceConnection from './ServiceConnection'

export default function GitHubConnection() {
    const isSignedIn = useGitHubSignInState()
    const user = currentUser()

    return ServiceConnection({
        serviceName: 'GitHub',
        icon: GitHub,
        signIn,
        signOut,
        signedInInfo: () => isSignedIn ? `Connected as ${user!.email} (${user!.displayName})` : null
    })
}
