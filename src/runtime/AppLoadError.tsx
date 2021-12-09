import React from 'react'
import {Alert, AlertTitle} from '@mui/material'

export default function AppLoadError({appUrl, error}: {appUrl: string, error: Error}) {
    return (
        <Alert severity="error">
            <AlertTitle>App loading problem</AlertTitle>
            <p>Elemento was unable to load an app from this web location:</p>
            <p>{appUrl}</p>
            <p>Error message: {error.message}</p>
        </Alert>)
}
