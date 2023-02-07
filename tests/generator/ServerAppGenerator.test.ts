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
    const privateFn = new FunctionDef('fn4', 'HideMe', {input1: 'where', calculation: ex`where + ' - there'`, private: true})
    const app = new ServerApp('sa1', 'Server App 1', {}, [
        plusFn, multFn, totalFn, privateFn
    ])
    const gen = new ServerAppGenerator(app)
    const {files} = gen.output()
    const [serverAppFile, expressAppFile, functionFile, packageFile] = files

    test('app file', () => {
        expect(serverAppFile.name).toBe('ServerApp1.js')
        expect(serverAppFile.content).toBe(`import {runtimeFunctions} from './serverRuntime.js'
import {globalFunctions} from './serverRuntime.js'

const {Sum} = globalFunctions

const ServerApp1 = (user) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }

async function Plus(a, b) {
    return Sum(a, b)
}

async function Mult(c, d) {
    return c * d
}

async function Total(x, y, z) {
    return await Mult(y, await Plus(x, z))
}

async function HideMe(where) {
    return where + ' - there'
}

return {
    Plus: Plus,
    Mult: Mult,
    Total: Total
}
}

export default ServerApp1`)
    })

    test('express app file', () => {
        expect(expressAppFile.name).toBe('ServerApp1Express.js')
        expect(expressAppFile.content).toBe(`import express from 'express'
import {expressUtils} from './serverRuntime.js'
import baseApp from './ServerApp1.js'

const {checkUser, handlerApp, requestHandler, errorHandler} = expressUtils

const app = express()

app.use(checkUser)
app.use(handlerApp(baseApp))
app.use(express.json())

app.get('/serverapp1/Plus', requestHandler('a', 'b'))
app.get('/serverapp1/Mult', requestHandler('c', 'd'))
app.get('/serverapp1/Total', requestHandler('x', 'y', 'z'))

app.use(errorHandler)

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
  "engines": {
    "node": "16"
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

describe('generates files using data components in dependency order', () => {
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
        expect(serverAppFile.content).toBe(`import {runtimeFunctions} from './serverRuntime.js'
import {appFunctions} from './serverRuntime.js'
import {components} from './serverRuntime.js'

const {Get, Update} = appFunctions
const {Collection, FirestoreDataStore} = components

const DataStore1 = new FirestoreDataStore({collections: 'Widgets,Sprockets'})
const Sprockets = new Collection({dataStore: DataStore1, collectionName: 'Sprockets'})
const Widgets = new Collection({dataStore: DataStore1, collectionName: 'Widgets'})

const WidgetApp = (user) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }

async function GetWidget(id) {
    return await Get(Widgets, id)
}

async function UpdateWidget(id, changes) {
    await Update(Widgets, id, changes)
}

async function GetSprocket(id) {
    return await Get(Sprockets, id)
}

return {
    GetWidget: GetWidget,
    UpdateWidget: UpdateWidget,
    GetSprocket: GetSprocket
}
}

export default WidgetApp`)
    })

    test('express app file', () => {
        expect(expressAppFile.name).toBe('WidgetAppExpress.js')
        expect(expressAppFile.content).toBe(`import express from 'express'
import {expressUtils} from './serverRuntime.js'
import baseApp from './WidgetApp.js'

const {checkUser, handlerApp, requestHandler, errorHandler} = expressUtils

const app = express()

app.use(checkUser)
app.use(handlerApp(baseApp))
app.use(express.json())

app.get('/widgetapp/GetWidget', requestHandler('id'))
app.post('/widgetapp/UpdateWidget', requestHandler('id', 'changes'))
app.get('/widgetapp/GetSprocket', requestHandler('id'))

app.use(errorHandler)

export default app`)
    })

})

describe('handles errors and special cases', () => {
    const emptyFn = new FunctionDef('fn0', 'SayNothing', {input1: 'id', calculation: undefined, private: true})
    const syntaxErrorFn = new FunctionDef('fn1', 'SayHello', {input1: 'id', calculation: ex`Log('Hello ', id`})
    const unknownNameErrorFn = new FunctionDef('fn2', 'SayWhat', {calculation: ex`Log('Hello ', whoAreYou)`, private: true})
    const statementErrorFn = new FunctionDef('fn3', 'StateThis', {calculation: ex`while (true) Log(10)`, private: true})
    const returnErrorFn = new FunctionDef('fn4', 'ReturnIt', {calculation: ex`return 42`, private: true})
    const selectFunction = new FunctionDef('fn103', 'SelectStuff', {input1: 'min', calculation: ex`Select(Widgets.getAllData(), \$item.height > min)`})
    const multipleStatementAction = new FunctionDef('fn105', 'DoItAll', {input1: 'when', action: true, calculation: ex`while (true) Log(10); let answer = 42
                Log(answer)`, private: true})
    const assignmentFunction = new FunctionDef('fn106', 'AssignmentsToEquals', {input1: 'foo', action: true, calculation: ex`let a = If(true, 10, Sum(Log= 12, 3, 4))
    let b = If(foo.value = 42, 10, 20)
    Sum = 1`})
    const propertyShorthandFn = new FunctionDef('fn107', 'PropShorthand', {calculation: ex`{a: 10, xxx}`, private: true})
    const unexpectedNumberFn = new FunctionDef('fn108', 'UnexpectedNumber', {calculation: ex`If(Sum(1)    1, Log(10), Log(20))`, private: true})
    // const updateWidgetFn = new FunctionDef('fn2', 'UpdateWidget', {input1: 'id', input2: 'changes', action: true, calculation: ex`Update(Widgets, id, changes)`})
    // const getSprocketFn = new FunctionDef('fn3', 'GetSprocket', {input1: 'id', calculation: ex`Get(Sprockets, id)`})
    // const sprocketCollection = new Collection('coll1', 'Sprockets', {dataStore: ex`DataStore1`, collectionName: 'Sprockets'})
    const widgetCollection = new Collection('coll2', 'Widgets', {dataStore: ex`DataStore1`, collectionName: 'Widgets'})
    const dataStore = new FirestoreDataStore('ds1', 'DataStore1', {collections: 'Widgets'})
    const app = new ServerApp('sa1', 'Widget App', {}, [
        emptyFn, syntaxErrorFn, unknownNameErrorFn,statementErrorFn, returnErrorFn,
        selectFunction, multipleStatementAction, assignmentFunction, propertyShorthandFn, unexpectedNumberFn,
        widgetCollection, dataStore
    ])
    const gen = new ServerAppGenerator(app)
    const {files} = gen.output()
    const [serverAppFile] = files

    test('app file', () => {
        expect(serverAppFile.name).toBe('WidgetApp.js')
        expect(serverAppFile.content).toBe(`import {runtimeFunctions} from './serverRuntime.js'
import {globalFunctions} from './serverRuntime.js'
import {components} from './serverRuntime.js'

const {Log, Select, If, Sum} = globalFunctions
const {Collection, FirestoreDataStore} = components

const DataStore1 = new FirestoreDataStore({collections: 'Widgets'})
const Widgets = new Collection({dataStore: DataStore1, collectionName: 'Widgets'})

const WidgetApp = (user) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }

async function SayNothing(id) {
    return undefined
}

async function SayHello(id) {
    return runtimeFunctions.codeGenerationError(\`Log('Hello ', id\`, 'Error: Line 1: Unexpected end of input')
}

async function SayWhat() {
    return runtimeFunctions.codeGenerationError(\`Log('Hello ', whoAreYou)\`, 'Unknown names: whoAreYou')
}

async function StateThis() {
    return runtimeFunctions.codeGenerationError(\`while (true) Log(10)\`, 'Error: Invalid expression')
}

async function ReturnIt() {
    return runtimeFunctions.codeGenerationError(\`return 42\`, 'Error: Invalid expression')
}

async function SelectStuff(min) {
    return Select(await Widgets.getAllData(), \$item => \$item.height > min)
}

async function DoItAll(when) {
    while (true) Log(10); let answer = 42
                Log(answer)
}

async function AssignmentsToEquals(foo) {
    let a = If(true, 10, Sum(Log == 12, 3, 4))
    let b = If(foo.value == 42, 10, 20)
    Sum == 1
}

async function PropShorthand() {
    return ({a: 10, xxx: undefined})
}

async function UnexpectedNumber() {
    return runtimeFunctions.codeGenerationError(\`If(Sum(1)    1, Log(10), Log(20))\`, 'Error: Unexpected token 1')
}

return {
    SayHello: SayHello,
    SelectStuff: SelectStuff,
    AssignmentsToEquals: AssignmentsToEquals
}
}

export default WidgetApp`)
    })

    expect(gen.output().errors).toStrictEqual({
        fn1: {
            calculation: "Error: Line 1: Unexpected end of input",
        },
        fn107: {
            calculation: 'Incomplete item: xxx'
        },
        fn108: {
            calculation: 'Error: Unexpected token 1'
        },
        fn2: {
            calculation: "Unknown names: whoAreYou"
        },
        fn3: {
            calculation: "Error: Invalid expression"
        },
        fn4: {
            calculation: "Error: Invalid expression"
        }
    })
})
