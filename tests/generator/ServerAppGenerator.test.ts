import ServerApp from '../../src/model/ServerApp'
import ServerAppGenerator from '../../src/generator/ServerAppGenerator'
import FunctionDef from '../../src/model/FunctionDef'
import {ex} from '../testutil/testHelpers'

describe('generates files', () => {
    const plusFn = new FunctionDef('fn1', 'Plus', {input1: 'a', input2: 'b', calculation: ex`a + b`})
    const multFn = new FunctionDef('fn2', 'Mult', {input1: 'c', input2: 'd', calculation: ex`c * d`})
    const totalFn = new FunctionDef('fn3', 'Total', {input1: 'x', input2: 'y', input3: 'z', calculation: ex`Mult(y, Plus(x, z))`})
    const app = new ServerApp('sa1', 'Server App 1', {}, [
        plusFn, multFn, totalFn
    ])
    const gen = new ServerAppGenerator(app)
    const {files} = gen.output()
    const [serverAppFile, expressAppFile, functionFile, packageFile] = files

    test('app file', () => {
        expect(serverAppFile.name).toBe('ServerApp1.js')
        expect(serverAppFile.content).toBe(`async function Plus(a, b) {
    return a + b
}

async function Mult(c, d) {
    return c * d
}

async function Total(x, y, z) {
    return await Mult(y, await Plus(x, z))
}

const ServerApp1 = {
    Plus: Plus,
    Mult: Mult,
    Total: Total
}

export default ServerApp1`)
    })

    test('express app file', () => {
        expect(expressAppFile.name).toBe('ServerApp1Express.js')
        expect(expressAppFile.content).toBe(`import express from 'express'
import baseApp from './ServerApp1.js'

const app = express()

app.use( (req, res, next) => {
    console.log(req.method, req.url)
    next()
})

app.get('/serverapp1/Plus', async (req, res, next) => {
    const {a, b} = req.query
    try {
        res.json(await baseApp.Plus(a, b))
    } catch(err) { next(err) }
})

app.get('/serverapp1/Mult', async (req, res, next) => {
    const {c, d} = req.query
    try {
        res.json(await baseApp.Mult(c, d))
    } catch(err) { next(err) }
})

app.get('/serverapp1/Total', async (req, res, next) => {
    const {x, y, z} = req.query
    try {
        res.json(await baseApp.Total(x, y, z))
    } catch(err) { next(err) }
})

export default app`)
    })

    test('function file', () => {
        expect(functionFile.name).toBe('index.js')
        expect(functionFile.content).toBe(`import {onRequest} from 'firebase-functions/v2/https'
import app from './ServerApp1Express.js'

export const serverapp1 = onRequest(app)`)
    })

    test('package json file', () => {
        expect(packageFile.name).toBe('package.json')
        expect(packageFile.content).toBe(`{
    "type": "module",
    "dependencies": {
      "express": "^4.18.1",
      "firebase-functions": "^3.23.0"
    }
}`)

    })

})
