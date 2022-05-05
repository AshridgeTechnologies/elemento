import React from 'react'

export default function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
    return (
        <div role="alert">
            <p>Unable to display the app due to an error in a formula:</p>
            <pre style={{color: 'red'}}>{error.message}</pre>
            <p>Please fix the error then click here: <button onClick={resetErrorBoundary}>Continue</button></p>
        </div>
    )
}