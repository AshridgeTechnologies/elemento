import UserLogon from '../../src/model/UserLogon'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('UserLogon has correct properties with default values', ()=> {
    const userLogon1 = new UserLogon('id1', 'UserLogon 1', {})

    expect(userLogon1.id).toBe('id1')
    expect(userLogon1.name).toBe('UserLogon 1')
    expect(userLogon1.type()).toBe('statelessUI')
})

test('UserLogon has correct properties with specified values', ()=> {
    const userLogon1 = new UserLogon('id1', 'UserLogon 1', {})

    expect(userLogon1.id).toBe('id1')
    expect(userLogon1.name).toBe('UserLogon 1')
})

test('tests if an object is this type', ()=> {
    const userLogon = new UserLogon('id1', 'UserLogon 1', {})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(UserLogon.is(userLogon)).toBe(true)
    expect(Page.is(userLogon)).toBe(false)
    expect(UserLogon.is(page)).toBe(false)
})

test('converts to JSON with optional properties', ()=> {
    const userLogon = new UserLogon('id1', 'UserLogon 1', {})
    expect(asJSON(userLogon)).toStrictEqual({
        kind: 'UserLogon',
        id: 'id1',
        name: 'UserLogon 1',
        properties: userLogon.properties
    })
})

test('converts from plain object', ()=> {
    const userLogon = new UserLogon('id1', 'UserLogon 1', {})
    const plainObj = asJSON(userLogon)
    const newUserLogon = loadJSON(plainObj)
    expect(newUserLogon).toStrictEqual<UserLogon>(userLogon)

    const userLogon2 = new UserLogon('id1', 'UserLogon 2', {})
    const plainObj2 = asJSON(userLogon2)
    const newUserLogon2 = loadJSON(plainObj2)
    expect(newUserLogon2).toStrictEqual<UserLogon>(userLogon2)
})
