import { caller } from '../../../src/editorToolApis/postmsgRpc/client'
import { expose } from '../../../src/editorToolApis/postmsgRpc/server'
import fakeWindows from './helpers/fake-windows'
import fs from 'fs'

const Fruits = JSON.parse(fs.readFileSync(__dirname + '/fixtures/fruits.json', 'utf8'))

test('should fetch data from remote', async () => {
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

test('should ignore bad/irrelevant messages', async () => {
  const [ server, client ] = fakeWindows()

  const fruitService = {
    getFruits: () => new Promise((resolve) => setTimeout(() => resolve(Fruits), 500))
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
