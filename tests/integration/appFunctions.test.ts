import appFunctions from '../../src/serverRuntime/appFunctions'
import {appFunctionsNames} from '../../src/serverRuntime/names'

const {CreateUser, GetUser, UpdateUser, GetRandomId} = appFunctions

test('creates and updates user', async () => {
    const userId = GetRandomId()
    const email = 'user'+ userId + '@example.com'
    //console.log('userId', userId)

    await CreateUser(userId, {email, name: 'Jo Doe'})

    const user = await GetUser(userId)
    expect(user.id).toBe(userId)
    expect(user.email).toBe(email)
    expect(user.name).toBe('Jo Doe')

    const password = 'pass' + GetRandomId()
    const newEmail = 'dodo' + userId + '@example.com'
    await UpdateUser(userId, {email: newEmail, password })

    {
        const user = await GetUser(userId)
        expect(user.id).toBe(userId)
        expect(user.email).toBe(newEmail)
        expect(user.name).toBe('Jo Doe')
    }
})

test('get correct app function names', () => {
    expect(appFunctionsNames()).toStrictEqual([ 'Update', 'Add', 'AddAll', 'Remove', 'Get', 'GetIfExists', 'Query',
        'GetRandomId', 'CreateUser', 'UpdateUser', 'GetUser', 'CurrentUser'])

})
