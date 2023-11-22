import * as React from 'react'
import {useState} from 'react'
import {Button, Typography} from '@mui/material'
import {googleAccessToken, authorizeWithGoogle} from '../shared/gisProvider'


export default function GoogleLogin() {
    const [, setUpdate] = useState<number>(0)
    const status = googleAccessToken() ? 'Authorized with Google' : 'Google Authorization required'

    const authorize = ()=> authorizeWithGoogle( ()=> setUpdate(Date.now()))
    return (
        <div>
            <Button variant='outlined'
                    aria-label='Authorize With Google'
                    onClick={authorize}>Authorize With Google</Button>
            <Typography mt={2}>{status}</Typography>
        </div>
    )
}