import AppStateStore from '../../src/runtime/AppStateStore'
import SubscribableStore from '../../src/runtime/SubscribableStore'
import {BaseComponentState, ComponentState} from '../../src/runtime/components/ComponentState'
import {wait} from '../testutil/testHelpers'

class TestItem extends BaseComponentState<any> {}

type StateObjectProperties = {color?: string, length?: number}
class StateObject extends BaseComponentState<StateObjectProperties> implements ComponentState<StateObject> {

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
let item1: TestItem,
    item2: TestItem,
    item1_2: TestItem,
    item1same: TestItem,
    item1changed: TestItem,
    item1_2changed: TestItem

beforeEach( ()=> {
    item1 = new TestItem({id: id1, a: 10})
    item2 = new TestItem({id: id2, a: 20})
    item1_2 = new TestItem({id: id1_2, a: 100})
    item1same = new TestItem({id: id1, a: 10})
    item1changed = new TestItem({id: id1, a: 11})
    item1_2changed = new TestItem({id: id1_2, a: 101})
    store = new AppStateStore(new SubscribableStore())
})

test('gets and sets items by id and inits the items', () => {
    store.set(id1, item1)
    store.set(id2, item2)
    expect(store.get(id1)).toBe(item1)
    expect(store.get(id2)).toBe(item2)
    // @ts-ignore
    expect(item1._path).toBe('id1')
})

test('updateIfChanged does nothing if items equal', () => {
    store.set(id1, item1)
    store.updateIfChanged(id1, item1same)
    expect(store.get(id1)).toBe(item1)
})

test('updateIfChanged sets and defers notifications if item not present', async () => {
    const callback = jest.fn()
    store.subscribe(id1, callback)
    store.updateIfChanged(id1, item1)
    expect(store.get(id1)).toBe(item1)
    expect(callback).not.toHaveBeenCalled()
    await wait()
    expect(callback).toHaveBeenCalled()})

test('updateIfChanged replaces if items change and defers notifications', async () => {
    const callback = jest.fn()
    store.set(id1, item1)
    store.subscribe(id1, callback)
    store.updateIfChanged(id1, item1changed)
    expect((store.get(id1) as TestItem).props.a).toBe(item1changed.props.a)
    expect(callback).not.toHaveBeenCalled()
    await wait()
    expect(callback).toHaveBeenCalled()
})

test('notifies parent items on changes', () => {
    store.set(id1, item1)
    store.set(id1_2, item1_2)
    item1.onChildStateChange = jest.fn()
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
