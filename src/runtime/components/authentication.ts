import * as auth from 'firebase/auth'
import {FirebaseApp, getAppAndSubscribeToChanges} from './firebaseApp'

type SignedInCallback = (signedIn: boolean) => void

let theAuth: any = null
let appChangeSubscribed = false
let authListeners = new Set<SignedInCallback>()
let unregisterAuthStateObserver: auth.Unsubscribe | null

const handleAppChange = (app: FirebaseApp | null) => {
    theAuth?.signOut()
    theAuth = app ? auth.getAuth(app) : null
    unregisterAuthStateObserver?.()
    unregisterAuthStateObserver = theAuth ? auth.onAuthStateChanged(theAuth, authChanged) : null
    authChanged()
}

const getAuth = ():auth.Auth | null => {
    if (!appChangeSubscribed) {
        appChangeSubscribed = true
        getAppAndSubscribeToChanges(handleAppChange)
    }

    return theAuth
}

const onAuthChange = (callback: SignedInCallback) => {
    authListeners.add(callback)
    getAuth() // ensure listening to app changes
    return () => {
        authListeners.delete(callback)
    }
}

const authChanged = () => {
    const signedIn = !!currentUser()
    authListeners.forEach( callback => callback(signedIn))
}

const authIsReady = () => !!getAuth()
const signOut = () => getAuth()?.signOut()

const currentUser = ():auth.User | null => getAuth() ? getAuth()!.currentUser : null

const getIdToken = () => currentUser()?.getIdToken() ?? Promise.resolve(null)

export const test_signInWithEmailAndPassword = async (name: string, password: string) => {
    return auth.signInWithEmailAndPassword(getAuth()!, name, password)
}

export default {
    authIsReady,
    onAuthChange,
    signOut,
    getAuth,
    currentUser,
    getIdToken
}

