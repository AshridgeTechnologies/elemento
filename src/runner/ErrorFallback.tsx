import React from 'react'
import {lastTrace} from '../runtime/debug'
import {startCase} from 'lodash'

export default function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
    const trace = lastTrace()
    return (
        <div role="alert">
            <p>Unable to display the app due to an error:</p>
            <pre style={{color: 'blue'}}>Element:  {trace?.component ?? 'unknown'}</pre>
            <pre style={{color: 'blue'}}>Property: {startCase(trace?.property ?? 'unknown')}</pre>
            <pre style={{color: 'red'}}>Error: {error.message}</pre>
        </div>
    )
}
