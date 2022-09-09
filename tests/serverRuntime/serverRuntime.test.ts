import {globalFunctions} from '../../src/serverRuntime'
import {appFunctions} from '../../src/serverRuntime'

const {Sum} = globalFunctions

const {Get} = appFunctions

test('can import global functions', () => {
    expect(Sum(1, 2)).toBe(3)
})

test('can import app functions', () => {
    expect(typeof Get).toBe('function')
})