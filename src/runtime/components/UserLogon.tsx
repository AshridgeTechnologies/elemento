import * as React from 'react'
import {useEffect, useRef, useState} from 'react'
import {Box, Button, Icon, IconButton, Link, Popover, Typography} from '@mui/material'
import {authIsReady, currentUser, isSignedIn, onAuthChange, signOut, useSignedInState} from './authentication.js'
import {openLoginPopup} from './LoginManager.js'
import {Definitions} from '../../model/schema'
import {ElementSchema} from '../../model/ModelElement'

export const UserLogonSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Userlogon",
    "description": "Description of UserLogon",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "UserLogon",
    "icon": "account_circle",
    "elementType": "statelessUI",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {}
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}

export default function UserLogon() {
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
    const open = Boolean(anchorEl)

    const [isAuthReady, setAuthReady] = useState(authIsReady)
    useSignedInState()
    useEffect(() => onAuthChange( () => setAuthReady(authIsReady) ), [])
    const buttonRef = useRef(null)

    const handleClose = () => setAnchorEl(null)
    const handleButtonClick = (_event: React.MouseEvent) => {setAnchorEl(buttonRef.current)}
    const handleLogout = () => {
        signOut()
        handleClose()
    }

    if (!isAuthReady) {
        return <Typography>Connecting...</Typography>
    }

    const userPanel = isSignedIn() ?
        <Box minWidth={300} margin={2}>
            <Typography variant='body1'>Logged in as {currentUser()!.name}</Typography>
            <Link underline='hover' sx={{cursor: 'pointer'}} variant='body1' marginTop={1}
                  onClick={handleLogout}>Logout</Link>
        </Box>
        : null

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
                          onClick={openLoginPopup}
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
                anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                transformOrigin={{vertical: 'top', horizontal: 'left'}}
                sx={{marginTop: '8px'}}
            >
                {userPanel}
            </Popover>
        </div>
    )
}

UserLogon.Schema = UserLogonSchema
