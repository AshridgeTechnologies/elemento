import * as jose from 'jose'

declare global {
    var google: any
}

export type UserInfo = { name: string, email: string }

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

export const initGoogleAccounts = async (buttonElement: HTMLElement, callback: (user: UserInfo | null) => void) => {
    const handleCredentialResponse = (response: any) => {
        const responsePayload = jose.decodeJwt<UserInfo>(response.credential)

        console.log("ID: " + responsePayload.sub);
        console.log('Full Name: ' + responsePayload.name);
        console.log('Given Name: ' + responsePayload.given_name);
        console.log('Family Name: ' + responsePayload.family_name);
        console.log("Image URL: " + responsePayload.picture);
        console.log("Email: " + responsePayload.email);
        callback({email: responsePayload.email, name: responsePayload.name})
    }

    await gsiScriptLoaded
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        scopes: SCOPES ,
        callback: handleCredentialResponse
    })
    google.accounts.id.renderButton(buttonElement, {})
}
