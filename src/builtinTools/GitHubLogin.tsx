import * as React from 'react'
import {Button, Link, Typography} from '@mui/material'
import {currentUser, isSignedIn, signIn, signOut} from '../shared/authentication'
import {useState} from 'react'

export default function GitHubLogin() {
    const [, setUpdate] = useState(0)
    const refresh = ()=> setUpdate(prev => prev + 1)
    const withRefresh = (fn: () => Promise<void>) => ()=> fn().then( refresh )
    const user = currentUser()

    return (
        <div>{
            isSignedIn()
                ? <>
                    <Typography>Signed in to GitHub as {user!.email} - {user!.displayName ?? ''}</Typography>
                    <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1'
                          onClick={withRefresh(signOut)}>Sign Out</Link>
                  </>
                : <Button variant='outlined'
                          aria-label="Sign In to GitHub"
                          onClick={withRefresh(signIn)}>Sign In to GitHub
                </Button>
        }
        </div>
    )
}