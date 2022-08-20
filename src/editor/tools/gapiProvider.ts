
declare global {
    var google: any
}

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '366833305772-0fjtfge6ntlgs9pjdkbatte1vpti21ic.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBt5DsD6YG2naMDe2tsaZcOjL8G81dR8-c';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://firebasehosting.googleapis.com/$discovery/rest?version=v1beta1'

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = [
    'https://www.googleapis.com/auth/firebase',
].join(' ');

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client', async function () {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        checkReady();
    });
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    checkReady();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function checkReady() {
    if (gapiInited && gisInited) {
    }
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

function loadGisAndGapi() {
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
function authorize() {
    return new Promise<void>((resolve, reject) => {
        tokenClient.callback = async (resp: any) => {
            if (resp.error !== undefined) {
                reject(resp);
            }
            resolve()
        };

        if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({prompt: ''});
        }
    })
}

/**
 *  Sign out the user.
 */
export function signout() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken(null);
    }
}


export default async function getGapi(): Promise<any> {  // not sure how to get firebasehosting into gapi
    await loadGisAndGapi()
    await authorize()
    return gapi
}