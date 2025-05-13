import {beforeEach, expect, test, vi} from "vitest"
import * as programErrors from '../../../src/runtime/components/programErrors'

beforeEach( programErrors.test_resetManager)

test('can subscribe and get notifications and unsubscribe', () => {
    const callback = vi.fn()
    const unsubscribe = programErrors.subscribeToProgramErrors(callback)
    programErrors.addError('error', 'page1.NameList', 'items', 'Expected List')
    expect(callback).toHaveBeenCalledWith({level: 'error', path: 'page1.NameList', property: 'items', message: 'Expected List'})

    programErrors.addError('warning', 'page2.DateInput', 'value', 'Expected Date not number')
    expect(callback).toHaveBeenCalledWith({level: 'warning', path: 'page2.DateInput', property: 'value', message: 'Expected Date not number'})

    unsubscribe()
    programErrors.addError('error', 'page2.TextInput', 'width', '"wide" is not a valid value')
    expect(callback).toHaveBeenLastCalledWith({level: 'warning', path: 'page2.DateInput', property: 'value', message: 'Expected Date not number'})
})
