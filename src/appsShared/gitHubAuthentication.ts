import {useEffect, useState} from 'react'
import * as auth from 'firebase/auth'
import {signInWithPopup, GithubAuthProvider} from 'firebase/auth'
import {app} from './elementoFirebaseApp'

let ghAccessToken: string | null = null
let ghUsername: string | null = null

const getAuth = () => auth.getAuth(app)

export function useGitHubSignInState() {
    const [isSignedIn, setIsSignedIn] = useState(false)

    useEffect(() => {
        const unregisterAuthObserver = auth.onAuthStateChanged(getAuth(), user => setIsSignedIn(!!user))
        return () => unregisterAuthObserver() // Un-register Firebase observers when the component unmounts.
    }, [])
    return isSignedIn
}
export const signIn = () => {
    const provider = new GithubAuthProvider()
    provider.addScope('repo')
    return signInWithPopup(getAuth(), provider)
        .then((result) => {
            const credential = GithubAuthProvider.credentialFromResult(result);
            ghAccessToken = credential?.accessToken ?? null
            ghUsername = (result.user as any).reloadUserInfo.screenName  // hack to get GitHub username from private field
        }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GithubAuthProvider.credentialFromError(error);
        const message = `Could not sign in: ${error.message}`
        window.alert(message)
    })
}
export const signOut = () => {
    ghAccessToken = null
    ghUsername = null
    return getAuth().signOut()
}

export const currentUser = () => getAuth().currentUser

export const gitHubAccessToken = () => ghAccessToken
export const gitHubUsername = () => ghUsername

export const isSignedIn = () => gitHubUsername() && gitHubAccessToken()
