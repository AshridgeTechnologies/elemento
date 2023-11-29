import * as React from 'react'
import {GitHub} from '@mui/icons-material'
import {currentUser, signIn, signOut, useSignedInState} from './authentication'
import ServiceConnection from './ServiceConnection'

export default function GitHubConnection() {
    const isSignedIn = useSignedInState()
    const user = currentUser()

    return ServiceConnection({
        serviceName: 'GitHub',
        icon: GitHub,
        signIn,
        signOut,
        signedInInfo: () => isSignedIn ? `Connected as ${user!.email} (${user!.displayName})` : null
    })
}