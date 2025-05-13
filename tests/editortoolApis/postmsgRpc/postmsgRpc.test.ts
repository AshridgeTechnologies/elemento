import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test, MockedFunction } from "vitest"
import {caller, observer} from '../../../src/shared/postmsgRpc/client'
import {expose, exposeFunctions} from '../../../src/shared/postmsgRpc/server'
import fakeWindows from './helpers/fake-windows'
import fs from 'fs'
import {wait} from '../../testutil/testHelpers'
import SendObservable from '../../../src/util/SendObservable'

const Fruits = JSON.parse(fs.readFileSync(__dirname + '/fixtures/fruits.json', 'utf8'))

test('should fetch data from remote function that returns data', async () => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: () => Fruits
  }

  expose('getFruits', fruitService.getFruits, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
  })

  const getFruits = caller('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: server.postMessage
  })

  const fruits = await getFruits()

  expect(fruits).toStrictEqual(Fruits)
})

test('should fetch data from remote function that returns promise', async () => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: () => Promise.resolve(Fruits)
  }

  expose('getFruits', fruitService.getFruits, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
  })

  const getFruits = caller('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: server.postMessage
  })

  const fruits = await getFruits()

  expect(fruits).toStrictEqual(Fruits)
})

test('should observe data from remote', async () => {
    const [server, client] = fakeWindows()

    const fruitsObservable = new SendObservable()
    const fruitService = {
        getFruits: () => fruitsObservable
    }

    expose('getFruits', fruitService.getFruits, {
        addListener: server.addEventListener,
        removeListener: server.removeEventListener,
    })

    const getFruits = observer('getFruits', {
        addListener: client.addEventListener,
        removeListener: client.removeEventListener,
        postMessage: server.postMessage
    })

    const nextCallback = vi.fn()
    const fruits = getFruits()
    const subscription = fruits.subscribe(nextCallback)
    await wait()

    fruitsObservable.send('One')
    await wait()

    fruitsObservable.send('Two')
    await wait()

    subscription.unsubscribe()
    fruitsObservable.send('Three')
    await wait()

    expect(nextCallback).toHaveBeenCalledTimes(2)
    expect(nextCallback).toHaveBeenNthCalledWith(1, 'One')
    expect(nextCallback).toHaveBeenNthCalledWith(2, 'Two')
})

test('should apply transformFn to observable data from remote', async () => {
    const [server, client] = fakeWindows()

    const fruitsObservable = new SendObservable()
    const fruitService = {
        getFruits: () => fruitsObservable
    }

    expose('getFruits', fruitService.getFruits, {
        addListener: server.addEventListener,
        removeListener: server.removeEventListener,
    })

    const getFruits = observer('getFruits', {
        transformFn: (x: any) => 'This is ' + x,
        addListener: client.addEventListener,
        removeListener: client.removeEventListener,
        postMessage: server.postMessage
    })

    const nextCallback = vi.fn()
    const fruits = getFruits()
    const subscription = fruits.subscribe(nextCallback)
    await wait()

    fruitsObservable.send('One')
    await wait()

    fruitsObservable.send('Two')
    await wait()

    expect(nextCallback).toHaveBeenCalledTimes(2)
    expect(nextCallback).toHaveBeenNthCalledWith(1, 'This is One')
    expect(nextCallback).toHaveBeenNthCalledWith(2, 'This is Two')
})

test('client should allow multiple subscriptions to observable and unsubscribe when last one closed', async () => {
    const [server, client] = fakeWindows()

    const fruitsObservable = new SendObservable()
    const fruitService = {
        getFruits: () => fruitsObservable
    }

    expose('getFruits', fruitService.getFruits, {
        addListener: server.addEventListener,
        removeListener: server.removeEventListener,
    })

    const getFruits = observer('getFruits', {
        addListener: client.addEventListener,
        removeListener: client.removeEventListener,
        postMessage: server.postMessage
    })

    const nextCallback1 = vi.fn()
    const nextCallback2 = vi.fn()
    const fruits = getFruits()

    const subscription1 = fruits.subscribe(nextCallback1)
    await wait()

    fruitsObservable.send('One')
    await wait()

    const subscription2 = fruits.subscribe(nextCallback2)
    await wait()

    fruitsObservable.send('Two')
    await wait()

    subscription1.unsubscribe()
    await wait()

    fruitsObservable.send('Three')
    await wait()

    subscription2.unsubscribe()
    await wait()

    fruitsObservable.send('Four')
    await wait()

    expect(nextCallback1).toHaveBeenCalledTimes(2)
    expect(nextCallback1).toHaveBeenNthCalledWith(1, 'One')
    expect(nextCallback1).toHaveBeenNthCalledWith(2, 'Two')

    expect(nextCallback2).toHaveBeenCalledTimes(2)
    expect(nextCallback2).toHaveBeenNthCalledWith(1, 'Two')
    expect(nextCallback2).toHaveBeenNthCalledWith(2, 'Three')

    expect(server.postMessagesReceived).toBe(2)
    expect(client.postMessagesReceived).toBe(3)
})

test('server should allow multiple calls to same observable function and keep them separate', async () => {
    const [server, client] = fakeWindows()

    const fruitsObservable1 = new SendObservable()
    const fruitsObservable2 = new SendObservable()
    const observables = [fruitsObservable1, fruitsObservable2]
    const fruitService = {
        getFruits: () => observables.shift()
    }

    expose('getFruits', fruitService.getFruits, {
        addListener: server.addEventListener,
        removeListener: server.removeEventListener,
    })

    const getFruits = observer('getFruits', {
        addListener: client.addEventListener,
        removeListener: client.removeEventListener,
        postMessage: server.postMessage
    })

    const nextCallback1 = vi.fn()
    const nextCallback2 = vi.fn()
    const fruits1 = getFruits(), fruits2 = getFruits()

    const subscription1 = fruits1.subscribe(nextCallback1)
    await wait()

    fruitsObservable1.send('Fruits1 Msg1')
    await wait()

    const subscription2 = fruits2.subscribe(nextCallback2)
    await wait()

    fruitsObservable2.send('Fruits2 Msg1')
    await wait()

    subscription1.unsubscribe()
    await wait()

    fruitsObservable1.send('Fruits1 Msg2')
    await wait()

    fruitsObservable2.send('Fruits2 Msg2')
    await wait()

    subscription2.unsubscribe()
    await wait()

    fruitsObservable1.send('Fruits1 Msg3')
    await wait()

    fruitsObservable2.send('Fruits2 Msg3')
    await wait()

    expect(nextCallback1).toHaveBeenCalledTimes(1)
    expect(nextCallback1).toHaveBeenNthCalledWith(1, 'Fruits1 Msg1')

    expect(nextCallback2).toHaveBeenCalledTimes(2)
    expect(nextCallback2).toHaveBeenNthCalledWith(1, 'Fruits2 Msg1')
    expect(nextCallback2).toHaveBeenNthCalledWith(2, 'Fruits2 Msg2')

    expect(server.postMessagesReceived).toBe(4)
    expect(client.postMessagesReceived).toBe(3)
})

test('server should remove all subscriptions to  multiple calls to same observable function when it is closed', async () => {
    const [server, client] = fakeWindows()

    const fruitsObservable1 = new SendObservable()
    const fruitsObservable2 = new SendObservable()
    const observables = [fruitsObservable1, fruitsObservable2]
    const fruitService = {
        getFruits: () => observables.shift()
    }

    const getFruitsExpose = expose('getFruits', fruitService.getFruits, {
        addListener: server.addEventListener,
        removeListener: server.removeEventListener,
    })

    const getFruits = observer('getFruits', {
        addListener: client.addEventListener,
        removeListener: client.removeEventListener,
        postMessage: server.postMessage
    })

    const nextCallback1 = vi.fn()
    const nextCallback2 = vi.fn()
    const fruits1 = getFruits(), fruits2 = getFruits()

    fruits1.subscribe(nextCallback1)
    await wait()

    fruitsObservable1.send('Fruits1 Msg1')
    await wait()

    fruits2.subscribe(nextCallback2)
    await wait()

    fruitsObservable2.send('Fruits2 Msg1')
    await wait()

    getFruitsExpose.close()

    fruitsObservable1.send('Fruits1 Msg2')
    await wait()

    fruitsObservable2.send('Fruits2 Msg2')
    await wait()

    expect(nextCallback1).toHaveBeenCalledTimes(1)
    expect(nextCallback1).toHaveBeenNthCalledWith(1, 'Fruits1 Msg1')

    expect(nextCallback2).toHaveBeenCalledTimes(1)
    expect(nextCallback2).toHaveBeenNthCalledWith(1, 'Fruits2 Msg1')

    expect(server.postMessagesReceived).toBe(2)
    expect(client.postMessagesReceived).toBe(2)
})

test('should ignore bad/irrelevant messages', async () => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: () => new Promise((resolve) => setTimeout(() => resolve(Fruits), 30))
  }

  expose('getFruits', fruitService.getFruits, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
  })

  const getFruits = caller('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: server.postMessage
  })

  const fruitPromise = getFruits()

  // Inbetween, lets send irrelevant messages that should be ignored
  server.postMessage({})
  server.postMessage({ sender: 'bogus' })
  server.postMessage({ id: 'wrong' })

  const fruits = await fruitPromise

  expect(fruits).toStrictEqual(Fruits)
})

test('should pass arguments', async () => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: (arg0: boolean, arg1: boolean) => arg0 && arg1
      ? Promise.resolve(Fruits)
      : Promise.reject(new Error('args not passed'))
  }

  expose('getFruits', fruitService.getFruits, {
    addListener: server.addEventListener,
    removeListener: server.removeEventListener,
  })

  const getFruits = caller('getFruits', {
    addListener: client.addEventListener,
    removeListener: client.removeEventListener,
    postMessage: server.postMessage
  })

  const fruits = await getFruits(true, true)

  expect(fruits).toStrictEqual(Fruits)
})

test('exposeFunctions exposes bound object functions and returns function to close them all', async () => {
    const [ server, client ] = fakeWindows()

    const fruitService = new class FruitService {
        private juice = 99
        GetFruits() { return Promise.resolve(Fruits)}
        GetJuice() { return Promise.resolve(this.juice)}
    }

    const closeFn = exposeFunctions('FruitService', fruitService, {
        addListener: server.addEventListener,
            removeListener: server.removeEventListener,
    })

    const getFruits = caller('FruitService.GetFruits', {
        addListener: client.addEventListener,
        removeListener: client.removeEventListener,
        postMessage: server.postMessage
    })

    const fruits = await getFruits()
    expect(fruits).toStrictEqual(Fruits)

    const getJuice = caller('FruitService.GetJuice', {
        addListener: client.addEventListener,
        removeListener: client.removeEventListener,
        postMessage: server.postMessage
    })

    const juice = await getJuice()
    expect(juice).toBe(99)

    closeFn()

    let juice2
    getJuice().then( j => juice2 = j)
    await wait(20)
    expect(juice2).toBeUndefined()
})
