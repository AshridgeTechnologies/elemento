import {createElement, useEffect, useState} from 'react'
import * as auth from 'firebase/auth'
import {StyledFirebaseAuth} from 'react-firebaseui'
import {getApp} from './firebaseApp'

let app: any = null
let appError: any = null

function isReady() { return app !== null }

async function init() {
    if (appError) {
        return false
    }
    try {
        app = await getApp()
        return true
    } catch (e) {
        appError = e
        console.error('Could not initialise Firebase', e)
        return false
    }
}

const getAuth = () => auth.getAuth(app)

function useSignedInState() {
    const [isSignedIn, setIsSignedIn] = useState(false)

    useEffect(() => {
        const unregisterAuthObserver = auth.onAuthStateChanged(getAuth(), user => setIsSignedIn(!!user))
        return () => unregisterAuthObserver() // Un-register Firebase observers when the component unmounts.
    }, [])
    return isSignedIn
}

function AuthDialog() {
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

const signOut = () => getAuth().signOut()

const currentUser = () => getAuth().currentUser

export default {
    isReady,
    init,
    useSignedInState,
    AuthDialog,
    signOut,
    currentUser
}