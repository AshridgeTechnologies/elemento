import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import AsyncValue from '../../../src/editor/actions/AsyncValue'
import {wait} from '../../testutil/testHelpers'

test('gets value once and updates value and notifies', async () => {
    const val = new AsyncValue<string>()
    const getValue = vi.fn().mockReturnValue(Promise.resolve('Hi!'))
    const notify = vi.fn()

    expect(val.value).toBeNull()
    val.init(getValue, notify)
    expect(val.value).toBeNull()
    expect(notify).not.toHaveBeenCalled()

    await wait(10)
    expect(val.value).toBe('Hi!')
    expect(notify).toHaveBeenCalledWith('Hi!')
})

test('if init called again, does not get value and uses latest notify', async () => {
    const val = new AsyncValue<string>()
    const getValue = vi.fn().mockReturnValue(Promise.resolve('Hi!'))
    const notify = vi.fn()
    const notify2 = vi.fn()

    val.init(getValue, notify)
    val.init(getValue, notify2)

    await wait(10)
    expect(val.value).toBe('Hi!')
    expect(notify).not.toHaveBeenCalled()
    expect(notify2).toHaveBeenCalledWith('Hi!')
    expect(getValue).toHaveBeenCalledTimes(1)
})
