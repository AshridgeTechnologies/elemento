import {createElement, useEffect, useState} from 'react'
import * as auth from 'firebase/auth'
import {StyledFirebaseAuth} from 'react-firebaseui'
import {app} from './firebaseApp'

const getAuth = () => auth.getAuth(app)

export function useSignedInState() {
    const [isSignedIn, setIsSignedIn] = useState(false)

    useEffect(() => {
        const unregisterAuthObserver = auth.onAuthStateChanged(getAuth(), user => setIsSignedIn(!!user))
        return () => unregisterAuthObserver() // Un-register Firebase observers when the component unmounts.
    }, [])
    return isSignedIn
}

export function AuthDialog() {
    const uiConfig = {
        signInFlow: 'popup',
        signInOptions: [
            auth.GoogleAuthProvider.PROVIDER_ID,
            auth.EmailAuthProvider.PROVIDER_ID,
        ],
        tosUrl: '/terms',
        privacyPolicyUrl: '/privacy',
    }

    const firebaseAuth = getAuth()
    return createElement(StyledFirebaseAuth, {uiConfig, firebaseAuth})
}

export const signOut = () => getAuth().signOut()

export const currentUser = () => getAuth().currentUser