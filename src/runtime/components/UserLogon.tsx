import * as React from 'react'
import {createElement, useEffect, useRef, useState} from 'react'
import {Box, Button, Icon, IconButton, Link, Popover, Typography} from '@mui/material'
import {authIsReady, getAuth, onAuthChange, currentUser, signOut, useSignedInState, isSignedIn} from './authentication'
import * as auth from 'firebase/auth'
import {StyledFirebaseAuth} from 'react-firebaseui'

function AuthDialog(props: {onSignIn: VoidFunction}) {
    const uiConfig = {
        signInFlow: 'popup',
        signInOptions: [
            auth.GoogleAuthProvider.PROVIDER_ID,
            auth.EmailAuthProvider.PROVIDER_ID,
        ],
        tosUrl: '/terms',
        privacyPolicyUrl: '/privacy',
        callbacks: {
            signInSuccessWithAuthResult: () => {
                props.onSignIn()
                return false
            }
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

    const [isAuthReady, setAuthReady] = useState(authIsReady)
    useSignedInState()
    useEffect(() => onAuthChange( () => setAuthReady(authIsReady) ), [])
    const buttonRef = useRef(null)

    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(buttonRef.current)}
    const handleLogout = () => {
        signOut()
        handleClose()
    }
    const handleSignIn = () => {
        setTimeout(handleClose, 4000)
    }

    if (!isAuthReady) {
        return <Typography>Connecting...</Typography>
    }

    const userPanel = isSignedIn() ?
        <Box minWidth={300} margin={2}>
            <Typography variant='body1'>Logged in as {currentUser()!.displayName}</Typography>
            <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1' marginTop={1}
                  onClick={handleLogout}>Logout</Link>
        </Box>
        : <Box minWidth={300} margin={2}>
            <Typography variant='body1'>Please log in or sign up</Typography>
            <AuthDialog onSignIn={handleSignIn}/>
        </Box>

    return (
        <div ref={buttonRef}>{

            isSignedIn()
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
                : <Button variant='contained' size='small' disableElevation={true}
                          aria-label="account of current user"
                          aria-controls="userMenu"
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          onClick={handleButtonClick}
                          sx={{px: 1, minWidth: '32px'}}
                >Login
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
                sx={{marginTop: '8px'}}
            >
                {userPanel}
            </Popover>
        </div>
    )
}
