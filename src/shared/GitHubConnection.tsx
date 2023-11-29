import * as React from 'react'
import {Box, Button, Link, Popover, Typography} from '@mui/material'
import {GitHub} from '@mui/icons-material'
import {currentUser, signIn, signOut, useSignedInState} from './authentication'

export default function GitHubConnection() {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleSignIn = () => signIn().then(handleClose)
    const handleSignOut = () => signOut().then(handleClose)
    const isSignedIn = useSignedInState()
    const linkText = isSignedIn ? 'Disconnect from GitHub' : 'Connect to GitHub'
    const clickHandler = isSignedIn ? handleSignOut : handleSignIn
    const user = currentUser()

    return (
        <div>
            <Button variant='contained' disableElevation={true} startIcon={<GitHub/>}
                          aria-label="Connect to GitHub"
                          aria-controls="userPanel"
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          onClick={handleButtonClick}>GitHub</Button>

            <Popover
                id='userPanel'
                data-testid='userPanel'
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                transformOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Box minWidth={400} margin={2}>
                    {isSignedIn && <Typography variant='body1'>Signed in as {user!.email} ({user!.displayName})</Typography>}
                    <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1' marginTop={1}
                          onClick={clickHandler}>{linkText}</Link>
                </Box>
            </Popover>
        </div>
    )
}