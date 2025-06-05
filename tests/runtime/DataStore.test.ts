import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import {pending, isPending} from '../../src/shared/DataStore'
import {valueOf} from '../../src/runtime/runtimeFunctions'

test('pending returns a decorated Promise', () => {
    const p = Promise.resolve(42)
    expect(pending(p)).toBe(p)
    expect(pending(p)).resolves.toBe(42)
    expect(pending(p).valueOf()).toBeNull()
    expect(valueOf(pending(p))).toBeNull()
})

test('pending isPending', () => {
    const p = Promise.resolve(42)
    expect(isPending(pending(p))).toBe(true)
    expect(isPending(Promise.resolve(42))).toBe(false)
    expect(isPending('xyz')).toBe(false)
    expect(isPending(null)).toBe(false)
    expect(isPending(undefined)).toBe(false)
})
