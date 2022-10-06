import ServerApp from '../../src/model/ServerApp'
import ServerAppGenerator from '../../src/generator/ServerAppGenerator'
import FunctionDef from '../../src/model/FunctionDef'
import {ex} from '../testutil/testHelpers'
import Collection from '../../src/model/Collection'
import FirestoreDataStore from '../../src/model/FirestoreDataStore'

describe('generates files', () => {
    const plusFn = new FunctionDef('fn1', 'Plus', {input1: 'a', input2: 'b', calculation: ex`Sum(a, b)`})
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
        expect(serverAppFile.content).toBe(`import {globalFunctions} from './serverRuntime.js'

const {Sum} = globalFunctions

async function Plus(a, b) {
    return Sum(a, b)
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
import {expressUtils} from './serverRuntime.js'
import baseApp from './ServerApp1.js'

const {checkUser, parseQueryParams} = expressUtils

const app = express()

app.use(checkUser)
app.use(express.json())

app.get('/serverapp1/Plus', async (req, res, next) => {
    const {a, b} = parseQueryParams(req)
    try {
        res.json(await baseApp.Plus(a, b))
    } catch(err) { next(err) }
})

app.get('/serverapp1/Mult', async (req, res, next) => {
    const {c, d} = parseQueryParams(req)
    try {
        res.json(await baseApp.Mult(c, d))
    } catch(err) { next(err) }
})

app.get('/serverapp1/Total', async (req, res, next) => {
    const {x, y, z} = parseQueryParams(req)
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
      "firebase-functions": "^3.23.0",
      "firebase-admin": "^11.0.1"
    }
}`)

    })

})

describe('generates files using data components', () => {
    const getWidgetFn = new FunctionDef('fn1', 'Get Widget', {input1: 'id', calculation: ex`Get(Widgets, id)`})
    const updateWidgetFn = new FunctionDef('fn2', 'UpdateWidget', {input1: 'id', input2: 'changes', action: true, calculation: ex`Update(Widgets, id, changes)`})
    const getSprocketFn = new FunctionDef('fn3', 'GetSprocket', {input1: 'id', calculation: ex`Get(Sprockets, id)`})
    const sprocketCollection = new Collection('coll1', 'Sprockets', {dataStore: ex`DataStore1`, collectionName: 'Sprockets'})
    const widgetCollection = new Collection('coll2', 'Widgets', {dataStore: ex`DataStore1`, collectionName: 'Widgets'})
    const dataStore = new FirestoreDataStore('ds1', 'DataStore1', {collections: 'Widgets,Sprockets'})
    const app = new ServerApp('sa1', 'Widget App', {}, [
        getWidgetFn, updateWidgetFn, getSprocketFn,
        sprocketCollection, widgetCollection, dataStore
    ])
    const gen = new ServerAppGenerator(app)
    const {files} = gen.output()
    const [serverAppFile, expressAppFile] = files

    test('app file', () => {
        expect(serverAppFile.name).toBe('WidgetApp.js')
        expect(serverAppFile.content).toBe(`import {appFunctions} from './serverRuntime.js'
import {components} from './serverRuntime.js'

const {Get, Update} = appFunctions
const {Collection, FirestoreDataStore} = components

const DataStore1 = new FirestoreDataStore({collections: 'Widgets,Sprockets'})
const Sprockets = new Collection({dataStore: DataStore1, collectionName: 'Sprockets'})
const Widgets = new Collection({dataStore: DataStore1, collectionName: 'Widgets'})

async function GetWidget(id) {
    return await Get(Widgets, id)
}

async function UpdateWidget(id, changes) {
    return await Update(Widgets, id, changes)
}

async function GetSprocket(id) {
    return await Get(Sprockets, id)
}

const WidgetApp = {
    GetWidget: GetWidget,
    UpdateWidget: UpdateWidget,
    GetSprocket: GetSprocket
}

export default WidgetApp`)
    })

    test('express app file', () => {
        expect(expressAppFile.name).toBe('WidgetAppExpress.js')
        expect(expressAppFile.content).toBe(`import express from 'express'
import {expressUtils} from './serverRuntime.js'
import baseApp from './WidgetApp.js'

const {checkUser, parseQueryParams} = expressUtils

const app = express()

app.use(checkUser)
app.use(express.json())

app.get('/widgetapp/GetWidget', async (req, res, next) => {
    const {id} = parseQueryParams(req)
    try {
        res.json(await baseApp.GetWidget(id))
    } catch(err) { next(err) }
})

app.post('/widgetapp/UpdateWidget', async (req, res, next) => {
    const {id, changes} = req.body
    try {
        res.json(await baseApp.UpdateWidget(id, changes))
    } catch(err) { next(err) }
})

app.get('/widgetapp/GetSprocket', async (req, res, next) => {
    const {id} = parseQueryParams(req)
    try {
        res.json(await baseApp.GetSprocket(id))
    } catch(err) { next(err) }
})

export default app`)
    })

})