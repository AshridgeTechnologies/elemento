import {beforeEach, expect, test, vi} from 'vitest'
import {wait} from '../../testutil/testHelpers'
import {ComponentStateStore, type StoredState, type StoredStateWithProps} from '../../../src/runtime/state/BaseComponentState'

type Props = { [p: string]: any }

class BasicTestItem {
    constructor(public props: Props) {
    }

    get id() { return this.props.id }
}

class TestItem extends BasicTestItem implements StoredStateWithProps<Props> {

    withProps(props: Props){
        return new (this.constructor as any)(props)
    }
    get id() { return this.props.id }
}

class TestItemWithInit extends TestItem {
    path: string = ''
    updateFn: ((newVersion: any) => void) | undefined = undefined

    init(path: string, updateFn: (newVersion: any) => void, _proxy: this, _previousVersion?: any) {
        this.path = path
        this.updateFn = updateFn
    }
}

class TestItem2 extends TestItemWithInit {
    update(item: this) { this.updateFn!(item) }
}

let store: ComponentStateStore
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
    store = new ComponentStateStore()
})

test('creates new items', () => {
    const item1 = store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const item2 = store.getOrUpdate(id2, TestItemWithInit, item2Props)
    expect(store.get(id1)).toBe(item1)
    expect(store.get(id2)).toBe(item2)
    expect(item1.path).toBe('id1')
    expect(item1.id).toBe('id1')
})

test('creates new items if props have changed', () => {
    const item1 = store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const item1a = store.getOrUpdate(id1, TestItemWithInit, item1changedProps)
    expect(store.get(id1)).not.toBe(item1)
    expect(store.get(id1)).toBe(item1a)
    expect(item1a.path).toBe('id1')
    expect(item1a.props.a).toBe(11)
})

test('creates new items if class has changed', () => {
    const item1 = store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const item2 = store.getOrUpdate(id1, TestItem2, item1Props)
    expect(store.get(id1)).not.toBe(item1)
    expect(store.get(id1)).toBe(item2)
    expect(store.get(id1)).toBeInstanceOf(TestItem2)
    expect(item2.path).toBe('id1')
    expect(item2.props.a).toBe(10)
})

test('creates new items with no init', () => {
    const item1 = store.getOrUpdate(id1, TestItem, item1Props)
    const item2 = store.getOrUpdate(id2, TestItem, item2Props)
    expect(store.get(id1)).toBe(item1)
    expect(store.get(id2)).toBe(item2)
    expect(item1.id).toBe('id1')
})

test('creates new items with no withProps if props have changed', () => {
    const item1 = store.getOrUpdate(id1, BasicTestItem, item1Props)
    const item1a = store.getOrUpdate(id1, BasicTestItem, item1changedProps)
    expect(store.get(id1)).not.toBe(item1)
    expect(store.get(id1)).toBe(item1a)
    expect(item1a.props.a).toBe(11)
})

test('creates new items with no init if props have changed', () => {
    const item1 = store.getOrUpdate(id1, TestItem, item1Props)
    const item1a = store.getOrUpdate(id1, TestItem, item1changedProps)
    expect(store.get(id1)).not.toBe(item1)
    expect(store.get(id1)).toBe(item1a)
    expect(item1a.props.a).toBe(11)
})

test('gets item if already in store', () => {
    const item1 = store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const item1_ = store.get('id1')
    expect(item1_).toBe(item1)
})

test('gets placeholder if not in store', () => {
    const item1: any = store.get('id1')
    expect(item1._isPlaceholder).toBe(true)
    expect(item1.valueOf()).toBe(undefined)
})

test('updates item if already in store', () => {
    store.getOrUpdate(id1, TestItemWithInit, item1Props)
    const item1a = new TestItemWithInit(item1changedProps)
    store.update(id1, item1a)
    expect((store.get(id1) as any)._original).toBe(item1a)
})

test('updates item with no init if already in store', () => {
    store.getOrUpdate(id1, TestItem, item1Props)
    const item1a = new TestItem(item1changedProps)
    store.update(id1, item1a as StoredState)
    expect((store.get(id1) as any)._original).toBe(item1a)
})

test('inserts item if not already in store', () => {
    const item1 = new TestItemWithInit(item1Props)
    store.update(id1, item1)
    expect((store.get(id1) as any)._original).toBe(item1)
})

test('inserts item with no init if not already in store', () => {
    const item1 = new TestItem(item1Props)
    store.update(id1, item1 as StoredState)
    expect((store.get(id1) as any)._original).toBe(item1)
})

test('updates and gets latest version via AppStateForObject', () => {
    const item1 = store.getOrUpdate(id1, TestItem2, item1Props)
    const item1a = new TestItem2(item1changedProps)

    expect(store.get(id1)).toBe(item1)

    item1.update(item1a)
    expect((store.get(id1) as any)._original).toBe(item1a)
    expect(store.get<TestItem2>(id1).props.a).toBe(11)
})

test('gets child state via AppStateForObject', () => {
    const item1 = store.getOrUpdate(id1, TestItem2, item1Props)
    const item2 = store.getOrUpdate(id1_2, TestItem2, item2Props)

    expect(item1[id2 as keyof TestItem2]).toBe(item2)
})
