import {beforeEach, expect, test, vi} from 'vitest'
import AppStateStore, {AppStateForObject, PlaceholderFn} from '../../../src/runtime/state/AppStateStore'
import {wait} from '../../testutil/testHelpers'
import SubscribableStore from '../../../src/runtime/state/SubscribableStore'
import {equals} from 'ramda'

type Props = { [p: string]: any }

class TestItem  {
    public id: string = ''
    constructor(public props: Props) {
        Object.assign(this, props)
    }
}

class TestItem2 extends TestItem {}

class OtherTestItem  {
    public id: string = ''
    constructor(public props: Props) {
        Object.assign(this, props)
    }
}



const placeholderFn: PlaceholderFn = (id: string) => ({placeholder: true, id})

let store: AppStateStore
const id1 = 'id1'
const id2 = 'id2'
const id1_2 = 'id1.id2'
let item1Props: object,
    item2Props: object,
    item1changedProps: object,
    wrapComponentState: any,
    withUpdatedProps: any

beforeEach(() => {
    item1Props = {id: id1, a: 10}
    item2Props = {id: id2, a: 20}
    item1changedProps = {id: id1, a: 11}
    wrapComponentState = vi.fn().mockImplementation((_id: string, item: any) => item)
    withUpdatedProps = vi.fn().mockImplementation((item: any, props) => {
        const newProps = {...item.props, ...props}
        return equals(newProps, item.props) ? item : new item.constructor(newProps)
    })
    store = new AppStateStore(new SubscribableStore(), wrapComponentState, withUpdatedProps, placeholderFn)
})

test('creates new items', () => {
    const item1 = store.getOrUpdate(id1, TestItem, item1Props)
    const item2 = store.getOrUpdate(id2, TestItem, item2Props)
    expect(store.get(id1)).toBe(item1)
    expect(store.get(id2)).toBe(item2)
    expect(item1.id).toBe('id1')
})

test('creates new items if props have changed', () => {
    const item1 = store.getOrUpdate(id1, TestItem, item1Props)
    const item1a = store.getOrUpdate(id1, TestItem, item1changedProps)
    expect(store.get(id1)).not.toBe(item1)
    expect(store.get(id1)).toBe(item1a)
    expect(item1a.id).toBe(id1)
    expect(item1a.props.a).toBe(11)
})

test('creates new items if class of existing is not a subclass of new', () => {
    const item1 = store.getOrUpdate(id1, TestItem, item1Props)
    const item2 = store.getOrUpdate(id1, TestItem2, item1Props)
    expect(store.get(id1)).not.toBe(item1)
    expect(store.get(id1)).toBe(item2)
    expect(store.get(id1)).toBeInstanceOf(TestItem2)
    expect(item2.id).toBe(id1)
    expect(item2.props.a).toBe(10)
})

test('leaves existing item if class of existing is a subclass of new and props match', () => {
    const item1 = store.getOrUpdate(id1, TestItem2, item1Props)
    const item2 = store.getOrUpdate(id1, TestItem, item1Props)
    expect(store.get(id1)).toBe(item1)
    expect(item2).toBe(item1)
})

test('leaves existing item if props have not changed', () => {
    const item1 = store.getOrUpdate(id1, TestItem, item1Props)
    const item1a = store.getOrUpdate(id1, TestItem, item1Props)
    expect(store.get(id1)).toBe(item1)
    expect(item1a).toBe(item1)
})

test('setDeferNotifications sets and defers notifications if item not present', async () => {
    const item1 = new TestItem(item1Props)
    const callback = vi.fn()
    store.subscribeAll(callback)
    store.setDeferNotifications(id1, item1)
    expect(store.get(id1)).toBe(item1)
    expect(callback).not.toHaveBeenCalled()
    await wait()
    expect(callback).toHaveBeenCalledWith([id1])
})

test('setDeferNotifications replaces if item present and defers notifications', async () => {
    store.getOrUpdate(id1, TestItem, item1Props)
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
    const item1 = store.getOrUpdate(id1, TestItem, item1Props)
    const item1_ = store.get('id1')
    expect(item1_).toBe(item1)
})

test('gets placeholder if not in store', () => {
    const item1: any = store.get('id1')
    expect(item1.placeholder).toBe(true)
})

test('updates item if already in store', () => {
    store.getOrUpdate(id1, TestItem, item1Props)
    const item1a = new TestItem(item1changedProps)
    store.update(id1, item1a)
    expect(store.get(id1)).toBe(item1a)
})

test('inserts item if not already in store', () => {
    const item1 = new TestItem(item1Props)
    store.update(id1, item1)
    expect(store.get(id1)).toBe(item1)
})

test('passes correct arguments to wrapComponent function', () => {
    const item1 = store.getOrUpdate(id1, TestItem2, item1Props)
    const args = wrapComponentState.mock.lastCall
    expect(args[0]).toBe(id1)
    expect(args[1]).toBe(item1)
    expect(args[3]).toBe(undefined)
})

test('updates and gets latest version via AppStateForObject', () => {
    const item1 = store.getOrUpdate(id1, TestItem2, item1Props)
    const appStateForObject = wrapComponentState.mock.lastCall[2]
    const item1a = new TestItem2(item1changedProps)

    expect(store.get(id1)).toBe(item1)

    appStateForObject.update(item1a)
    expect(store.get(id1)).toBe(item1a)
    expect(store.get<TestItem2>(id1).props.a).toBe(11)
    expect(appStateForObject.latest()).toBe(item1a)

    const args = wrapComponentState.mock.lastCall
    expect(args[0]).toBe(id1)
    expect(args[1]).toBe(item1a)
    expect(args[3]).toBe(item1)
})

test('gets child state via AppStateForObject', () => {
    store.getOrUpdate(id1, TestItem2, item1Props)
    const appStateForObject = wrapComponentState.mock.lastCall[2] as AppStateForObject<TestItem2>
    const item2 = store.getOrUpdate(id1_2, TestItem2, item2Props)

    expect(appStateForObject.getChildState(id2)).toBe(item2)
})

test('uses default configuration if no arguments provided', () => {
    const store = new AppStateStore()
    const props1 = {a: 10, b: 'foo'}
    const item1 = store.getOrUpdate(id1, Object, props1)

    expect(item1).toBe(props1) // Object constructor returns same object

    const updatedProps = {a: 11}
    const item2 = store.getOrUpdate(id1, Object, updatedProps)
    expect(item2).toBe(item1) // default is to update in place
    expect(item2).toStrictEqual({a: 11, b: 'foo'})
    expect(store.get(id1)).toBe(item1)

    expect(store.get('xxx')).toBe(null)
})
