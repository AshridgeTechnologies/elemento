import {useEffect, useState} from 'react'
import * as auth from 'firebase/auth'

declare global {
    var google: any
}

// these are unique but non-secret identifiers - see https://firebase.google.com/docs/projects/learn-more#config-files-objects
export const CLIENT_ID = '366833305772-0fjtfge6ntlgs9pjdkbatte1vpti21ic.apps.googleusercontent.com'
export const SCOPES = [
    'https://www.googleapis.com/auth/firebase',
    'https://www.googleapis.com/auth/cloud-platform'
].join(' ')


const loadScriptElement = (scriptUrl: string) => new Promise((resolve) => {
    const scriptEl = document.createElement('script')
    scriptEl.async = true
    scriptEl.defer = true
    scriptEl.src = scriptUrl
    scriptEl.onload = resolve
    document.body.append(scriptEl)
})

const gsiScriptLoaded = loadScriptElement('https://accounts.google.com/gsi/client')

let access_token: string | null = null

export const googleAccessToken = ()=> access_token

export const authorizeWithGoogle = async () => {
    await gsiScriptLoaded
    return new Promise<void>(resolve => {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (response: any) => {
                console.log('Token client callback', response, client)
                setAccessToken(response.access_token)
                resolve()
            },
        })
        client.requestAccessToken()
    })

}

export const deauthorize = async () => {
    return new Promise<void>(resolve => {
        if (!access_token) resolve()
        google.accounts.oauth2.revoke(access_token, resolve)
        setAccessToken(null)
    })
}

let authListeners = new Set<VoidFunction>()
const addAuthListener = (fn: VoidFunction) => authListeners.add(fn)
const removeAuthListener = (fn: VoidFunction) => { authListeners.delete(fn) }
const setAccessToken = (token: string | null) => {
    access_token = token
    authListeners.forEach( l => l() )
}

export function useAuthorizedState() {
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        const listener = ()=> setIsAuthorized( access_token !== null )
        addAuthListener( listener )
        return () => removeAuthListener( listener ) // Un-register observers when the component unmounts.
    }, [])
    return isAuthorized
}

