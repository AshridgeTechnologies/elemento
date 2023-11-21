import * as React from 'react'
import {useEffect, useRef, useState} from 'react'
import {Box, Link, Typography} from '@mui/material'
import {initGoogleAccounts, UserInfo} from '../shared/gsiProvider'


export default function GoogleLogin() {
    const [user, setUser] = useState<UserInfo | null>(null)
    const googleSignInButtonHolder = useRef<HTMLElement>(null)

    const signOut = () => setUser(null)

    useEffect(() => {
        initGoogleAccounts(googleSignInButtonHolder.current!, setUser)
    }, [])

    return (
        <div>{
            user
                ? <>
                    <Typography>Signed in to Google as {user!.name} ({user!.email})</Typography>
                    <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1'
                          onClick={signOut}>Sign Out</Link>
                  </>
                : 'Not signed in to Google'
        }
        <Box maxWidth={250} sx={{display: user === null ? 'inherit' : 'none'}} ref={googleSignInButtonHolder}>Google Sign In</Box>
        </div>
    )
}