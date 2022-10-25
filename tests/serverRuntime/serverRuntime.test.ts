import {globalFunctions} from '../../src/serverRuntime'
import {appFunctions} from '../../src/serverRuntime'
import {runtimeFunctions} from '../../src/serverRuntime'

const {Sum} = globalFunctions

const {Get} = appFunctions

const {asCurrentUser} = runtimeFunctions

test('can import global functions', () => {
    expect(Sum(1, 2)).toBe(3)
})

test('can import app functions', () => {
    expect(typeof Get).toBe('function')
})

test('enhances current user if not null', () => {
    const firebaseUser = {name: 'Freda', email: 'freda@fr.com', uid: 'xyz123'}
    expect(asCurrentUser(firebaseUser).Name).toBe('Freda')
    expect(asCurrentUser(firebaseUser).Email).toBe('freda@fr.com')
    expect(asCurrentUser(firebaseUser).uid).toBe('xyz123')
})

test('returns null if current user is null', () => {
    const firebaseUser = null
    expect(asCurrentUser(firebaseUser)).toBe(null)
})
