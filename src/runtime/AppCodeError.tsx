import React from 'react'
import {Alert, AlertTitle} from '@mui/material'

export default function AppCodeError({error}: {error: Error}) {
    return (
        <Alert id='errorMessage' severity="error">
            <AlertTitle>Invalid app code</AlertTitle>
            <p>Elemento is unable to run this app as there is an error in the code:</p>
            <p>Error message: {error.message}</p>
        </Alert>)
}
