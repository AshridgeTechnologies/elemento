import * as React from 'react'
import {useState} from 'react'
import {Box, Button, Link, Popover, Typography} from '@mui/material'
import {Google} from '@mui/icons-material'
import {authorizeWithGoogle, deauthorize, googleAccessToken} from './gisProvider'


export default function GoogleConnection() {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const [, setUpdate] = useState<number>(0)
    const refresh = ()=> setUpdate(Date.now())
    const open = anchorEl !== null
    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleSignIn = () => authorizeWithGoogle(refresh).then(handleClose)
    const handleSignOut = () => deauthorize(refresh).then(handleClose)
    const isSignedIn = googleAccessToken() !== null
    const linkText = isSignedIn ? 'Disconnect from Google' : 'Connect to Google'
    const clickHandler = isSignedIn ? handleSignOut : handleSignIn
    // const user = {email: '<email>', displayName: '<name>'}

    return (
        <div>
            <Button variant='contained' disableElevation={true} startIcon={<Google/>}
                          aria-label="Connect to Google"
                          aria-controls="userPanel"
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          onClick={handleButtonClick}>Google</Button>

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
                    {isSignedIn && <Typography variant='body1'>Connected</Typography>}
                    <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1' marginTop={1}
                          onClick={clickHandler}>{linkText}</Link>
                </Box>
            </Popover>
        </div>
    )
}