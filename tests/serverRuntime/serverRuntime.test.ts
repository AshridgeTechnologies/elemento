import {expect, test} from "vitest"
import {globalFunctions} from '../../src/serverRuntime/globalFunctions'
import appFunctions from '../../src/serverRuntime/appFunctions'
import * as runtimeFunctions from '../../src/serverRuntime/runtimeFunctions'

import {appFunctionsNames} from '../../src/serverRuntime/names'

const {Sum} = globalFunctions

const {Get} = appFunctions

const {asCurrentUser} = runtimeFunctions

test('can import global functions', () => {
    expect(Sum(1, 2)).toBe(3)
})

test('can import app functions', () => {
    expect(typeof Get).toBe('function')
})

test('app function names includes CurrentUser', () => {
    const names = appFunctionsNames()
    expect(names).toContain('CurrentUser')
})

test('returns null if current user is null', () => {
    const user = null
    expect(asCurrentUser(user)).toBe(null)
})
