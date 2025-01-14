import SubscribableStore from '../../src/runtime/SubscribableStore'

let store: SubscribableStore
const id1 = 'id1'
const id2 = 'id2'
const item1 = 'Item 1', item2 = {a: 10}
const item1a = 'Item 1a', item2a = {a: 11}

beforeEach( ()=> store = new SubscribableStore())


test('gets and sets items by id', () => {
    store.set(id1, item1)
    store.set(id2, item2)
    expect(store.get(id1)).toBe(item1)
    expect(store.get(id2)).toBe(item2)
})

test('updates items by id', () => {
    store.set(id1, item1)
    store.set(id2, item2)
    store.set(id1, item1a)
    store.set(id2, item2a)
    expect(store.get(id1)).toBe(item1a)
    expect(store.get(id2)).toBe(item2a)
})

test('gets undefined for non-existent id', () => {
    expect(store.get('xxx')).toBeUndefined()
})

test('can subscribe to updates by id with multiple listeners', () => {
    store.set(id1, item1)
    store.set(id2, item2)

    const listener1 = jest.fn()
    const listener1a = jest.fn()
    const listener2 = jest.fn()
    store.subscribe(id1, listener1)
    store.subscribe(id1, listener1a)
    store.subscribe(id2, listener2)

    store.set(id1, item1a)
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1a).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(0)

    store.set(id2, item2a)
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1a).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
})

test('can unsubscribe from an individual listener', () => {
    store.set(id1, item1)
    const listener1 = jest.fn()
    const listener2 = jest.fn()
    const unsubscribe1 = store.subscribe(id1, listener1)
    const unsubscribe2 = store.subscribe(id2, listener2)
    store.set(id1, item1a)
    store.set(id2, item2)
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)

    unsubscribe1()
    store.set(id1, item1)
    store.set(id2, item2a)
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(2)

    unsubscribe2()
    store.set(id1, item1a)
    store.set(id2, item2)
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(2)
})

test('can subscribe and unsubscribe to all updates', () => {
    store.set(id1, item1)
    const listener1 = jest.fn()
    const listener2 = jest.fn()
    const unsubscribe1 = store.subscribeAll(listener1)
    const unsubscribe2 = store.subscribeAll(listener2)
    store.set(id1, item1a)
    store.set(id2, item2)
    expect(listener1).toHaveBeenCalledTimes(2)
    expect(listener1).toHaveBeenLastCalledWith([id2])
    expect(listener2).toHaveBeenCalledTimes(2)
    expect(listener2).toHaveBeenCalledWith([id1])
    expect(listener2).toHaveBeenLastCalledWith([id2])

    unsubscribe1()
    store.set(id2, item2a)
    store.set(id1, item1)
    expect(listener1).toHaveBeenCalledTimes(2)
    expect(listener2).toHaveBeenCalledTimes(4)
    expect(listener2).toHaveBeenLastCalledWith([id1])

    unsubscribe2()
    store.set(id1, item1a)
    store.set(id2, item2)
    expect(listener1).toHaveBeenCalledTimes(2)
    expect(listener2).toHaveBeenCalledTimes(4)
})

test('can defer updates and send together', () => {
    const listener1 = jest.fn()
    const listener1a = jest.fn()
    const listener2 = jest.fn()
    const listenerAll = jest.fn()
    store.subscribe(id1, listener1)
    store.subscribe(id1, listener1a)
    store.subscribe(id2, listener2)
    store.subscribeAll(listenerAll)

    store.deferNotifications()
    expect(store.isNotifyDeferred).toBe(true)
    store.set(id1, item1)
    store.set(id2, item2)
    store.set(id1, item1a)

    expect(listener1).not.toHaveBeenCalled()
    expect(listener1a).not.toHaveBeenCalled()
    expect(listener2).not.toHaveBeenCalled()
    expect(listenerAll).not.toHaveBeenCalled()

    store.sendNotifications()

    expect(store.isNotifyDeferred).toBe(false)
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1a).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listenerAll).toHaveBeenCalledTimes(1)
    expect(listenerAll).toHaveBeenCalledWith([id1, id2])
})

test('new updates in a sendNotifications callback are sent separately', () => {
    const listener1 = jest.fn().mockImplementationOnce( ()=> {
        store.deferNotifications()
        store.set(id2, item2)
    })
    const listener2 = jest.fn()
    const listenerAll = jest.fn()
    store.subscribe(id1, listener1)
    store.subscribe(id2, listener2)
    store.subscribeAll(listenerAll)

    store.deferNotifications()
    expect(store.isNotifyDeferred).toBe(true)
    store.set(id1, item1)

    expect(listener1).not.toHaveBeenCalled()
    expect(listenerAll).not.toHaveBeenCalled()

    store.sendNotifications()
    expect(store.isNotifyDeferred).toBe(true)  // because listener 1 sets it again
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).not.toHaveBeenCalled()
    expect(listenerAll).toHaveBeenCalledWith([id1])

    store.sendNotifications()
    expect(store.isNotifyDeferred).toBe(false)
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listenerAll).toHaveBeenLastCalledWith([id2])


})
