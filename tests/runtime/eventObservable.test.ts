import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import eventObservable from '../../src/util/eventObservable'
import {wait} from '../testutil/testHelpers'

test('can receive events with multiple subscribers and remove event listener when no subscribers', async function () {
    let eventListener: (event: Event) => void
    function listen(type: string, listener: any) {
        eventListener = listener
    }
    const testWindow = {
        addEventListener: vi.fn().mockImplementation(listen),
        removeEventListener: vi.fn(),
    } as unknown as Window
    const obs = eventObservable(testWindow, 'testEvent', (evt: Event) => (evt as CustomEvent).detail)
    let s1Val, s2Val
    const s1 = obs.subscribe((n) => s1Val = n)
    const s2 = obs.subscribe({
        next(n) {
            s2Val = n
        }
    })

    await wait()
    eventListener!(new CustomEvent('testEvent', {detail: 42}))
    await wait()

    expect(s1Val).toBe(42)
    expect(s2Val).toBe(42)

    s1.unsubscribe()
    eventListener!(new CustomEvent('testEvent', {detail: 43}))
    expect(s1Val).toBe(42)
    expect(s2Val).toBe(43)

    s2.unsubscribe()
    eventListener!(new CustomEvent('testEvent', {detail: 44}))
    expect(s1Val).toBe(42)
    expect(s2Val).toBe(43)

    expect(testWindow.addEventListener).toHaveBeenCalledTimes(1)
    expect(testWindow.addEventListener).toHaveBeenCalledWith('testEvent', eventListener!, false)
    expect(testWindow.removeEventListener).toHaveBeenCalledTimes(1)
    expect(testWindow.removeEventListener).toHaveBeenCalledWith('testEvent', eventListener!)
})
