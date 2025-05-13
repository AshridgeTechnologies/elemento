import {beforeEach, describe, expect, test, vi} from "vitest"
import {Adapter} from '../../../src/runtime/components'
import {AdapterState} from '../../../src/runtime/components/Adapter'
import {ErrorResult, isPending} from '../../../src/runtime/DataStore'
import {testAppInterface, valueObj, wait} from '../../testutil/testHelpers'
import appFunctions from '../../../src/runtime/appFunctions'
import SendObservable, {Observer} from '../../../src/util/SendObservable'
import {AppStateForObject} from '../../../src/runtime/components/ComponentState'

vi.mock('../../../src/runtime/appFunctions')
vi.mock('../../../src/runtime/appFunctions')

class TestSendObservable extends SendObservable<any> {
    subscribeCount = 0
    unsubscribeCount = 0
    onSubscribe(observer: Observer<any>): () => void {
        this.subscribeCount++
        const sub = super.onSubscribe(observer);

        return () => {
            this.unsubscribeCount++
            sub()
        }
    }
}

class Target {
    getErrorCalls = 0
    updateImmediateCalls = 0
    observable = new TestSendObservable()
    constructor(readonly size: number) {}
    GetPlain() { return {a: 10} }
    GetWidget(id: string, isFoo: boolean) {return Promise.resolve(42 + (isFoo ? 0 : 1))}
    GetError(id: string) { this.getErrorCalls++; throw new Error('No good')}
    UpdateImmediate() { this.updateImmediateCalls++ }
    GetObservable() { return this.observable }
    UpdateWidget = vi.fn().mockImplementation( (waitTime = 10)=> wait(waitTime).then( ()=> {}))
    GetSprocket = vi.fn().mockResolvedValue({a: 10})
    GetErrorPromise = vi.fn().mockRejectedValue({message: 'Bad call'})
    equals(other: Target) { return other.size === this.size}
}

const initAdapter = ():[any, AppStateForObject, any] => {
    const target = new Target(99)
    const state = new AdapterState({target: target})
    const appInterface = testAppInterface('testPath', state)

    return [state, appInterface, target]
}

beforeEach(()=> {
    vi.resetAllMocks()
})

test('does not fail if target object is empty', () => {
    const adapter = new Adapter.State({})
})

test('does not fail if target object is an empty plain object', () => {
    const adapter = new Adapter.State({target: {}})
})

test('has functions from the target plain object', () => {

    const adapter = new Adapter.State({target: {giveMeAWidget() { const a = 1 }}})
    const adapterAny = adapter as any

    expect(typeof adapterAny.giveMeAWidget).toBe('function')
})

test('has functions from the target class object', () => {

    const adapter = new Adapter.State({target: new Target(101)})
    const adapterAny = adapter as any

    expect(typeof adapterAny.GetPlain).toBe('function')
    expect(typeof adapterAny.GetWidget).toBe('function')
    expect(typeof adapterAny.GetSprocket).toBe('function')
    expect(typeof adapterAny.UpdateWidget).toBe('function')
})

test('returns self as update result for equivalent configuration', () => {
    const adapter = new Adapter.State({target: new Target(222)})
    expect(adapter.updateFrom(new Adapter.State({target: new Target(222)}))).toBe(adapter)
})

test('calls functions, returns value immediately if not a promise and does not cache', async () => {
    const [adapter, appInterface] = initAdapter()

    const result1 = adapter.GetPlain()
    const result2 = adapter.GetPlain()
    expect(result1).toStrictEqual({a: 10})
    expect(result2).toStrictEqual({a: 10})
    expect(result2).not.toBe(result1)
    expect(appInterface.updateVersion).not.toHaveBeenCalled()
    expect(appInterface.latest().state.resultCache).toBe(undefined)
})

test('calls functions, returns pending for a promise and then cached result', async () => {
    const [adapter, appInterface] = initAdapter()

    expect(isPending(adapter.GetWidget('id1', true))).toBe(true)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(1)
    expect(isPending(appInterface.latest().state.resultCache['GetWidget#["id1",true]'])).toBe(true)

    await wait(10)
    const resultData = adapter.GetWidget('id1', true)
    expect(resultData).toStrictEqual(42)
    const resultData2 = adapter.GetWidget('id1', true)
    expect(resultData2).toBe(resultData)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(2)
    expect(appInterface.latest().state.resultCache).toStrictEqual({
        'GetWidget#["id1",true]': resultData,
    })
})

test('has pending indicator while any promise unresolved', async () => {
    const [adapter] = initAdapter()
    expect(adapter.pending).toBe(false)
    adapter.UpdateWidget(10)
    adapter.GetErrorPromise()
    expect(adapter.pending).toBe(true)
    await wait(20)
    expect(adapter.pending).toBe(false)
})

test('caches pending until result arrives', async () => {
    const [adapter, _, target] = initAdapter()
    const adapterAny = adapter as any

    expect(isPending(adapterAny.GetSprocket('id1', true))).toBe(true)
    expect(isPending(adapterAny.GetSprocket('id1', true))).toBe(true)
    await wait(10)
    expect(adapterAny.GetSprocket('id1', true)).toStrictEqual({a: 10})
    expect(target.GetSprocket).toHaveBeenCalledTimes(1)
    expect(target.GetSprocket).toHaveBeenLastCalledWith('id1', true)
})

test('caches and notifies error from rejected promise', async () => {
    const [adapter, _, target] = initAdapter()
    const adapterAny = adapter as any

    expect(isPending(adapterAny.GetErrorPromise('id1'))).toBe(true)
    await wait(10)
    const resultVal1 = adapterAny.GetErrorPromise('id1')
    const resultVal2 = adapterAny.GetErrorPromise('id1')
    expect(resultVal1).toStrictEqual(new ErrorResult('Get Error Promise', 'Bad call'))
    expect(resultVal2).toBe(resultVal1)
    expect(target.GetErrorPromise).toHaveBeenCalledTimes(1)
    expect(target.GetErrorPromise).toHaveBeenLastCalledWith('id1')
    expect(appFunctions.NotifyError).toHaveBeenCalledWith('Get Error Promise', new Error('Bad call'))
})

test('returns error result without caching if error thrown directly', async () => {
    const [adapter, _, target] = initAdapter()
    const adapterAny = adapter as any

    const resultVal1 = adapterAny.GetError('id1')
    const resultVal2 = adapterAny.GetError('id1')
    expect(resultVal1).toStrictEqual(new ErrorResult('Get Error', 'No good'))
    expect(resultVal2).toStrictEqual(new ErrorResult('Get Error', 'No good'))
    expect(resultVal2).not.toBe(resultVal1)
    expect(target.getErrorCalls).toBe(2)
    expect(appFunctions.NotifyError).not.toHaveBeenCalled()
})

test('pending result can be used as a promise', async () => {
    const [adapter] = initAdapter()
    await expect(adapter.GetWidget('id1', true)).resolves.toStrictEqual(42)
})

test('gets correct cached result for parallel calls', async () => {
    const [adapter] = initAdapter()

    expect(isPending(adapter.GetWidget('id1', true))).toBe(true)
    expect(isPending(adapter.GetWidget('id1', false))).toBe(true)
    expect(isPending(adapter.GetSprocket('id1', false))).toBe(true)
    await wait(10)
    expect(adapter.GetWidget('id1', true)).toStrictEqual(42)
    expect(adapter.GetWidget('id1', false)).toStrictEqual(43)
    expect(adapter.GetSprocket('id1', false)).toStrictEqual({a: 10})
})

test('refreshes individual cached result for each call', async () => {
    const [adapter, appInterface] = initAdapter()

    expect(isPending(adapter.GetWidget('id1', true))).toBe(true)
    expect(isPending(adapter.GetWidget('id1', false))).toBe(true)
    expect(isPending(adapter.GetSprocket('id1', false))).toBe(true)
    await wait(10)
    expect(adapter.GetWidget('id1', true)).toBe(42)
    expect(adapter.GetWidget('id1', false)).toBe(43)
    expect(adapter.GetSprocket('id1', false)).toStrictEqual({a: 10})
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(6)


    adapter.Refresh('GetWidget', 'id1', true)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(7)
    expect(appInterface.latest().state.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': undefined,
            'GetWidget#["id1",false]': 43,
            'GetSprocket#["id1",false]': {a: 10},
        })

    expect(isPending(adapter.GetWidget('id1', true))).toBe(true)
    await wait(10)
    expect(adapter.GetWidget('id1', true)).toStrictEqual(42)
    expect(adapter.GetWidget('id1', false)).toStrictEqual(43)
    expect(adapter.GetSprocket('id1', false)).toStrictEqual({a: 10})

    expect(appInterface.updateVersion).toHaveBeenCalledTimes(9)
    expect(appInterface.latest().state.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': 42,
            'GetWidget#["id1",false]': 43,
            'GetSprocket#["id1",false]': {a: 10},
        })
})

test('refreshes all cached results for one function', async () => {
    const [adapter, appInterface] = initAdapter()

    expect(isPending(adapter.GetWidget('id1', true))).toBe(true)
    expect(isPending(adapter.GetWidget('id1', false))).toBe(true)
    expect(isPending(adapter.GetSprocket('id1', false))).toBe(true)
    await wait(10)
    expect(adapter.GetWidget('id1', true)).toStrictEqual(42)
    expect(adapter.GetWidget('id1', false)).toStrictEqual(43)
    expect(adapter.GetSprocket('id1', false)).toStrictEqual({a: 10})
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(6)

    adapter.Refresh('GetWidget')
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(7)
    expect(appInterface.latest().state.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': undefined,
            'GetWidget#["id1",false]': undefined,
            'GetSprocket#["id1",false]': {a: 10},
        })

    expect(isPending(adapter.GetWidget('id1', true))).toBe(true)
    expect(isPending(adapter.GetWidget('id1', false))).toBe(true)
    expect(adapter.GetSprocket('id1', false)).toStrictEqual({a: 10})

    await wait(10)
    expect(adapter.GetWidget('id1', true)).toStrictEqual(42)
    expect(adapter.GetWidget('id1', false)).toStrictEqual(43)
    expect(adapter.GetSprocket('id1', false)).toStrictEqual({a: 10})
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(11)
})

test('refreshes all cached results', async () => {
    const [adapter, appInterface] = initAdapter()

    expect(isPending(adapter.GetWidget('id1', true))).toBe(true)
    expect(isPending(adapter.GetWidget('id1', false))).toBe(true)
    expect(isPending(adapter.GetSprocket('id1', false))).toBe(true)
    await wait(10)
    expect(adapter.GetWidget('id1', true)).toStrictEqual(42)
    expect(adapter.GetWidget('id1', false)).toStrictEqual(43)
    expect(adapter.GetSprocket('id1', false)).toStrictEqual({a: 10})

    adapter.Refresh()
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(7)
    expect(appInterface.latest().state.resultCache).toStrictEqual({})

    expect(isPending(adapter.GetWidget('id1', true))).toBe(true)
    expect(isPending(adapter.GetWidget('id1', false))).toBe(true)
    expect(isPending(adapter.GetSprocket('id1', false))).toBe(true)
    await wait(10)
    expect(adapter.GetWidget('id1', true)).toStrictEqual(42)
    expect(adapter.GetWidget('id1', false)).toStrictEqual(43)
    expect(adapter.GetSprocket('id1', false)).toStrictEqual({a: 10})
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(13)
    expect(appInterface.latest().state.resultCache).toStrictEqual(
        {
            'GetWidget#["id1",true]': 42,
            'GetWidget#["id1",false]': 43,
            'GetSprocket#["id1",false]': {a: 10},
        })
})

test('can use object values in arguments', async () => {
    const [adapter, _, target] = initAdapter()

    expect(isPending(adapter.GetSprocket(valueObj('id1'), valueObj(true)))).toBe(true)
    await wait(10)
    expect(adapter.GetSprocket(valueObj('id1'), valueObj(true))).toStrictEqual({a: 10})
    expect(target.GetSprocket).toHaveBeenCalledWith('id1', true)
    expect(target.GetSprocket).toHaveBeenCalledTimes(1)
})

test('does not cache functions that return undefined immediately', async () => {
    const [adapter, appInterface, target] = initAdapter()
    const returnVal1 = adapter.UpdateImmediate()
    const returnVal2 = adapter.UpdateImmediate()
    expect(returnVal1).toBe(undefined)
    expect(returnVal2).toBe(undefined)
    expect(appInterface.updateVersion).not.toHaveBeenCalled()
    expect(appInterface.latest().state.resultCache).toBe(undefined)
    expect(target.updateImmediateCalls).toBe(2)
})

test('does not cache functions that resolve to undefined', async () => {
    const [adapter, _, target] = initAdapter()
    const changes = {c: 'foo'}
    const returnVal1 = adapter.UpdateWidget('id1', changes)
    const returnVal2 = adapter.UpdateWidget('id1', changes)
    expect(isPending(returnVal1)).toBe(true)
    expect(returnVal2).toBe(returnVal1)
    expect(await returnVal1).toBe(undefined)
    expect(target.UpdateWidget).toHaveBeenCalledTimes(1)

    await wait(20)

    const returnVal3 = adapter.UpdateWidget('id1', changes)
    const returnVal4 = adapter.UpdateWidget('id1', changes)
    expect(isPending(returnVal3)).toBe(true)
    expect(returnVal4).toBe(returnVal3)
    expect(returnVal4).not.toBe(returnVal1)
    expect(await returnVal3).toBe(undefined)
    expect(target.UpdateWidget).toHaveBeenCalledTimes(2)
})

describe('observables', () => {
    test('calls functions, returns null (not pending) then cached result', async () => {
        const [adapter, appInterface, target] = initAdapter()

        // expect(isPending(adapter.GetObservable('id1', true))).toBe(true)
        expect(adapter.GetObservable('id1', true)).toBe(null)
        expect(adapter.GetObservable('id1', true)).toBe(null)
        expect(appInterface.updateVersion).toHaveBeenCalledTimes(2)

        const data1 = {d: 99}, data2 = {d: 100}
        target.observable.send(data1)
        await wait()
        const resultData = adapter.GetObservable('id1', true)
        const resultData2 = adapter.GetObservable('id1', true)
        expect(resultData).toStrictEqual(data1)
        expect(resultData2).toBe(resultData)


        expect(appInterface.updateVersion).toHaveBeenCalledTimes(3)
        expect(appInterface.latest().state.resultCache).toStrictEqual({
            'GetObservable#["id1",true]': resultData,
        })

        target.observable.send(data2)
        await wait()
        const resultData3 = adapter.GetObservable('id1', true)
        const resultData4 = adapter.GetObservable('id1', true)
        expect(resultData3).toStrictEqual(data2)
        expect(resultData4).toBe(resultData3)

        expect(appInterface.updateVersion).toHaveBeenCalledTimes(4)
    })

    test('unsubscribes after refresh at all levels', async () => {
        const [adapter, appInterface, target] = initAdapter()
        adapter.GetObservable('id1', true)
        adapter.GetObservable('id2', true)
        adapter.GetObservable('id3', true)
        await wait()

        expect(target.observable.subscribeCount).toBe(3)
        adapter.Refresh('GetObservable', 'id1', true)
        expect(target.observable.unsubscribeCount).toBe(1)
        adapter.Refresh('GetObservable')
        expect(target.observable.unsubscribeCount).toBe(3)

        adapter.GetObservable('id3', true)
        adapter.GetObservable('id4', true)
        expect(target.observable.subscribeCount).toBe(5)
        adapter.Refresh()
        expect(target.observable.unsubscribeCount).toBe(5)
    })

    test('handles errors and caches them', async () => {
        const [adapter, appInterface, target] = initAdapter()

        expect(adapter.GetObservable('id1', true)).toBe(null)
        expect(appInterface.updateVersion).toHaveBeenCalledTimes(2)

        const data1 = {d: 99}, error = {message: 'No good'}
        target.observable.send(data1)
        await wait()
        expect(adapter.GetObservable('id1', true)).toStrictEqual(data1)
        expect(appInterface.updateVersion).toHaveBeenCalledTimes(3)

        target.observable.error(error)
        await wait()
        const result2 = adapter.GetObservable('id1', true)
        const result3 = adapter.GetObservable('id1', true)
        expect(result2).toStrictEqual(new ErrorResult('Get Observable', 'No good'))
        expect(result3).toBe(result2)

        expect(appInterface.latest().state.resultCache).toStrictEqual({
            'GetObservable#["id1",true]': new ErrorResult('Get Observable', 'No good'),
        })
        expect(appInterface.updateVersion).toHaveBeenCalledTimes(4)
    })

})
