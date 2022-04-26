import {useEffect, useState} from 'react'
import {auth, getAuth} from './configuredFirebase'

export function useSignedInState() {
    const [isSignedIn, setIsSignedIn] = useState(false)

    useEffect(() => {
        const unregisterAuthObserver = auth.onAuthStateChanged(getAuth(), user => setIsSignedIn(!!user))
        return () => unregisterAuthObserver() // Un-register Firebase observers when the component unmounts.
    }, [])
    return isSignedIn
}