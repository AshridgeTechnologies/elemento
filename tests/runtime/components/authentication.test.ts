import * as auth from '../../../src/runtime/components/authentication'

import {getAppAndSubscribeToChanges} from '../../../src/runtime/components/firebaseApp'
import * as firebaseAuth from 'firebase/auth'
import {mockImplementation, wait} from '../../testutil/testHelpers'

jest.mock('../../../src/runtime/components/firebaseApp')
jest.mock('firebase/auth')

function mockAuth(app: object) {
    return {
        currentUser: null,
        signOut: jest.fn(),
        app
    }
}

let appCallback: any
let authForStateChanges: any
let authChangedCallback: any
let theMockAuth: any
const authStateObserverUnsubscribe = jest.fn()

mockImplementation(firebaseAuth.getAuth, (app: any) => {
    theMockAuth = mockAuth(app)
    return theMockAuth
})
mockImplementation(firebaseAuth.onAuthStateChanged, (auth: any, authChanged: any) => {
    authForStateChanges = auth
    authChangedCallback = authChanged
    return authStateObserverUnsubscribe
})
mockImplementation(getAppAndSubscribeToChanges, (callback: any) => {
    appCallback = callback
    appCallback(null)
})

beforeEach(() => {
    appCallback = null
    authForStateChanges = null
    authChangedCallback = null
    theMockAuth = null
})

beforeEach(()=> auth.test_resetAuthManager())

test('current user is null and signed out before logon', () => {
    expect(auth.currentUser()).toBeNull()
    expect(auth.isSignedIn()).toBe(false)
})

test('onAuthChange calls back when app is ready but not before returning the callback', async () => {
    const authChangeCallback = jest.fn()
    const unsubscribe = auth.onAuthChange(authChangeCallback)
    expect(authChangeCallback).not.toHaveBeenCalled()

    await wait()

    expect(authChangeCallback).toHaveBeenCalledWith(false)
    expect(auth.authIsReady()).toBe(false)

    appCallback({app: 'App 1'})
    expect(authChangeCallback).toHaveBeenCalledTimes(2)
    expect(authChangeCallback).toHaveBeenLastCalledWith(false)
    expect(auth.authIsReady()).toBe(true)

    authChangedCallback()
    expect(authChangeCallback).toHaveBeenCalledTimes(3)
    expect(authChangeCallback).toHaveBeenLastCalledWith(false)
    expect(auth.currentUser()).toBeNull()
    expect(auth.isSignedIn()).toBe(false)

    theMockAuth.currentUser = {user: 'JoJo'}
    authChangedCallback()
    expect(authChangeCallback).toHaveBeenCalledTimes(4)
    expect(authChangeCallback).toHaveBeenLastCalledWith(true)
    expect(auth.currentUser()).toStrictEqual({user: 'JoJo'})
    expect(auth.isSignedIn()).toBe(true)

    theMockAuth.currentUser = null
    authChangedCallback()
    expect(authChangeCallback).toHaveBeenCalledTimes(5)
    expect(authChangeCallback).toHaveBeenLastCalledWith(false)

    appCallback({app: 'App 2'})
    expect(authChangeCallback).toHaveBeenCalledTimes(6)
    expect(authChangeCallback).toHaveBeenLastCalledWith(false)
    expect(authStateObserverUnsubscribe).toHaveBeenCalledTimes(1)

    unsubscribe()
    theMockAuth.currentUser = {user: 'KoKo'}
    authChangedCallback()

    appCallback(null)
    expect(authStateObserverUnsubscribe).toHaveBeenCalledTimes(2)
    expect(authChangeCallback).toHaveBeenCalledTimes(6)
    expect(auth.authIsReady()).toBe(false)
})

test('signs out if have current auth and does nothing otherwise', () => {
    auth.signOut()

    auth.onAuthChange(jest.fn())
    auth.signOut()

    appCallback(null)
    auth.signOut()

    appCallback({app: 'App 1'})
    auth.signOut()

    expect(theMockAuth.signOut).toHaveBeenCalledTimes(1)
})

test('gets id token if signed in or null', async () => {
    await expect(auth.getIdToken()).resolves.toBeNull()

    appCallback({app: 'App 1'})
    theMockAuth.currentUser = {getIdToken() { return Promise.resolve('the_token')}}

    await expect(auth.getIdToken()).resolves.toBe('the_token')
})
