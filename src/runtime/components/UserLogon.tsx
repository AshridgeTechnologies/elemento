import * as React from 'react'
import {Box, Button, Icon, IconButton, Link, Popover, Typography} from '@mui/material'
import authentication from './authentication'
import {createElement, useEffect, useState} from 'react'
import * as auth from 'firebase/auth'
import {StyledFirebaseAuth} from 'react-firebaseui'

const {authIsReady, getAuth, onAuthChange, currentUser, signOut, useSignedInState} = authentication

function AuthDialog() {
    const uiConfig = {
        signInFlow: 'popup',
        signInOptions: [
            auth.GoogleAuthProvider.PROVIDER_ID,
            auth.EmailAuthProvider.PROVIDER_ID,
        ],
        tosUrl: '/terms',
        privacyPolicyUrl: '/privacy',
        callbacks: {
            signInSuccessWithAuthResult: () => false
        }
    }

    if (!authIsReady()) {
        return createElement('div', null, 'Authentication not available')
    }
    return createElement(StyledFirebaseAuth, {uiConfig, firebaseAuth: getAuth()})
}

export default function UserLogon() {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleLogout = () => {
        signOut()
        handleClose()
    }

    const [isAuthReady, setAuthReady] = useState(authIsReady)
    const isSignedIn = useSignedInState()
    useEffect(() => onAuthChange( () => setAuthReady(authIsReady) ), [])

    if (!isAuthReady) {
        return <div>Connecting...</div>
    }

    const userPanel = isSignedIn ?
        <Box minWidth={300} margin={2}>
            <Typography variant='body1'>Logged in as {currentUser()!.displayName}</Typography>
            <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1' marginTop={1}
                  onClick={handleLogout}>Logout</Link>
        </Box>
        : <Box minWidth={400} margin={2}>
            <Typography variant='body1'>Please log in</Typography>
            <AuthDialog/>
        </Box>

    return (
        <div>{

            isSignedIn
                ? <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="userMenu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleButtonClick}
                color="inherit"
            >
                <Icon>account_circle</Icon>
            </IconButton>
                : <Button variant='contained' disableElevation={true}
                          aria-label="account of current user"
                          aria-controls="userMenu"
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          onClick={handleButtonClick}>Login
                </Button>
        }

            <Popover
                id='userPanel'
                data-testid="userPanel"
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                transformOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                {userPanel}
            </Popover>
        </div>
    )
}