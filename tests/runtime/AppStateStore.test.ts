import {beforeEach, expect, test, vi} from 'vitest'
import AppStateStore from '../../src/runtime/state/AppStateStore'
import {BaseComponentState, ComponentState} from '../../src/runtime/components/ComponentState'
import {wait} from '../testutil/testHelpers'

class TestItem extends BaseComponentState<any> {
    get id() { return this.props.id }
}

type StateObjectProperties = {color?: string, length?: number}
class StateObject extends BaseComponentState<StateObjectProperties> implements ComponentState {

    constructor(props: StateObjectProperties) {
        super(props)
    }
    get color() {
        return this.state.color ?? this.props.color
    }

    get length() {
        return this.state.length ?? this.props.length ?? 0
    }

    setColor(color: string) {
        this.updateState({color})
    }

    increaseLength(amount: number) {
        this.updateState({length: this.length + amount})
    }

}

class StateObject2 extends StateObject {
}

const stateObj = (props: StateObjectProperties) => new StateObject(props)

let store: AppStateStore
const id1 = 'id1'
const id2 = 'id2'
const id1_2 = 'id1.id2'
let item1Props: object,
    item2Props: object,
    item1_2: TestItem,
    item1sameProps: object,
    item1changedProps: object,
    item1_2changed: TestItem

beforeEach( ()=> {
    item1Props = {id: id1, a: 10}
    item2Props = {id: id2, a: 20}
    item1_2 = new TestItem({id: id1_2, a: 100})
    item1sameProps = {...item1Props}
    item1changedProps = {id: id1, a: 11}
    item1_2changed = new TestItem({id: id1_2, a: 101})
    store = new AppStateStore()
})

test('creates new items', () => {
    const item1 = store.getOrCreate(id1, TestItem, item1Props)
    const item2 = store.getOrCreate(id2, TestItem, item2Props)
    expect(store.get(id1)._raw).toBe(item1._raw)
    expect(store.get(id2)._raw).toBe(item2._raw)
    // @ts-ignore
    expect(item1._path).toBe('id1')
    expect(item1.id).toBe('id1')
})

test('creates new items if props have changed', () => {
    const item1 = store.getOrCreate(id1, TestItem, item1Props)
    const item1a = store.getOrCreate(id1, TestItem, item1changedProps)
    expect(store.get(id1)._raw).not.toBe(item1._raw)
    expect(store.get(id1)._raw).toBe(item1a._raw)
    // @ts-ignore
    expect(item1a._path).toBe('id1')
    expect(item1a.props.a).toBe(11)
})

test('setDeferNotifications sets and defers notifications if item not present', async () => {
    const item1 = new TestItem(item1Props)
    const callback = vi.fn()
    store.subscribeAll(callback)
    store.setDeferNotifications(id1, item1)
    expect(store.get(id1)._raw).toBe(item1)
    expect(callback).not.toHaveBeenCalled()
    await wait()
    expect(callback).toHaveBeenCalledWith([id1])
})

test('setDeferNotifications replaces if item present and defers notifications', async () => {
    const item1 = store.getOrCreate(id1, TestItem, item1Props)
    const callback = vi.fn()
    store.subscribeAll(callback)
    const item1changed = new TestItem(item1changedProps)
    store.setDeferNotifications(id1, item1changed)
    expect((store.get(id1) as TestItem).props.a).toBe(item1changed.props.a)
    expect(callback).not.toHaveBeenCalled()
    await wait()
    expect(callback).toHaveBeenCalledWith([id1])
})

test('gets item if already in store', () => {
    const item1 = store.getOrCreate(id1, TestItem, item1Props)
    const item1_ = store.get('id1')
    expect(item1_._raw).toBe(item1._raw)
})

test('gets placeholder if not in store', () => {
    const item1_ = store.get('id1')
    expect(item1_._isPlaceholder).toBe(true)
})

test('notifies parent items on changes', () => {
    store.set(id1, item1)
    store.set(id1_2, item1_2)
    item1.onChildStateChange = vi.fn()
    store.set(id1_2, item1_2changed)
    expect(item1.onChildStateChange).toHaveBeenCalled()
})


// from old appData.test

test('state object can update its own state immediately', () => {
    const state = stateObj({color: 'red', length: 23})
    store.set<StateObject>('TheApp.foo', state)
    state.setColor('blue')
    state.increaseLength(2)
    expect(state.latest().color).toBe('blue')
    expect(state.latest().length).toBe(25)
    expect((store.get('TheApp.foo') as StateObject)).toBe(state.latest())
})

test('state object can get latest to update its own state', () => {
    const state = stateObj({color: 'red', length: 23})
    store.set<StateObject>('TheApp.foo', state)
    state.increaseLength(2)
    state.latest().increaseLength(2)
    state.latest().increaseLength(3)
    expect(state.latest().length).toBe(30)
})

test('BaseComponentState keeps same state if properties change', async () => {
    const state = stateObj({color: 'red', length: 23})._withStateForTest({color: 'blue'})
    const stateWithNewProps = state.updateFrom(stateObj({color: 'red', length: 55}))
    expect(stateWithNewProps.color).toBe('blue')
    expect(stateWithNewProps.length).toBe(55)
})

test('BaseComponentState uses constructor of new object even if props are the same', async () => {
    const state = stateObj({color: 'red', length: 23})._withStateForTest({color: 'blue'})
    const stateWithNewProps = state.updateFrom(new StateObject2({color: 'red', length: 23}))
    expect(stateWithNewProps.color).toBe('blue')
    expect(stateWithNewProps.length).toBe(23)
    expect(stateWithNewProps.constructor).toBe(StateObject2)
})
