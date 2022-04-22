import * as React from 'react'
import {useEffect, useState} from 'react'
import {Box, IconButton, Link, Popover, Typography} from '@mui/material'
import {AccountCircle} from '@mui/icons-material'
import {auth, getAuth} from './configuredFirebase'
import {StyledFirebaseAuth} from 'react-firebaseui'

function UserPanel({isSignedIn, handleLogout}: {isSignedIn: boolean, handleLogout: () => void}) {

    if (!isSignedIn) {
        const uiConfig = {
            signInFlow: 'popup',
            signInOptions: [
                auth.GoogleAuthProvider.PROVIDER_ID,
                auth.EmailAuthProvider.PROVIDER_ID,
            ],
            tosUrl: '/terms',
            privacyPolicyUrl: '/privacy',
        }
        return <Box minWidth={400} margin={2}>
            <Typography variant='body1'>Please sign-in</Typography>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={getAuth()} />
        </Box>
    }
    return <Box minWidth={300} margin={2}>
        <Typography variant='body1'>Signed in as {getAuth().currentUser!.displayName}</Typography>
        <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1' marginTop={1} onClick={handleLogout}>Logout</Link>
    </Box>

}

export default function UserMenu() {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleLogout = () => {
        getAuth().signOut()
        handleClose()
    }

    const [isSignedIn, setIsSignedIn] = useState(false)

    useEffect(() => {
        const unregisterAuthObserver = auth.onAuthStateChanged(getAuth(), user => setIsSignedIn(!!user))
        return () => unregisterAuthObserver() // Un-register Firebase observers when the component unmounts.
    }, [])

    return (
        <div>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="userMenu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleButtonClick}
                color="inherit"
            >
                <AccountCircle />
            </IconButton>

            <Popover
                id='userPanel'
                data-testid="userPanel"
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                transformOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <UserPanel isSignedIn={isSignedIn} handleLogout={handleLogout}/>
            </Popover>
        </div>
    )
}