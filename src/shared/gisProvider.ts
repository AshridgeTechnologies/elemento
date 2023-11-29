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

export const authorizeWithGoogle = async (callback: () => void) => {
    await gsiScriptLoaded
    const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
            console.log('Token client callback', response, client);
            ({access_token} = response);
            callback()
        },
    })
    client.requestAccessToken()
}

export const deauthorize = async (callback: () => void) => {
    if (!access_token) return

    await google.accounts.oauth2.revoke(access_token, callback)
    access_token = null
}

