import ServerApp from '../../src/model/ServerApp'
import ServerFirebaseGenerator from '../../src/generator/ServerFirebaseGenerator'
import FunctionDef from '../../src/model/FunctionDef'
import {ex} from '../testutil/testHelpers'
import Project from '../../src/model/Project'

describe('generates files for multiple apps', () => {
    const plusFn = new FunctionDef('fn1', 'Plus', {input1: 'a', input2: 'b', calculation: ex`Sum(a, b)`})
    const multFn = new FunctionDef('fn2', 'Mult', {input1: 'c', input2: 'd', calculation: ex`c * d`})
    const app1 = new ServerApp('sa1', 'Server App 1', {}, [plusFn])
    const app2 = new ServerApp('sa2', 'Server App 2', {}, [multFn])
    const project = new Project('proj1', 'Server Project', {}, [app1, app2])
    const gen = new ServerFirebaseGenerator(project)
    const {files} = gen.output()
    const [serverApp1File, expressApp1File, serverApp2File, expressApp2File, functionFile, packageFile] = files

    test('app1 file', () => {
        expect(serverApp1File.name).toBe('ServerApp1.mjs')
        expect(serverApp1File.contents).toBe(`import {runtimeFunctions} from './serverRuntime.cjs'
import {globalFunctions} from './serverRuntime.cjs'

const {Sum} = globalFunctions

const ServerApp1 = (user) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }

async function Plus(a, b) {
    return Sum(a, b)
}

return {
    Plus: {func: Plus, update: false, argNames: ['a', 'b']}
}
}

export default ServerApp1`)
    })

    test('app2 file', () => {
        expect(serverApp2File.name).toBe('ServerApp2.mjs')
        expect(serverApp2File.contents).toBe(`import {runtimeFunctions} from './serverRuntime.cjs'

const ServerApp2 = (user) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }

async function Mult(c, d) {
    return c * d
}

return {
    Mult: {func: Mult, update: false, argNames: ['c', 'd']}
}
}

export default ServerApp2`)
    })

    test('express app files', () => {
        expect(expressApp1File.name).toBe('ServerApp1Express.js')
        expect(expressApp1File.contents).toBe(`import {expressApp} from './serverRuntime.cjs'
import baseAppFactory from './ServerApp1.mjs'

const app = expressApp(baseAppFactory)

export default app`)
        expect(expressApp2File.name).toBe('ServerApp2Express.js')
        expect(expressApp2File.contents).toBe(`import {expressApp} from './serverRuntime.cjs'
import baseAppFactory from './ServerApp2.mjs'

const app = expressApp(baseAppFactory)

export default app`)
    })

    test('function file', () => {
        expect(functionFile.name).toBe('index.js')
        expect(functionFile.contents).toBe(`import {onRequest} from 'firebase-functions/v2/https'
import ServerApp1Express from './ServerApp1Express.js'
import ServerApp2Express from './ServerApp2Express.js'

export const serverapp1 = onRequest(ServerApp1Express)
export const serverapp2 = onRequest(ServerApp2Express)`)
    })

    test('package json file', () => {
        expect(packageFile.name).toBe('package.json')
        expect(packageFile.contents).toBe(`{
  "type": "module",
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.1",
    "firebase-functions": "^3.23.0",
    "firebase-admin": "^11.0.1"
  },
  "private": true
}`)

    })

})

test('combines errors from multiple apps', () => {
    const syntaxErrorFn = new FunctionDef('fn1', 'SayHello', {input1: 'id', calculation: ex`Log('Hello ', id`})
    const unknownNameErrorFn = new FunctionDef('fn2', 'SayWhat', {calculation: ex`Log('Hello ', whoAreYou)`, private: true})

    const app1 = new ServerApp('sa1', 'Server App 1', {}, [syntaxErrorFn])
    const app2 = new ServerApp('sa2', 'Server App 2', {}, [unknownNameErrorFn])
    const project = new Project('proj1', 'Server Project', {}, [app1, app2])
    const gen = new ServerFirebaseGenerator(project)
    expect(gen.output().errors).toStrictEqual({
        fn1: {
            calculation: "Error: Line 1: Unexpected end of input",
        },
        fn2: {
            calculation: "Unknown names: whoAreYou"
        },
    })
})

