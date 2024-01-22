import * as auth from 'firebase/auth'
import {FirebaseApp, getAppAndSubscribeToChanges} from './firebaseApp'
import {useEffect, useState} from 'react'

type SignedInCallback = (signedIn: boolean) => void

class FirebaseAuthManager {
    private theAuth: any = null
    private appChangeSubscribed = false
    private authListeners = new Set<SignedInCallback>()
    private unregisterAuthStateObserver: auth.Unsubscribe | null = null

    private handleAppChange = (app: FirebaseApp | null) => {
        this.theAuth?.signOut()
        this.theAuth = app ? auth.getAuth(app) : null
        this.unregisterAuthStateObserver?.()
        this.unregisterAuthStateObserver = this.theAuth ? auth.onAuthStateChanged(this.theAuth, this.authChanged) : null
        this.authChanged()
    }

    getAuth = ():auth.Auth | null => {
        if (!this.appChangeSubscribed) {
            this.appChangeSubscribed = true
            getAppAndSubscribeToChanges(this.handleAppChange)
        }

        return this.theAuth
    }

    onAuthChange = (callback: SignedInCallback) => {
        this.authListeners.add(callback)
        setTimeout(this.getAuth, 0) // ensure listening to app changes, but not before the call to this function returns
        return () => {
            this.authListeners.delete(callback)
        }
    }

    private authChanged = () => {
        const signedIn = !!this.currentUser()
        this.authListeners.forEach( callback => callback(signedIn))
    }

    authIsReady = () => !!this.getAuth()
    signOut = () => this.getAuth()?.signOut()
    currentUser = ():auth.User | null => this.getAuth() ? this.getAuth()!.currentUser : null
    isSignedIn = () => !!this.currentUser()
    getIdToken = () => this.currentUser()?.getIdToken() ?? Promise.resolve(null)
}

let authManager = new FirebaseAuthManager()

export const useSignedInState = () => {
    const [, setIsSignedIn] = useState(false)
    useEffect(() => {
        if (authManager.getAuth()) {
            const unregisterAuthObserver = auth.onAuthStateChanged(authManager.getAuth()!, user => setIsSignedIn(!!user))
            return () => unregisterAuthObserver() // Un-register Firebase observers when the component unmounts.
        }
    }, [authManager.getAuth()])
}

export const authIsReady = () => authManager.authIsReady()
export const onAuthChange = (callback: SignedInCallback) => authManager.onAuthChange(callback)
export const signOut = () => authManager.signOut()
export const getAuth = () => authManager.getAuth()
export const currentUser = () => authManager.currentUser()
export const isSignedIn = () => authManager.isSignedIn()
export const getIdToken = () => authManager.getIdToken()

export const test_resetAuthManager = () => authManager = new FirebaseAuthManager()
export const test_signInWithEmailAndPassword = async (name: string, password: string) => {
    return auth.signInWithEmailAndPassword(authManager.getAuth()!, name, password)
}

