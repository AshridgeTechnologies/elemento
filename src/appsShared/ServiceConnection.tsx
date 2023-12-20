import * as React from 'react'
import {useState} from 'react'
import {Box, Button, Link, Popover, Typography} from '@mui/material'
import {SvgIconComponent} from '@mui/icons-material'

export default function ServiceConnection({serviceName, icon: Icon, signIn, signOut, signedInInfo}: {
    serviceName: string,
    icon: SvgIconComponent,
    signIn: () => Promise<any>,
    signOut: () => Promise<void>,
    signedInInfo: () => string | null,
}) {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const [, setUpdate] = useState<number>(0)
    const refresh = ()=> setUpdate(Date.now())
    const open = Boolean(anchorEl)
    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (event: React.MouseEvent) => {setAnchorEl(event.currentTarget)}
    const handleSignIn = () => signIn().then(handleClose).then(refresh)
    const handleSignOut = () => signOut().then(handleClose).then(refresh)
    const isSignedIn = signedInInfo() !== null
    const linkText = isSignedIn ? `Disconnect from ${serviceName}` : `Connect to ${serviceName}`
    const clickHandler = isSignedIn ? handleSignOut : handleSignIn

    return (
        <div>
            <Button variant='contained' disableElevation={true} startIcon={<Icon/>} sx={{width: '9em'}}
                          aria-label={`Connect to ${serviceName}`}
                          aria-controls='userPanel'
                          aria-haspopup='true'
                          aria-expanded={open ? 'true' : undefined}
                          onClick={handleButtonClick}>{serviceName}</Button>

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
                    {isSignedIn && <Typography variant='body1'>{signedInInfo()}</Typography>}
                    <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1' marginTop={1}
                          onClick={clickHandler}>{linkText}</Link>
                </Box>
            </Popover>
        </div>
    )
}