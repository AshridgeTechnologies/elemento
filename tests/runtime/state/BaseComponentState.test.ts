/**
 * @vitest-environment jsdom
 */
import {expect, test} from 'vitest'
import {BaseComponentState} from '../../../src/runtime/components'
import AppStateStore from '../../../src/runtime/state/AppStateStore'
import {BaseComponentStateWithProxy} from '../../../src/runtime/state/BaseComponentState'

type StateObjectProperties = {color?: string, length?: number}
class StateObject extends BaseComponentState<StateObjectProperties> {

    get color() {
        return this.state.color ?? this.props.color
    }

    get length() {
        return this.state.length ?? this.props.length ?? 0
    }

    setColor(color: string | undefined) {
        this.updateState({color})
    }

    increaseLength(amount: number) {
        this.updateState({length: this.latest().length + amount})
    }

}

class StateObject2 extends StateObject {

    get subState() {
        return this.getChildState('subState')
    }
}

class StateObjectWithProxy extends BaseComponentStateWithProxy<StateObjectProperties> {
    get color() {
        return this.props.color
    }

    get backgroundColor() {
        return (this as any).background.color
    }

    lightColor() {
        return 'light' + this.color
    }

    lightBackgroundColor() {
        return 'light' + this.backgroundColor
    }

    get lbcx2() {
        const {lightBackgroundColor} = this._boundMethods()
        return this.lightBackgroundColor() + '-' + lightBackgroundColor()
    }

    instanceLightColor = () => {
        return 'light' + this.color
    }

    instanceLightBackgroundColor = () => {
        return 'light' + this.backgroundColor
    }

}

test('State class gets path', () => {
    const store = new AppStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject, {color: 'red', length: 23})
    expect(state._path).toBe('TheApp.foo')
})

test('state object updates its own latest state and merges with previous state', () => {
    const store = new AppStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject, {color: 'red', length: 23})
    state.setColor('blue')
    state.increaseLength(2)
    expect(state.latest().color).toBe('blue')
    expect(state.latest().length).toBe(25)
    expect((store.get('TheApp.foo') as StateObject)).toBe(state.latest())
})

test('state object does not change if state the same', () => {
    const store = new AppStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject, {color: 'red', length: 23})
    state.increaseLength(2)
    state.setColor('red')
    const state1 = state.latest()
    state.increaseLength(0)
    state.setColor('red')
    expect(state.latest()).toBe(state1)
})

test('keeps same state if properties change', async () => {
    const state = new StateObject({color: 'red', length: 23}).withState({color: 'blue'})
    const stateWithNewProps = state.withProps({color: 'red', length: 55})
    expect(stateWithNewProps.color).toBe('blue')
    expect(stateWithNewProps.length).toBe(55)
})

test('removes state item if set to undefined', async () => {
    const store = new AppStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject, {color: 'red', length: 23})
    state.setColor('blue')
    state.increaseLength(2)
    expect(state.latest().color).toBe('blue')
    expect(state.latest().length).toBe(25)

    state.setColor(undefined)
    expect(state.latest().color).toBe('red')
    expect(state.latest().length).toBe(25)
    expect(state.latest()._stateForTest).toStrictEqual({length: 25})
})

test('keeps same instance if properties do not change', async () => {
    const state = new StateObject({color: 'red', length: 23}).withState({color: 'blue'})
    const state2 = state.withProps({color: 'red', length: 23})
    expect(state2).toBe(state)
})

test('gets child state from store', () => {
    const store = new AppStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject2, {color: 'red', length: 23})
    const subState = store.getOrUpdate('TheApp.foo.subState', StateObject, {color: 'green', length: 7})

    expect(state.subState).toBe(subState)
})

test('gets own properties and methods via proxy', () => {
    const store = new AppStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObjectWithProxy, {color: 'red'})

    expect(state.color).toBe('red')
    expect(state.lightColor()).toBe('lightred')
    expect(state.instanceLightColor()).toBe('lightred')
})

test('gets child state from store automatically via proxy', () => {
    const store = new AppStateStore()
    const state: any = store.getOrUpdate('TheApp.foo', StateObjectWithProxy, {color: 'red', length: 23})
    const subState = store.getOrUpdate('TheApp.foo.subState', StateObject, {color: 'green', length: 7})

    expect(state.subState).toBe(subState)
})

test('gets child state from store automatically via proxy in own method', () => {
    const store = new AppStateStore()
    const state: any = store.getOrUpdate('TheApp.foo', StateObjectWithProxy, {color: 'red'})
    const subState = store.getOrUpdate('TheApp.foo.background', StateObject, {color: 'green'})

    expect(state.lightColor()).toBe('lightred')
    expect(state.lightBackgroundColor()).toBe('lightgreen')
    expect(state.backgroundColor).toBe('green')
    expect(state.lbcx2).toBe('lightgreen-lightgreen')
})

test('can call own methods without target when bound to state object', () => {
    const store = new AppStateStore()
    const state: any = store.getOrUpdate('TheApp.foo', StateObjectWithProxy, {color: 'red'})
    const subState = store.getOrUpdate('TheApp.foo.background', StateObject, {color: 'green'})

    const {lightColor, lightBackgroundColor} = state._boundMethods()
    expect(lightColor()).toBe('lightred')
    expect(lightBackgroundColor()).toBe('lightgreen')
})

test.skip('can call own methods in method defined on instance instead of prototype', () => {
    const store = new AppStateStore()
    const state: any = store.getOrUpdate('TheApp.foo', StateObjectWithProxy, {color: 'red'})
    const subState = store.getOrUpdate('TheApp.foo.background', StateObject, {color: 'green'})

    expect(state.instanceLightColor()).toBe('lightred')
    expect(state.instanceLightBackgroundColor()).toBe('lightgreen')
})
