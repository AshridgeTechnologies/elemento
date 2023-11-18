declare global {
    var google: any
}

// these are unique but non-secret identifiers - see https://firebase.google.com/docs/projects/learn-more#config-files-objects
export const CLIENT_ID = '366833305772-0fjtfge6ntlgs9pjdkbatte1vpti21ic.apps.googleusercontent.com'
const API_KEY = 'AIzaSyBt5DsD6YG2naMDe2tsaZcOjL8G81dR8-c'

const DISCOVERY_DOCS = ['https://firebasehosting.googleapis.com/$discovery/rest?version=v1beta1',
                        'https://firebase.googleapis.com/$discovery/rest?version=v1beta1',
                        'https://cloudfunctions.googleapis.com/$discovery/rest?version=v2'
]

export const SCOPES = [
    'https://www.googleapis.com/auth/firebase',
    'https://www.googleapis.com/auth/cloud-platform'
].join(' ')

let tokenClient: any
let gapiInited = false
let gisInited = false

// let auth2: any
// gapi.load('auth2', function () {
//     // Retrieve the singleton for the GoogleAuth library and set up the client.
//     // @ts-ignore
//     auth2 = gapi.auth2.init({
//         client_id: CLIENT_ID,
//         cookiepolicy: 'single_host_origin',
//         scope: SCOPES
//     })
//
// })


/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client', async function () {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
        })
        gapiInited = true
    })
}

/**
 * Callback after Google Identity Services loaded.
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    })
    gisInited = true
}

function ensureScriptElement(scriptUrl: string, onloadFn: () => void) {
    let scriptEl: HTMLScriptElement | null= document.querySelector(`script[src='${scriptUrl}']`)
    if (!scriptEl) {
        scriptEl = document.createElement('script')
        scriptEl.async = true
        scriptEl.defer = true
        scriptEl.src = scriptUrl
        scriptEl.onload = onloadFn
        document.body.append(scriptEl)
    }
}

export function loadGisAndGapi() {
    ensureScriptElement('https://apis.google.com/js/api.js', gapiLoaded)
    ensureScriptElement('https://accounts.google.com/gsi/client', gisLoaded)
    return new Promise<void>(resolve => {
        const checkIfReady = () => {
            if (gisInited && gapiInited) {
                resolve()
            } else {
                setTimeout(checkIfReady, 100)
            }
        }
        checkIfReady()
    })
}

/**
 *  Sign in the user.
 */
export function old_authorize() {
    return new Promise<void>((resolve, reject) => {
        tokenClient.callback = async (resp: any) => {
            if (resp.error !== undefined) {
                reject(resp)
            }
            resolve()
        }

        if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClient.requestAccessToken({prompt: 'consent'})
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({prompt: ''})
        }
    })
}

export function authorize() {
    return new Promise<void>((resolve, reject) => {
    })

}

/**
 *  Sign out the user.
 */
export function signout() {
    const token = gapi.client.getToken()
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token)
        gapi.client.setToken(null)
    }
}

export default async function getGapi(): Promise<any> {  //TODO: get firebasehosting types into gapi
    await loadGisAndGapi()
    await authorize()
    return gapi
}

export function initGoogleAccounts() {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: any)=> console.log('Google accounts initialized', response)
    });
    const parent = document.getElementById('google_btn');
    google.accounts.id.renderButton(parent, {theme: "filled_blue"});
    google.accounts.id.prompt();
}