import * as React from 'react'
import {Box, Button, IconButton, Link, Popover, Typography} from '@mui/material'
import {AccountCircle} from '@mui/icons-material'
import {currentUser, signIn, signOut, useSignedInState} from './authentication'

function UserPanel({isSignedIn, handleSignIn, handleSignOut}: { isSignedIn: boolean, handleSignIn: VoidFunction, handleSignOut: VoidFunction }) {

    const linkText = isSignedIn ? 'Sign Out' : 'Sign in with GitHub'
    const clickHandler = isSignedIn ? handleSignOut : handleSignIn
    const user = currentUser()

    return <Box minWidth={400} margin={2}>
        {isSignedIn && <Typography variant='body1'>Signed in as {user!.displayName ?? user!.email}</Typography>}
        <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1' marginTop={1}
              onClick={clickHandler}>{linkText}</Link>
    </Box>
}

export default function UserMenu() {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleSignIn = () => {
        signIn()
        handleClose()
    }
    const handleSignOut = () => {
        signOut()
        handleClose()
    }
    const isSignedIn = useSignedInState()

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
                <AccountCircle />
            </IconButton>
                : <Button variant='contained' disableElevation={true}
                          aria-label="account of current user"
                          aria-controls="userMenu"
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          onClick={handleButtonClick}>Sign In
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
                <UserPanel isSignedIn={isSignedIn} handleSignIn={handleSignIn} handleSignOut={handleSignOut}/>
            </Popover>
        </div>
    )
}