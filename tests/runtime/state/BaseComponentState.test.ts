/**
 * @vitest-environment jsdom
 */
import {expect, test} from 'vitest'
import {BaseComponentState, ComponentStateStore, createProxy} from '../../../src/runtime/state/BaseComponentState'
import {AppStateForObject} from '../../../src/runtime/state/AppStateStore'

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
        this.updateState({length: this.length + amount})
    }

    increaseLengthUsingState(amount: number) {
        const currentLength = this.state.length ?? 0
        this.updateState({length: currentLength + amount})
    }

}

class StateObject2 extends StateObject {

    get subState() {
        return (this as any).subState
    }
}

class StateObject3 extends BaseComponentState<StateObjectProperties> {
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
        const {lightBackgroundColor} = this
        return this.lightBackgroundColor() + '-' + lightBackgroundColor()
    }

    instanceLightColor = () => {
        return 'light' + this.color
    }

    instanceLightBackgroundColor = () => {
        return 'light' + this.backgroundColor
    }

    [Symbol.toPrimitive]() {
        return this.color
    }

}

test('State proxy is new for each version but the same each time that version is accessed', () => {
    const store = new ComponentStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject, {color: 'red', length: 23})
    expect(store.get('TheApp.foo')).toBe(state)
    expect(store.get('TheApp.foo')).toBe(store.get('TheApp.foo'))

    const state2 = store.getOrUpdate('TheApp.foo', StateObject, {color: 'blue', length: 23})
    expect(state2).not.toBe(state)
    expect(store.get('TheApp.foo')).toBe(state2)
    expect(store.get('TheApp.foo')).toBe(store.get('TheApp.foo'))
})

test('State class gets path', () => {
    const store = new ComponentStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject, {color: 'red', length: 23})
    expect(state._path).toBe('TheApp.foo')
})

const latest = <T>(store: ComponentStateStore, state: T): T => store.getPlain((state as any)._path) as T

test('state object updates its own latest state and merges with previous state and ', () => {
    const store = new ComponentStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject, {color: 'red', length: 23})
    state.setColor('blue')
    state.increaseLength(2)
    const newState: any = store.get('TheApp.foo')
    expect(newState.color).toBe('blue')
    expect(newState.length).toBe(25)
})

test('state object does not change if state the same', () => {
    const store = new ComponentStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject, {color: 'red', length: 23})
    state.increaseLength(2)
    state.setColor('red')
    const state1 = store.get('TheApp.foo')
    expect(state1).not.toBe(state)
    state.increaseLength(0)
    state.setColor('red')
    const state2 = store.get('TheApp.foo')
    expect(state2).toBe(state1)
})

test('keeps same state if properties change', async () => {
    const state = new StateObject({color: 'red', length: 23}).withState({color: 'blue'})
    const stateWithNewProps = state.withProps({color: 'red', length: 55})
    expect(stateWithNewProps.color).toBe('blue')
    expect(stateWithNewProps.length).toBe(55)
})

test('removes state item if set to undefined', async () => {
    const store = new ComponentStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject, {color: 'red', length: 23})
    state.setColor('blue')
    state.increaseLength(2)
    const newState: any = store.get('TheApp.foo')
    expect(newState.color).toBe('blue')
    expect(newState.length).toBe(25)

    state.setColor(undefined)
    const newState2: any = store.get('TheApp.foo')

    expect(newState2.color).toBe('red')
    expect(newState2.length).toBe(25)
    expect(newState2._stateForTest).toStrictEqual({length: 25})
})

test('keeps same instance if properties do not change', async () => {
    const state = new StateObject({color: 'red', length: 23}).withState({color: 'blue'})
    const state2 = state.withProps({color: 'red', length: 23})
    expect(state2).toBe(state)
})

test('gets own properties and methods via proxy', () => {
    const store = new ComponentStateStore()
    const state = store.getOrUpdate('TheApp.foo', StateObject3, {color: 'red'})

    expect(state.color).toBe('red')
    expect(state.lightColor()).toBe('lightred')
    expect(state.instanceLightColor()).toBe('lightred')
})

test('gets child state from store automatically via proxy', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('TheApp.foo', StateObject3, {color: 'red', length: 23})
    const subState = store.getOrUpdate('TheApp.foo.subState', StateObject, {color: 'green', length: 7})

    expect(state.subState).toBe(subState)
})

test('gets child state from store automatically via proxy in own method', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('TheApp.foo', StateObject3, {color: 'red'})
    const subState = store.getOrUpdate('TheApp.foo.background', StateObject, {color: 'green'})

    expect(state.lightColor()).toBe('lightred')
    expect(state.lightBackgroundColor()).toBe('lightgreen')
    expect(state.backgroundColor).toBe('green')
    expect(state.lbcx2).toBe('lightgreen-lightgreen')
})

test('can call own methods without target when bound to state object', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('TheApp.foo', StateObject3, {color: 'red'})
    const subState = store.getOrUpdate('TheApp.foo.background', StateObject, {color: 'green'})

    const {lightColor, lightBackgroundColor} = state
    expect(lightColor()).toBe('lightred')
    expect(lightBackgroundColor()).toBe('lightgreen')
})

test('caches bound methods for each version but they still call the latest version', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('TheApp.foo', StateObject3, {color: 'red'})

    const {lightColor} = state
    expect(state.lightColor).toBe(lightColor)

    const state2: any = store.getOrUpdate('TheApp.foo', StateObject3, {color: 'blue'})
    const {lightColor: lightColor2} = state2
    expect(lightColor2).not.toBe(lightColor)
    expect(state2.lightColor).toBe(lightColor2)
    expect(state.lightColor).toBe(lightColor2) // because gets latest bound method

    expect(lightColor2()).toBe('lightblue')
    expect(lightColor()).toBe('lightblue') // because proxy uses the latest version
})

test('calls bound prototype methods and properties on latest version if changed since they were accessed', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('TheApp.foo', StateObject3, {color: 'red'})

    const {lightColor} = state
    expect(lightColor()).toBe('lightred')

    store.getOrUpdate('TheApp.foo', StateObject3, {color: 'blue'})
    expect(state.color).toBe('blue')
    expect(lightColor()).toBe('lightblue')

    expect(state + 99).toBe('blue99')
})

test('can call own methods defined on instance and get the version at the time they were accessed', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('TheApp.foo', StateObject3, {color: 'red'})

    const {instanceLightColor} = state
    expect(instanceLightColor()).toBe('lightred')
    expect(state.instanceLightColor()).toBe('lightred')

    const state2 = store.getOrUpdate('TheApp.foo', StateObject3, {color: 'green'})
    expect(state2.instanceLightColor()).toBe('lightgreen')
    expect(state.instanceLightColor()).toBe('lightgreen')

    const {instanceLightColor: instanceLightColor2} = state2
    expect(instanceLightColor2).not.toBe(instanceLightColor)
    expect(instanceLightColor()).toBe('lightred')  // method saved before state change uses old values
    expect(instanceLightColor2()).toBe('lightgreen')
})

test('calls methods that change state on latest version via original proxy', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('state1', StateObject, {length: 10})
    expect(state.length).toBe(10)

    state.increaseLength(1)
    expect(state.length).toBe(11)

    state.increaseLength(1)
    expect(state.length).toBe(12)
    expect(store.get<StateObject>('state1').length).toBe(12)

    state.increaseLength(1)
    expect(state.length).toBe(13)
    expect(store.get<StateObject>('state1').length).toBe(13)
})

test('calls methods that use state directly on latest version via original proxy', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('state1', StateObject, {})
    expect(state.length).toBe(0)

    state.increaseLengthUsingState(2)
    expect(state.length).toBe(2)

    state.increaseLengthUsingState(3)
    expect(state.length).toBe(5)
    expect(store.get<StateObject>('state1').length).toBe(5)

    state.increaseLengthUsingState(4)
    expect(state.length).toBe(9)
    expect(store.get<StateObject>('state1').length).toBe(9)
})

test('can use proxy before object is in store', () => {
    const store = new ComponentStateStore()
    const storeInterface: AppStateForObject<any> = {
        path: 'state1',
        latest() { return store.getPlain(this.path) },
        update: (newVersion: any) => {},
        getChildState(subPath: string) { return store.get(this.path + '.' + subPath) },

    }
    const plainState = new StateObject({color: 'red', length: 23})
    const stateProxy = createProxy(storeInterface, plainState)

    expect(plainState.color).toBe('red')
    expect(stateProxy.color).toBe('red')

    store.update('state1.state2', new StateObject({color: 'blue'}))
    expect(stateProxy.state2.color).toBe('blue')
})

test('gets placeholder for unknown properties', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('state1', StateObject, {})

    const foo = state.foo
    expect(foo._isPlaceholder).toBe(true)
    expect(foo.valueOf()).toBe(undefined)
    expect(foo[Symbol.toPrimitive]()).toBe(undefined)
    expect(foo.path).toBe('state1.foo')
})

test('does not get placeholder for excluded properties', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('state1', StateObject, {})
    expect(state.equals).toBe(undefined)
})

test('gets placeholder for unknown non-excluded properties of a placeholder', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('state1', StateObject, {})

    const bar = state.foo.bar
    expect(bar._isPlaceholder).toBe(true)
    expect(bar.valueOf()).toBe(undefined)
    expect(bar[Symbol.toPrimitive]()).toBe(undefined)
    expect(bar.path).toBe('state1.foo.bar')
    expect(bar.equals).toBe(undefined)
})

test('placeholder sub-prop can be called as a function but not top-level placeholder', () => {
    const store = new ComponentStateStore()
    const state: any = store.getOrUpdate('state1', StateObject, {})

    const foo = state.foo
    const bar = foo.bar
    expect(typeof foo).toBe('object')
    expect(typeof bar).toBe('function')
    expect(bar()).toBe(undefined)
})


