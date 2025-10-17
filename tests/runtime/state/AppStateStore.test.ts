import {beforeEach, expect, test, vi} from 'vitest'
import AppStateStore, {AppStateForObject, StoredState, StoredStateWithProps} from '../../../src/runtime/state/AppStateStore'
import {wait} from '../../testutil/testHelpers'

type Props = { [p: string]: any }

class TestItem implements StoredStateWithProps<Props> {
    constructor(public props: Props) {
    }

    withProps(props: Props){
        return new (this.constructor as any)(props)
    }
    get id() { return this.props.id }
}

class TestItemWithInit extends TestItem {
    asi: AppStateForObject<any> | undefined = undefined

    init(asi: AppStateForObject<any>, _previousVersion?: any): this {
        this.asi = asi
        return this
    }
}

class TestItem2 extends TestItemWithInit {
    latest() { return this.asi?.latest() }
    update(item: this) { this.asi?.update(item) }
    getChild(name: string) { return this.asi?.getChildState(name) }
}

let store: AppStateStore
const id1 = 'id1'
const id2 = 'id2'
const id1_2 = 'id1.id2'
let item1Props: object,
    item2Props: object,
    item1changedProps: object

beforeEach( ()=> {
    item1Props = {id: id1, a: 10}
    item2Props = {id: id2, a: 20}
    item1changedProps = {id: id1, a: 11}
    store = new AppStateStore()
})

test('creates new items', () => {
    const item1 = store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const item2 = store.getOrUpdate(id2, TestItemWithInit, item2Props)
    expect(store.get(id1)).toBe(item1)
    expect(store.get(id2)).toBe(item2)
    // @ts-ignore
    expect(item1.asi.path).toBe('id1')
    expect(item1.id).toBe('id1')
})

test('creates new items if props have changed', () => {
    const item1 = store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const item1a = store.getOrUpdate(id1, TestItemWithInit, item1changedProps)
    expect(store.get(id1)).not.toBe(item1)
    expect(store.get(id1)).toBe(item1a)
    expect(item1a.asi?.path).toBe('id1')
    expect(item1a.props.a).toBe(11)
})

test('creates new items if class has changed', () => {
    const item1 = store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const item2 = store.getOrUpdate(id1, TestItem2, item1Props)
    expect(store.get(id1)).not.toBe(item1)
    expect(store.get(id1)).toBe(item2)
    expect(store.get(id1)).toBeInstanceOf(TestItem2)
    expect(item2.asi?.path).toBe('id1')
    expect(item2.props.a).toBe(10)
})

test('creates new items with no init', () => {
    const item1 = store.getOrUpdate(id1, TestItem, item1Props)
    const item2 = store.getOrUpdate(id2, TestItem, item2Props)
    expect(store.get(id1)).toBe(item1)
    expect(store.get(id2)).toBe(item2)
    expect(item1.id).toBe('id1')
})

test('creates new items with no init if props have changed', () => {
    const item1 = store.getOrUpdate(id1, TestItem, item1Props)
    const item1a = store.getOrUpdate(id1, TestItem, item1changedProps)
    expect(store.get(id1)).not.toBe(item1)
    expect(store.get(id1)).toBe(item1a)
    expect(item1a.props.a).toBe(11)
})

test('setDeferNotifications sets and defers notifications if item not present', async () => {
    const item1 = new TestItemWithInit(item1Props)
    const callback = vi.fn()
    store.subscribeAll(callback)
    store.setDeferNotifications(id1, item1)
    expect(store.get(id1)).toBe(item1)
    expect(callback).not.toHaveBeenCalled()
    await wait()
    expect(callback).toHaveBeenCalledWith([id1])
})

test('setDeferNotifications replaces if item present and defers notifications', async () => {
    store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const callback = vi.fn()
    store.subscribeAll(callback)
    const item1changed = new TestItemWithInit(item1changedProps)
    store.setDeferNotifications(id1, item1changed)
    expect((store.get(id1) as TestItemWithInit).props.a).toBe(item1changed.props.a)
    expect(callback).not.toHaveBeenCalled()
    await wait()
    expect(callback).toHaveBeenCalledWith([id1])
})

test('gets item if already in store', () => {
    const item1 = store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const item1_ = store.get('id1')
    expect(item1_).toBe(item1)
})

test('gets placeholder if not in store', () => {
    const item1: any = store.get('id1')
    expect(item1._isPlaceholder).toBe(true)
    expect(item1()).toBe(undefined)
    expect(item1.valueOf()).toBe(undefined)
})

test('updates item if already in store', () => {
    const item1 = store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const item1a = new TestItemWithInit(item1changedProps)
    store.update(id1, item1a, item1)
    expect(store.get(id1)).toBe(item1a)
})

test('updates item with no init if already in store', () => {
    const item1 = store.getOrUpdate(id1, TestItem, item1Props)
    const item1a = new TestItem(item1changedProps)
    store.update(id1, item1a as StoredState, item1 as StoredState)
    expect(store.get(id1)).toBe(item1a)
})

test('inserts item if not already in store', () => {
    const item1 = new TestItemWithInit(item1Props)
    store.update(id1, item1)
    expect(store.get(id1)).toBe(item1)
})

test('inserts item with no init if not already in store', () => {
    const item1 = new TestItem(item1Props)
    store.update(id1, item1 as StoredState)
    expect(store.get(id1)).toBe(item1)
})

test('updates and gets latest version via AppStateForObject', () => {
    const item1 = store.getOrUpdate(id1, TestItem2, item1Props)
    const item1a = new TestItem2(item1changedProps)

    expect(item1.latest()).toBe(item1)

    item1.update(item1a)
    expect(item1.latest()).toBe(item1a)
    expect(store.get<TestItem2>(id1).props.a).toBe(11)
})

test('gets child state via AppStateForObject', () => {
    const item1 = store.getOrUpdate(id1, TestItem2, item1Props)
    const item2 = store.getOrUpdate(id1_2, TestItem2, item2Props)

    expect(item1.getChild(id2)).toBe(item2)
})
