import {useEffect, useState} from 'react'
import {AuthManager} from './AuthManager.js'

type SignedInCallback = () => void

let authManager = new AuthManager()
authManager.init()

export const useSignedInState = () => {
    const [, setIsSignedIn] = useState(false)
    useEffect(() => {
		return authManager.onStatusChange( ()=> setIsSignedIn(authManager.loggedIn))
    }, [])
}

export const authIsReady = () => authManager.loaded
export const onAuthChange = (callback: SignedInCallback) => authManager.onStatusChange(callback)
export const signOut = () => authManager.logout()
export const currentUser = () => authManager.currentUser
export const isSignedIn = () => authManager.loggedIn
export const getIdToken = () => authManager.getToken()

export const test_resetAuthManager = () => authManager = new AuthManager()
export const test_signInWithEmailAndPassword = async (name: string, password: string) => {
    // return auth.signInWithEmailAndPassword(authManager.getAuth()!, name, password)
}

