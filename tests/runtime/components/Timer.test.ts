/**
 * @vitest-environment jsdom
 */
import {expect, test, vi} from 'vitest'
import {BaseComponentState, Timer} from '../../../src/runtime/components/index'
import {createStateFn, valueObj, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'

import {testContainer} from '../../testutil/rtlHelpers'

const [timer, appStoreHook] = wrappedTestElement(Timer)
const stateAt = (path: string) => appStoreHook.stateAt(path)

const createState = createStateFn(Timer.State)
const {store} = createState
const getLatest = <T extends BaseComponentState<any, any>>(state: T): T => store.get(state._path!)

// Start of possible technique for mocking time, but also uses Date AND requestAnimationFrame only runs the callback once
// let rafCallback: FrameRequestCallback
// globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
//     rafCallback = callback
//     return 1
// }
//
// const runAnimationFrames = (times: number) => {
//     for (let i = 0; i < times; i++) rafCallback(0)
// }

test('Timer element produces output with properties supplied', () => {
    const {container} = render(timer('app.page1.timer', {
        period: 10,
        styles: {width: 23},
        label: 'Time Left'
    }))
    expect(container.innerHTML).toMatchSnapshot()
})

test('Timer element produces output with default values where properties omitted',
    () => {
        const {container} = render(timer('app.page1.timer', {}))
        expect(container.innerHTML).toMatchSnapshot()
    }
)

test.skip('Timer shows elapsed time value', async () => {
    const {el} = testContainer(timer('app.page1.timer1', {show: true, period: 0.2, interval: 0.1}))
    stateAt('app.page1.timer1').Start()
    await wait(120)
    expect(el`app.page1.timer1`.textContent).toBe('0.10')
})

test('State class has correct input properties', () => {
    const intervalFn = ()=> 10, endFn = ()=> 20
    const state = new Timer.State({period: 10, interval: 2, intervalAction: intervalFn, endAction: endFn })
    expect(state.period).toBe(10)
    expect(state.interval).toBe(2)
    expect(state.intervalAction).toBe(intervalFn)
    expect(state.endAction).toBe(endFn)
})

test('State class has correct input properties from value objects', () => {
    const state = new Timer.State({period: valueObj(10), interval: valueObj(2) })
    expect(state.period).toBe(10)
    expect(state.interval).toBe(2)
})

test('State class has null input properties if not supplied', () => {
    const state = new Timer.State({})
    expect(state.period).toBe(null)
    expect(state.interval).toBe(null)
    expect(state.intervalAction).toBe(null)
    expect(state.endAction).toBe(null)
})

test('Has correct output properties before started', () => {
    const state = new Timer.State({period: 10, interval: 2 })
    expect(state.startTime).toBe(null)
    expect(state.elapsedTime).toBe(0)
    expect(state.intervalTime).toBe(0)
    expect(state.remainingTime).toBe(10)
    expect(state.intervalCount).toBe(0)
    expect(state.isStarted).toBe(false)
    expect(state.isRunning).toBe(false)
    expect(state.isFinished).toBe(false)
})

test('Has correct output properties immediately after started', () => {
    const state = createState({period: 2, interval: 0.05 })
    const startTime = new Date()
    state.Start()
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime(), -1)
    expect(state.elapsedTime).toBeCloseTo(0, 2)
    expect(state.intervalTime).toBe(0)
    expect(state.remainingTime).toBeCloseTo(2, 2)
    expect(state.intervalCount).toBe(0)
    expect(state.isStarted).toBe(true)
    expect(state.isRunning).toBe(true)
    expect(state.isFinished).toBe(false)
})

test('Has correct output properties immediately after started without fixed period', () => {
    const state = createState({ interval: 0.05, intervalAction: vi.fn(), endAction: vi.fn() })
    const startTime = new Date()
    state.Start()
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(state.intervalTime).toBe(0)
    expect(state.elapsedTime).toBeCloseTo(0, 2)
    expect(state.remainingTime).toBe(null)
    expect(state.intervalCount).toBe(0)
    expect(state.isStarted).toBe(true)
    expect(state.isRunning).toBe(true)
    expect(state.isFinished).toBe(false)
})

test('Calls interval action while running', async () => {
    const intervalAction = vi.fn()
    const state = createState({period: 2, interval: 0.03, intervalAction })
    const startTime = new Date()
    state.Start()
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    await wait(80)  // 2 intervals
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(state.intervalCount).toBe(2)
    expect(state.intervalTime).toBe(0.06)
    expect(state.elapsedTime).toBeCloseTo(0.08, 2)
    expect(state.value).toBeCloseTo(0.08, 2)
    expect(state.remainingTime).toBeCloseTo(1.92, 2)
    expect(state.isRunning).toBe(true)
    expect(state.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(intervalAction).toHaveBeenLastCalledWith(state)
})

test('Has correct output properties if start called while running', async () => {
    const intervalAction = vi.fn()
    const state = createState({period: 2, interval: 0.03, intervalAction })
    const startTime = new Date()
    state.Start()
    await wait(80)  // 2 intervals

    state.Start()

    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(state.intervalCount).toBe(2)
    expect(state.intervalTime).toBe(0.06)
    expect(state.elapsedTime).toBeCloseTo(0.08, 1)
    expect(state.remainingTime).toBeCloseTo(1.92, 1)
    expect(state.isStarted).toBe(true)
    expect(state.isRunning).toBe(true)
    expect(state.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(intervalAction).toHaveBeenLastCalledWith(state)
})

test('Has correct output properties while running without fixed period ', async () => {
    const state = createState({interval: 0.03, intervalAction: vi.fn(), endAction: vi.fn() })
    const startTime = new Date()
    state.Start()
    await wait(80)  // 2 intervals
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(state.intervalCount).toBe(2)
    expect(state.intervalTime).toBe(0.06)
    expect(state.elapsedTime).toBeCloseTo(0.082, 2)
    expect(state.remainingTime).toBe(null)
    expect(state.isStarted).toBe(true)
    expect(state.isRunning).toBe(true)
    expect(state.isFinished).toBe(false)
})

test('Has correct output properties while running without fixed interval or period', async () => {
    const intervalAction = vi.fn()
    const state = createState({intervalAction, endAction: vi.fn() })
    const startTime = new Date()
    state.Start()
    await wait(36)
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(state.intervalCount).toBeGreaterThanOrEqual(2)
    expect(state.intervalCount).toBeLessThanOrEqual(3)
    expect(state.intervalTime).toBe(null)
    expect(state.elapsedTime).toBeCloseTo(0.038, 2)
    expect(state.remainingTime).toBe(null)
    expect(state.isRunning).toBe(true)
    expect(state.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(state.intervalCount)
})

test('Has correct output properties while running with period but no fixed interval', async () => {
    const intervalAction = vi.fn()
    const state = createState({period: 3, intervalAction, endAction: vi.fn() })
    const startTime = new Date()
    state.Start()
    await wait(40)
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime(), 0)
    const intervalCount = state.intervalCount
    expect(intervalCount).toBeGreaterThanOrEqual(2) // if requestAnimationFrame is 60 fps
    expect(intervalCount).toBeLessThanOrEqual(3)
    expect(state.intervalTime).toBe(null)
    expect(state.remainingTime).toBeCloseTo(2.966, 1)
    expect(state.isRunning).toBe(true)
    expect(state.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(intervalCount)
})

test('Has correct output properties and calls to actions when finished', async () => {
    const intervalAction = vi.fn(), endAction = vi.fn()
    const state = createState({period: 0.09, interval: 0.03, intervalAction, endAction })
    const startTime = new Date()
    state.Start()
    await wait(120)  // should be finished
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime(), 0)
    expect(state.intervalCount).toBe(2) // last interval comes just after finished
    expect(state.intervalTime).toBe(0.06)
    expect(state.elapsedTime).toBeCloseTo(0.09, 2)
    expect(state.remainingTime).toBe(0)
    expect(state.isStarted).toBe(false)
    expect(state.isRunning).toBe(false)
    expect(state.isFinished).toBe(true)
    const stateStartTime = state.startTime?.getTime() as number
    expect(state.finishedTime?.getTime()).toBeGreaterThanOrEqual(stateStartTime + 90)
    expect(state.finishedTime?.getTime()).toBeLessThanOrEqual(stateStartTime + 120)
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(endAction).toHaveBeenCalledTimes(1)
    expect(endAction).toHaveBeenLastCalledWith(state)
})

test('Has correct output properties and calls to actions when finished with incomplete interval', async () => {
    const intervalAction = vi.fn(), endAction = vi.fn()
    const state = createState({period: 0.075, interval: 0.03, intervalAction, endAction })
    const startTime = new Date()
    state.Start()
    await wait(95)  // 2 intervals and finished
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    const intervalCount = state.intervalCount // test is flaky unless allow for missed raf calls
    expect(intervalCount).toBeGreaterThanOrEqual(1)
    expect(intervalCount).toBeLessThanOrEqual(2)
    expect(state.intervalTime).toBe(0.03 * intervalCount)
    expect(state.isStarted).toBe(false)
    expect(state.isFinished).toBe(true)
    expect(state.isRunning).toBe(false)
    expect(state.elapsedTime).toBe(0.075)
    expect(state.remainingTime).toBe(0)
    expect(intervalAction).toHaveBeenCalledTimes(intervalCount)
    // expect(intervalAction).toHaveBeenLastCalledWith(updatedState)
    expect(endAction).toHaveBeenCalledTimes(1)
    expect(endAction).toHaveBeenLastCalledWith(state)
})

test('Has correct output properties and calls to actions when finished with no fixed interval', async () => {
    const intervalAction = vi.fn(), endAction = vi.fn()
    const state = createState({period: 0.06, intervalAction, endAction })
    const startTime = new Date()
    state.Start()
    await wait(85)  // finished
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    const intervalCount = state.intervalCount
    expect(intervalCount).toBeGreaterThanOrEqual(3)
    expect(intervalCount).toBeLessThanOrEqual(4)
    expect(state.intervalTime).toBe(null)
    expect(state.remainingTime).toBe(0)
    expect(state.isRunning).toBe(false)
    expect(state.isStarted).toBe(false)
    expect(state.isFinished).toBe(true)
    expect(intervalAction).toHaveBeenCalledTimes(intervalCount)
    expect(endAction).toHaveBeenCalledTimes(1)
    expect(endAction).toHaveBeenLastCalledWith(state)
})

test('Has correct output properties and calls after Stop', async () => {
    const intervalAction = vi.fn(), endAction = vi.fn()
    const state = createState({interval: 0.03, intervalAction, endAction })
    const startTime = new Date()
    state.Start()
    await wait(80)  // 2 intervals
    const stateBeforeStop = getLatest(state)
    stateBeforeStop.Stop()
    expect(state.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(state.intervalCount).toBe(2)
    expect(state.intervalTime).toBe(0.06)
    expect(state.elapsedTime).toBeCloseTo(0.08, 2)
    expect(state.remainingTime).toBe(null)
    expect(state.isStarted).toBe(true)
    expect(state.isRunning).toBe(false)
    expect(state.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(intervalAction).toHaveBeenLastCalledWith(stateBeforeStop)
    expect(endAction).not.toHaveBeenCalled()

    await wait(30)  //make sure nothing else happens
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(endAction).not.toHaveBeenCalled()
    expect(state).toStrictEqual(state)
    expect(state.elapsedTime).toBeCloseTo(0.08, 2)
})

test('Stop, Stop again and Start without Reset', async () => {
    const intervalAction = vi.fn(), endAction = vi.fn()
    const state = createState({interval: 0.05, period: 1.0, intervalAction, endAction })
    const startTime = new Date()
    state.Start()
    await wait(115)  // 2 intervals

    state.Stop()
    await wait(30)

    state.Stop()
    await wait(30)

    state.Start()
    await wait(70)  // at least one more interval

    const stateAfterRestart = getLatest(state)
    const newStartTime = stateAfterRestart.startTime?.getTime()
    expect(newStartTime).toBeCloseTo(startTime.getTime() + 175, -1)
    expect(stateAfterRestart.intervalCount).toBe(3)
    expect(stateAfterRestart.intervalTime).toBeCloseTo(0.15, 2)
    expect(stateAfterRestart.elapsedTime).toBeCloseTo(0.185, 2)
    expect(stateAfterRestart.remainingTime).toBeCloseTo(1.0 - 0.185, 2)
    expect(stateAfterRestart.isStarted).toBe(true)
    expect(stateAfterRestart.isRunning).toBe(true)
    expect(stateAfterRestart.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(3)
    expect(intervalAction).toHaveBeenLastCalledWith(stateAfterRestart)
    expect(endAction).not.toHaveBeenCalled()
})

test('Stop, Start again without Reset', async () => {
    const intervalAction = vi.fn(), endAction = vi.fn()
    const state = createState({interval: 0.05, period: 1.0, intervalAction, endAction })
    const startTime = new Date()
    state.Start()
    await wait(115)  // 2 intervals

    state.Stop()
    await wait(30)

    expect(state.intervalCount).toBe(2)

    state.Start()
    await wait(70)  // at least one more interval

    const newStartTime = state.startTime?.getTime()
    expect(newStartTime).toBeCloseTo(startTime.getTime() + 145, -1)
    expect(state.intervalCount).toBe(3)
    expect(state.intervalTime).toBeCloseTo(0.15, 2)
    expect(state.elapsedTime).toBeCloseTo(0.185, 2)
    expect(state.remainingTime).toBeCloseTo(1.0 - 0.185, 2)
    expect(state.isStarted).toBe(true)
    expect(state.isRunning).toBe(true)
    expect(state.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(3)
    expect(intervalAction).toHaveBeenLastCalledWith(state)
    expect(endAction).not.toHaveBeenCalled()
})

test('Stop, Reset, Start', async () => {
    const intervalAction = vi.fn(), endAction = vi.fn()
    const state = createState({interval: 0.03, intervalAction, endAction })
    state.Start()
    await wait(80)  // 2 intervals

    state.Stop()
    await wait(20)

    expect(intervalAction).toHaveBeenCalledTimes(2)
    state.Reset()

    const restartTime = new Date()
    state.Start()
    await wait(50) // 1 interval

    const newStartTime = state.startTime?.getTime()
    expect(newStartTime).toBeCloseTo(restartTime.getTime(), -1)
    expect(state.intervalCount).toBe(1)
    expect(state.intervalTime).toBeCloseTo(0.03, 2)
    expect(state.elapsedTime).toBeCloseTo(0.05, 2)
    expect(state.remainingTime).toBe(null)
    expect(state.isStarted).toBe(true)
    expect(state.isRunning).toBe(true)
    expect(state.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(3)
    expect(intervalAction).toHaveBeenLastCalledWith(state)
    expect(endAction).not.toHaveBeenCalled()
})

test('Reset while running', async () => {
    const intervalAction = vi.fn(), endAction = vi.fn()
    const state = createState({interval: 0.03, intervalAction, endAction })
    state.Start()
    await wait(50)  // 1 interval

    state.Reset()
    await wait(20)

    expect(state.startTime).toBe(null)
    expect(state.intervalCount).toBe(0)
    expect(state.intervalTime).toBe(0)
    expect(state.elapsedTime).toBe(0)
    expect(state.remainingTime).toBe(null)
    expect(state.isStarted).toBe(false)
    expect(state.isRunning).toBe(false)
    expect(state.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(1)
    expect(endAction).not.toHaveBeenCalled()
})

test('Has correct output properties and calls to actions when finished after Stop and re-Start', async () => {
    const intervalAction = vi.fn(), endAction = vi.fn()
    const state = createState({period: 0.15, interval: 0.06, intervalAction, endAction })
    state.Start()
    await wait(70)
    state.Stop()
    await wait(100)
    const restartTime = new Date()
    state.Start()
    await wait(50)
    expect(state.isFinished).toBe(false)
    await wait(70)

    expect(state.startTime?.getTime()).toBeCloseTo(restartTime.getTime(), -1)
    expect(state.intervalCount).toBe(2)
    expect(state.intervalTime).toBeCloseTo(0.12, 2)
    expect(state.elapsedTime).toBeCloseTo(0.15, 2)
    expect(state.remainingTime).toBe(0)
    expect(state.isStarted).toBe(false)
    expect(state.isRunning).toBe(false)
    expect(state.isFinished).toBe(true)
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(endAction).toHaveBeenCalledTimes(1)
})

test('Has correct output properties and calls to actions after Start, finish, Start again', async () => {
    const intervalAction = vi.fn(), endAction = vi.fn()
    const state = createState({period: 0.15, interval: 0.06, intervalAction, endAction })
    state.Start()
    await wait(200)
    state.Start()
    await wait(200)

    expect(state.intervalCount).toBe(2)
    expect(state.intervalTime).toBeCloseTo(0.12, 2)
    expect(state.elapsedTime).toBeCloseTo(0.15, 2)
    expect(state.remainingTime).toBe(0)
    expect(state.isRunning).toBe(false)
    expect(state.isStarted).toBe(false)
    expect(state.isFinished).toBe(true)
    expect(endAction).toHaveBeenCalledTimes(2)
    expect(intervalAction).toHaveBeenCalledTimes(4)
})
