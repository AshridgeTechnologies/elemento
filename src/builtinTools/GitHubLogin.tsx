import * as React from 'react'
import {Button, Link, Typography} from '@mui/material'
import {currentUser, signIn, signOut, useSignedInState} from '../shared/authentication'

export default function GitHubLogin() {
    const isSignedIn = useSignedInState()
    const user = currentUser()

    return (
        <div>{
            isSignedIn
                ? <>
                    <Typography>Signed in to GitHub as {user!.displayName ?? user!.email}</Typography>
                    <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1'
                          onClick={signOut}>Sign Out</Link>
                  </>
                : <Button variant='outlined'
                          aria-label="Sign In to GitHub"
                          onClick={signIn}>Sign In to GitHub
                </Button>
        }
        </div>
    )
}