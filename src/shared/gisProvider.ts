import {useEffect, useState} from 'react'

declare global {
    var google: any
}

// these are unique but non-secret identifiers - see https://firebase.google.com/docs/projects/learn-more#config-files-objects
export const CLIENT_ID = '366833305772-0fjtfge6ntlgs9pjdkbatte1vpti21ic.apps.googleusercontent.com'
export const SCOPES = [
    'https://www.googleapis.com/auth/firebase'
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
let access_token_expires_time: Date = new Date(0)

export const googleAccessToken = ()=> googleAccessTokenExpired() ? null : access_token
export const googleAccessTokenExpired = ()=> access_token_expires_time < new Date()

export const authorizeWithGoogle = async () => {
    await gsiScriptLoaded
    return new Promise<string>((resolve, reject) => {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (response: any) => {
                console.log('Token client callback', response, client)
                setAccessToken(response.access_token, response.expires_in)
                resolve(response.access_token)
            },
            error_callback: (err: Error) => {
                console.log('Token client error', err)
                setAccessToken(null, 0)
                reject(err)
            },
        })
        client.requestAccessToken()
    })
}

export const getOrRequestGoogleAccessToken = async (): Promise<string> => {
    const existingToken = googleAccessToken()
    if (existingToken !== null) {
        return existingToken
    }

    return await authorizeWithGoogle()
}

export const deauthorize = async () => {
    return new Promise<void>(resolve => {
        if (!access_token) resolve()
        google.accounts.oauth2.revoke(access_token, resolve)
        setAccessToken(null, 0)
    })
}

let authListeners = new Set<VoidFunction>()
const addAuthListener = (fn: VoidFunction) => authListeners.add(fn)
const removeAuthListener = (fn: VoidFunction) => { authListeners.delete(fn) }
const setAccessToken = (token: string | null, expiresInSeconds: number) => {
    access_token = token
    access_token_expires_time = new Date(Date.now() + expiresInSeconds * 1000)
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

