import appFunctions from '../../src/serverRuntime/appFunctions'
import fs from 'fs'
import admin from 'firebase-admin'
import {appFunctionsNames} from '../../src/serverRuntime/names'

const {CreateUser, GetUser, UpdateUser, GetRandomId} = appFunctions

const serviceAccount = JSON.parse(fs.readFileSync('private/service-account-key.json', 'utf8'))
admin.initializeApp({credential: admin.credential.cert(serviceAccount)})

test('creates and updates user', async () => {
    const userId = GetRandomId()
    const email = 'user'+ userId + '@example.com'
    //console.log('userId', userId)

    await CreateUser(userId, {email, displayName: 'Jo Doe'})

    const user = await GetUser(userId)
    expect(user.uid).toBe(userId)
    expect(user.email).toBe(email)
    expect(user.displayName).toBe('Jo Doe')

    const password = 'pass' + GetRandomId()
    const newEmail = 'dodo' + userId + '@example.com'
    await UpdateUser(userId, {email: newEmail, password })

    {
        const user = await GetUser(userId)
        expect(user.uid).toBe(userId)
        expect(user.email).toBe(newEmail)
        expect(user.displayName).toBe('Jo Doe')
    }
})

test('get correct app function names', () => {
    expect(appFunctionsNames()).toStrictEqual([ 'Update', 'Add', 'AddAll', 'Remove', 'Get', 'Query',
        'GetRandomId', 'CreateUser', 'UpdateUser', 'GetUser', 'CurrentUser'])

})
