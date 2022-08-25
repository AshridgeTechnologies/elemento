import * as React from 'react'
import {Box, Button, IconButton, Link, Popover, Typography} from '@mui/material'
import {AccountCircle} from '@mui/icons-material'
import authentication from './authentication'

export default function UserLogon() {
    const [authenticationReady, setAuthenticationReady] = React.useState(authentication.isReady())
    if (!authenticationReady) {
        authentication.init().then( setAuthenticationReady )
        return <div>Working...</div>
    }

    return <UserLogonInternal/>
}

function UserLogonInternal() {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const {AuthDialog, currentUser, signOut, useSignedInState} = authentication
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleLogout = () => {
        signOut()
        handleClose()
    }
    const isSignedIn = useSignedInState()

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
                <AccountCircle />
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