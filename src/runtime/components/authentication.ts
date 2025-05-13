import {useEffect, useState} from 'react'
import {AuthManager} from './AuthManager'

type SignedInCallback = () => void

let authManager: AuthManager | null = null

const getAuthManager = () => {
    if (!authManager) {
        authManager = new AuthManager()
        authManager.init()
    }

    return authManager
}

export const useSignedInState = () => {
    const [, setIsSignedIn] = useState(false)
    useEffect(() => {
		return getAuthManager().onStatusChange( ()=> setIsSignedIn(getAuthManager().loggedIn))
    }, [])
}

export const authIsReady = () => getAuthManager().loaded
export const onAuthChange = (callback: SignedInCallback) => getAuthManager().onStatusChange(callback)
export const signOut = () => getAuthManager().logout()
export const currentUser = () => getAuthManager().currentUser
export const isSignedIn = () => getAuthManager().loggedIn
export const getIdToken = () => getAuthManager().getToken()

export const test_resetAuthManager = () => authManager = null
export const test_signInWithEmailAndPassword = async (name: string, password: string) => {
    // return auth.signInWithEmailAndPassword(authManager.getAuth()!, name, password)
}

