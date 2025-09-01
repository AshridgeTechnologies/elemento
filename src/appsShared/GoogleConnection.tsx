import * as React from 'react'
import Google from '@mui/icons-material/Google'
import {authorizeWithGoogle, deauthorize, googleAccessToken} from './gisProvider'
import ServiceConnection from './ServiceConnection'

export default function GoogleConnection() {
    return ServiceConnection({
        serviceName: 'Google',
        icon: Google,
        signIn: authorizeWithGoogle,
        signOut: deauthorize,
        signedInInfo: () => googleAccessToken() ? 'Connected' : null
    })
}
