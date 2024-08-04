/**
 * @jest-environment jsdom
 */

import {Timer} from '../../../src/runtime/components/index'
import {testAppInterface, valueObj, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {render} from '@testing-library/react'
import '@testing-library/jest-dom'
import {testContainer} from '../../testutil/rtlHelpers'
import {TimerState} from '../../../src/runtime/components/Timer'

const [timer, appStoreHook] = wrappedTestElement(Timer, TimerState)
const stateAt = (path: string) => appStoreHook.stateAt(path)

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
    const {container} = render(timer('app.page1.timer', {period: 10}, {
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
    const {el} = testContainer(timer('app.page1.timer1', {show: true}, {period: 0.2, interval: 0.1}))
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
    const state = new Timer.State({period: 2, interval: 0.05 })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(startTime.getTime(), -1)
    expect(updatedState.elapsedTime).toBeCloseTo(0, 2)
    expect(updatedState.intervalTime).toBe(0)
    expect(updatedState.remainingTime).toBeCloseTo(2, 2)
    expect(updatedState.intervalCount).toBe(0)
    expect(updatedState.isStarted).toBe(true)
    expect(updatedState.isRunning).toBe(true)
    expect(updatedState.isFinished).toBe(false)
})

test('Has correct output properties immediately after started without fixed period', () => {
    const state = new Timer.State({ interval: 0.05, intervalAction: jest.fn(), endAction: jest.fn() })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(updatedState.intervalTime).toBe(0)
    expect(updatedState.elapsedTime).toBeCloseTo(0, 2)
    expect(updatedState.remainingTime).toBe(null)
    expect(updatedState.intervalCount).toBe(0)
    expect(updatedState.isStarted).toBe(true)
    expect(updatedState.isRunning).toBe(true)
    expect(updatedState.isFinished).toBe(false)
})

test('Calls interval action while running', async () => {
    const intervalAction = jest.fn()
    const state = new Timer.State({period: 2, interval: 0.03, intervalAction })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    await wait(80)  // 2 intervals
    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(updatedState.intervalCount).toBe(2)
    expect(updatedState.intervalTime).toBe(0.06)
    expect(updatedState.elapsedTime).toBeCloseTo(0.08, 2)
    expect(updatedState.value).toBeCloseTo(0.08, 2)
    expect(updatedState.remainingTime).toBeCloseTo(1.92, 2)
    expect(updatedState.isRunning).toBe(true)
    expect(updatedState.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(intervalAction).toHaveBeenLastCalledWith(updatedState)
})

test('Has correct output properties if start called while running', async () => {
    const intervalAction = jest.fn()
    const state = new Timer.State({period: 2, interval: 0.03, intervalAction })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    await wait(80)  // 2 intervals

    state.latest().Start()

    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(updatedState.intervalCount).toBe(2)
    expect(updatedState.intervalTime).toBe(0.06)
    expect(updatedState.elapsedTime).toBeCloseTo(0.08, 1)
    expect(updatedState.remainingTime).toBeCloseTo(1.92, 1)
    expect(updatedState.isStarted).toBe(true)
    expect(updatedState.isRunning).toBe(true)
    expect(updatedState.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(intervalAction).toHaveBeenLastCalledWith(updatedState)
})

test('Has correct output properties while running without fixed period ', async () => {
    const state = new Timer.State({interval: 0.03, intervalAction: jest.fn(), endAction: jest.fn() })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    await wait(80)  // 2 intervals
    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(updatedState.intervalCount).toBe(2)
    expect(updatedState.intervalTime).toBe(0.06)
    expect(updatedState.elapsedTime).toBeCloseTo(0.082, 2)
    expect(updatedState.remainingTime).toBe(null)
    expect(updatedState.isStarted).toBe(true)
    expect(updatedState.isRunning).toBe(true)
    expect(updatedState.isFinished).toBe(false)
})

test('Has correct output properties while running without fixed interval or period', async () => {
    const intervalAction = jest.fn()
    const state = new Timer.State({intervalAction, endAction: jest.fn() })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    await wait(32)
    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(updatedState.intervalCount).toBe(2)
    expect(updatedState.intervalTime).toBe(null)
    expect(updatedState.elapsedTime).toBeCloseTo(0.034, 2)
    expect(updatedState.remainingTime).toBe(null)
    expect(updatedState.isRunning).toBe(true)
    expect(updatedState.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(updatedState.intervalCount)
})

test('Has correct output properties while running with period but no fixed interval', async () => {
    const intervalAction = jest.fn()
    const state = new Timer.State({period: 3, intervalAction, endAction: jest.fn() })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    await wait(34)
    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    const intervalCount = updatedState.intervalCount
    expect(intervalCount).toBeGreaterThanOrEqual(2) // if requestAnimationFrame is 60 fps
    expect(intervalCount).toBeLessThanOrEqual(3)
    expect(updatedState.intervalTime).toBe(null)
    expect(updatedState.remainingTime).toBeCloseTo(2.966, 1)
    expect(updatedState.isRunning).toBe(true)
    expect(updatedState.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(intervalCount)
})

test('Has correct output properties and calls to actions when finished', async () => {
    const intervalAction = jest.fn(), endAction = jest.fn()
    const state = new Timer.State({period: 0.09, interval: 0.03, intervalAction, endAction })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    await wait(120)  // should be finished
    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(updatedState.intervalCount).toBe(2) // last interval comes just after finished
    expect(updatedState.intervalTime).toBe(0.06)
    expect(updatedState.elapsedTime).toBeCloseTo(0.09, 2)
    expect(updatedState.remainingTime).toBe(0)
    expect(updatedState.isStarted).toBe(false)
    expect(updatedState.isRunning).toBe(false)
    expect(updatedState.isFinished).toBe(true)
    const stateStartTime = updatedState.startTime?.getTime() as number
    expect(updatedState.finishedTime?.getTime()).toBeGreaterThan(stateStartTime + 90)
    expect(updatedState.finishedTime?.getTime()).toBeLessThan(stateStartTime + 120)
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(endAction).toHaveBeenCalledTimes(1)
    expect(endAction).toHaveBeenLastCalledWith(updatedState)
})

test('Has correct output properties and calls to actions when finished with incomplete interval', async () => {
    const intervalAction = jest.fn(), endAction = jest.fn()
    const state = new Timer.State({period: 0.075, interval: 0.03, intervalAction, endAction })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    await wait(95)  // 2 intervals and finished
    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    const intervalCount = updatedState.intervalCount // test is flaky unless allow for missed raf calls
    expect(intervalCount).toBeGreaterThanOrEqual(1)
    expect(intervalCount).toBeLessThanOrEqual(2)
    expect(updatedState.intervalTime).toBe(0.06)
    expect(updatedState.isStarted).toBe(false)
    expect(updatedState.isFinished).toBe(true)
    expect(updatedState.isRunning).toBe(false)
    expect(updatedState.elapsedTime).toBe(0.075)
    expect(updatedState.remainingTime).toBe(0)
    expect(intervalAction).toHaveBeenCalledTimes(intervalCount)
    // expect(intervalAction).toHaveBeenLastCalledWith(updatedState)
    expect(endAction).toHaveBeenCalledTimes(1)
    expect(endAction).toHaveBeenLastCalledWith(updatedState)
})

test('Has correct output properties and calls to actions when finished with no fixed interval', async () => {
    const intervalAction = jest.fn(), endAction = jest.fn()
    const state = new Timer.State({period: 0.06, intervalAction, endAction })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    await wait(85)  // finished
    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    const intervalCount = updatedState.intervalCount
    expect(intervalCount).toBeGreaterThanOrEqual(3)
    expect(intervalCount).toBeLessThanOrEqual(4)
    expect(updatedState.intervalTime).toBe(null)
    expect(updatedState.remainingTime).toBe(0)
    expect(updatedState.isRunning).toBe(false)
    expect(updatedState.isStarted).toBe(false)
    expect(updatedState.isFinished).toBe(true)
    expect(intervalAction).toHaveBeenCalledTimes(intervalCount)
    expect(endAction).toHaveBeenCalledTimes(1)
    expect(endAction).toHaveBeenLastCalledWith(updatedState)
})

test('Has correct output properties and calls after Stop', async () => {
    const intervalAction = jest.fn(), endAction = jest.fn()
    const state = new Timer.State({interval: 0.03, intervalAction, endAction })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    await wait(80)  // 2 intervals
    const stateBeforeStop = state.latest()
    stateBeforeStop.Stop()
    const stateAfterStop = state.latest()
    expect(stateAfterStop.startTime?.getTime()).toBeCloseTo(startTime.getTime())
    expect(stateAfterStop.intervalCount).toBe(2)
    expect(stateAfterStop.intervalTime).toBe(0.06)
    expect(stateAfterStop.elapsedTime).toBeCloseTo(0.08, 2)
    expect(stateAfterStop.remainingTime).toBe(null)
    expect(stateAfterStop.isStarted).toBe(true)
    expect(stateAfterStop.isRunning).toBe(false)
    expect(stateAfterStop.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(intervalAction).toHaveBeenLastCalledWith(stateBeforeStop)
    expect(endAction).not.toHaveBeenCalled()

    await wait(30)  //make sure nothing else happens
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(endAction).not.toHaveBeenCalled()
    expect(state.latest()).toBe(stateAfterStop)
    expect(stateAfterStop.elapsedTime).toBeCloseTo(0.08, 2)
})

test('Stop, Stop again and Start without Reset', async () => {
    const intervalAction = jest.fn(), endAction = jest.fn()
    const state = new Timer.State({interval: 0.05, period: 1.0, intervalAction, endAction })
    const appInterface = testAppInterface('testPath', state)
    const startTime = new Date()
    state.Start()
    await wait(115)  // 2 intervals

    state.latest().Stop()
    await wait(30)

    state.latest().Stop()
    await wait(30)

    state.latest().Start()
    await wait(70)  // at least one more interval

    const stateAfterRestart = state.latest()
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

test('Stop, Reset, Start', async () => {
    const intervalAction = jest.fn(), endAction = jest.fn()
    const state = new Timer.State({interval: 0.03, intervalAction, endAction })
    const appInterface = testAppInterface('testPath', state)
    state.Start()
    await wait(80)  // 2 intervals

    state.latest().Stop()
    await wait(20)

    expect(intervalAction).toHaveBeenCalledTimes(2)
    state.latest().Reset()

    const restartTime = new Date()
    state.latest().Start()
    await wait(50) // 1 interval

    const stateAfterRestart = state.latest()
    const newStartTime = stateAfterRestart.startTime?.getTime()
    expect(newStartTime).toBeCloseTo(restartTime.getTime(), -1)
    expect(stateAfterRestart.intervalCount).toBe(1)
    expect(stateAfterRestart.intervalTime).toBeCloseTo(0.03, 2)
    expect(stateAfterRestart.elapsedTime).toBeCloseTo(0.05, 2)
    expect(stateAfterRestart.remainingTime).toBe(null)
    expect(stateAfterRestart.isStarted).toBe(true)
    expect(stateAfterRestart.isRunning).toBe(true)
    expect(stateAfterRestart.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(3)
    expect(intervalAction).toHaveBeenLastCalledWith(stateAfterRestart)
    expect(endAction).not.toHaveBeenCalled()
})

test('Reset while running', async () => {
    const intervalAction = jest.fn(), endAction = jest.fn()
    const state = new Timer.State({interval: 0.03, intervalAction, endAction })
    const appInterface = testAppInterface('testPath', state)
    state.Start()
    await wait(50)  // 1 interval

    state.latest().Reset()
    await wait(20)

    const stateAfterReset = state.latest()
    expect(stateAfterReset.startTime).toBe(null)
    expect(stateAfterReset.intervalCount).toBe(0)
    expect(stateAfterReset.intervalTime).toBe(0)
    expect(stateAfterReset.elapsedTime).toBe(0)
    expect(stateAfterReset.remainingTime).toBe(null)
    expect(stateAfterReset.isStarted).toBe(false)
    expect(stateAfterReset.isRunning).toBe(false)
    expect(stateAfterReset.isFinished).toBe(false)
    expect(intervalAction).toHaveBeenCalledTimes(1)
    expect(endAction).not.toHaveBeenCalled()
})

test('Has correct output properties and calls to actions when finished after Stop and re-Start', async () => {
    const intervalAction = jest.fn(), endAction = jest.fn()
    const state = new Timer.State({period: 0.15, interval: 0.06, intervalAction, endAction })
    const appInterface = testAppInterface('testPath', state)
    state.Start()
    await wait(70)
    state.latest().Stop()
    await wait(100)
    const restartTime = new Date()
    state.latest().Start()
    await wait(50)
    expect(state.latest().isFinished).toBe(false)
    await wait(70)

    const updatedState = state.latest()
    expect(updatedState.startTime?.getTime()).toBeCloseTo(restartTime.getTime(), -1)
    expect(updatedState.intervalCount).toBe(2)
    expect(updatedState.intervalTime).toBeCloseTo(0.12, 2)
    expect(updatedState.elapsedTime).toBeCloseTo(0.15, 2)
    expect(updatedState.remainingTime).toBe(0)
    expect(updatedState.isStarted).toBe(false)
    expect(updatedState.isRunning).toBe(false)
    expect(updatedState.isFinished).toBe(true)
    expect(intervalAction).toHaveBeenCalledTimes(2)
    expect(endAction).toHaveBeenCalledTimes(1)
})

test('Has correct output properties and calls to actions after Start, finish, Start again', async () => {
    const intervalAction = jest.fn(), endAction = jest.fn()
    const state = new Timer.State({period: 0.15, interval: 0.06, intervalAction, endAction })
    const appInterface = testAppInterface('testPath', state)
    state.Start()
    await wait(200)
    state.latest().Start()
    await wait(200)

    const updatedState = state.latest()
    expect(updatedState.intervalCount).toBe(2)
    expect(updatedState.intervalTime).toBeCloseTo(0.12, 2)
    expect(updatedState.elapsedTime).toBeCloseTo(0.15, 2)
    expect(updatedState.remainingTime).toBe(0)
    expect(updatedState.isRunning).toBe(false)
    expect(updatedState.isStarted).toBe(false)
    expect(updatedState.isFinished).toBe(true)
    expect(endAction).toHaveBeenCalledTimes(2)
    expect(intervalAction).toHaveBeenCalledTimes(4)
})
