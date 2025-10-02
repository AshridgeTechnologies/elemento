/**
 * @vitest-environment jsdom
 */
import {describe, expect, test} from 'vitest'
import {render} from '@testing-library/react'
import {useComponentState} from '../../../src/runtime/state/appStateHooks'
import {BaseComponentState, ComponentStateStore} from '../../../src/runtime/state/BaseComponentState'
import React from 'react'
import {StoreProvider} from '../../../src/runtime/state/StoreContext'
import {wait} from '../../testutil/testHelpers'
import SubscribableStore from '../../../src/runtime/state/SubscribableStore'

class TestState extends BaseComponentState<{ value: number }> {
    get value() { return this.state.value ?? this.props.value}

    set value(value: number) { this.updateState({value})}
}

const TestComponent = ({id, value = 42}: {id: string, value?: number}) => {
    const state = useComponentState(id, TestState, {value})
    return <div>{state.value.toString()}</div>
}

class TestContainerState extends BaseComponentState<{}, {multiplier: number}> {
    get multiplier() { return this.state.multiplier ?? 10}
    set multiplier(multiplier: number) { this.updateState({multiplier})}
}

const ParentMultiplierDisplay = ({id}: {id: string}) => {
    const parentId = id.substring(0, id.lastIndexOf('.'))
    const parentState: any = useComponentState(parentId)
    return <span id='mult'>{parentState.multiplier}</span>
}

const TestContainer1 = ({id}: {id: string}) => {
    const state: any = useComponentState(id, TestContainerState, {})
    const timesXValue = (state.test1.value * state.multiplier).toString()
    return <div>
        <TestComponent id={id + '.' + 'test1'} />
        [<TestComponent id={id + '.' + 'test2'} value={state.test1.value} />]
        <span> x <ParentMultiplierDisplay id={id + '.' + 'test1'}/> = </span>
        <div id='timesX'>{timesXValue}</div>
    </div>
}

describe('useComponentState hook', () => {

    test('initializes with default state in default app store', () => {
        const {container} = render(
            <StoreProvider>
                <TestComponent id="test1" />
            </StoreProvider>
        )
        expect(container.textContent).toBe('42')
    })

    test('initializes with default state', () => {
        const store = new ComponentStateStore()
        const {container} = render(
            <StoreProvider appStore={store}>
                <TestComponent id="test1" />
            </StoreProvider>
        )
        expect(container.textContent).toBe('42')
        const state = store.get<TestState>('test1')
        expect(state.value).toBe(42)
    })

    test('updates element when state changes', async () => {
        const store = new ComponentStateStore()
        const {container} = render(
            <StoreProvider appStore={store}>
                <TestComponent id="test1" />
            </StoreProvider>
        )
        expect(container.textContent).toBe('42')
        const state = store.get<TestState>('test1')
        expect(state.value).toBe(42)
        state.value = 99
        await wait(20)
        expect(container.textContent).toBe('99')
    })

    test('can access child state and update when it changes', async () => {
        const store = new ComponentStateStore()
        const {container} = render(
            <StoreProvider appStore={store}>
                <TestContainer1 id="container1" />
            </StoreProvider>
        )

        await wait(10)
        expect(container.textContent).toBe('42[42] x 10 = 420')
        const childState = store.get<TestState>('container1.test1')
        expect(childState.value).toBe(42)
        childState.value = 99
        await wait(10)
        expect(container.textContent).toBe('99[99] x 10 = 990')
    })

    test('can access parent state and update when it changes', async () => {
        const store = new ComponentStateStore()
        const {container} = render(
            <StoreProvider appStore={store}>
                <TestContainer1 id="container1" />
            </StoreProvider>
        )

        await wait(10)
        expect(container.textContent).toBe('42[42] x 10 = 420')
        const containerState = store.get<TestContainerState>('container1')
        expect(containerState.multiplier).toBe(10)
        containerState.multiplier = 20
        await wait(10)
        expect(container.textContent).toBe('42[42] x 20 = 840')
    })

    test('unsubscribes on unmount', async () => {
        const subscribableStore = new SubscribableStore()
        const storeListenerCount = () => (subscribableStore as any).listenersFor('*').length
        const store = new ComponentStateStore(subscribableStore)
        const {unmount} = render(
            <StoreProvider appStore={store}>
                <TestComponent id="test1"/>
            </StoreProvider>
        )
        expect(storeListenerCount()).toBe(1)
        unmount()
        expect(storeListenerCount()).toBe(0)
    })
})
