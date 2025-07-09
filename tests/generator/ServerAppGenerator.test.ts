import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import ServerApp from '../../src/model/ServerApp'
import ServerAppGenerator from '../../src/generator/ServerAppGenerator'
import FunctionDef from '../../src/model/FunctionDef'
import {ex} from '../testutil/testHelpers'
import Collection from '../../src/model/Collection'
import TextType from '../../src/model/types/TextType'
import NumberType from '../../src/model/types/NumberType'
import DataTypes from '../../src/model/types/DataTypes'
import Project1 from '../../src/model/Project'
import Project2 from '../../src/model/Project'
import Project3 from '../../src/model/Project'
import CloudflareDataStore from '../../src/model/CloudflareDataStore'

describe('generates files for app and exposes public functions and includes data types', () => {
    const name = new TextType('tt1', 'Name', {required: true, maxLength: 20})
    const itemAmount = new NumberType('nt1', 'Item Amount', {max: 10})
    const dataTypes1 = new DataTypes('dt1', 'Types 1', {}, [name])
    const dataTypes2 = new DataTypes('dt2', 'Types 2', {}, [itemAmount])
    const plusFn = new FunctionDef('fn1', 'Plus', {input1: 'a', input2: 'b', calculation: ex`Sum(a, b)`})
    const timesFn = new FunctionDef('fn2', 'Times', {input1: 'c', input2: 'd', calculation: ex`c * d`})
    const totalFn = new FunctionDef('fn3', 'Total', {input1: 'x', input2: 'y', input3: 'z', calculation: ex`Times(y, Plus(x, z))`})
    const privateFn = new FunctionDef('fn4', 'HideMe', {input1: 'where', calculation: ex`where + ' - there'`, private: true})
    const app = new ServerApp('sa1', 'Server App 1', {updateTime: new Date()}, [
        plusFn, timesFn, totalFn, privateFn
    ])
    const project = Project3.new([dataTypes1, dataTypes2, app], 'Project 1', 'proj1', {})
    const gen = new ServerAppGenerator(app, project)
    const {files} = gen.output()
    const [serverAppFile] = files


    test('generates only app file', () => {
        expect(files.length).toBe(1)
    })

    test('app file', () => {
        expect(serverAppFile.name).toBe('ServerApp1.mjs')
        expect(serverAppFile.contents).toBe(`import * as serverRuntime from './serverRuntime.mjs'
const {runtimeFunctions} = serverRuntime
const {globalFunctions} = serverRuntime
const {types} = serverRuntime

const {Sum} = globalFunctions
const {ChoiceType, DateType, ListType, NumberType, DecimalType, RecordType, TextType, TrueFalseType, Rule} = types

// Types1.js
const Types1 = (() => {

    const Name = new TextType('Name', {required: true, maxLength: 20})

    return {
        Name
    }
})()

// Types2.js
const Types2 = (() => {

    const ItemAmount = new NumberType('Item Amount', {required: false, max: 10})

    return {
        ItemAmount
    }
})()


const ServerApp1 = (user, env, ctx) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }


async function Plus(a, b) {
    return Sum(a, b)
}

async function Times(c, d) {
    return c * d
}

async function Total(x, y, z) {
    return await Times(y, await Plus(x, z))
}

async function HideMe(where) {
    return where + ' - there'
}

return {
    Plus: {func: Plus, update: false, argNames: ['a', 'b']},
    Times: {func: Times, update: false, argNames: ['c', 'd']},
    Total: {func: Total, update: false, argNames: ['x', 'y', 'z']}
}
}

export default ServerApp1`)
    })

})

describe('generates files using data components in dependency order', () => {
    const getWidgetFn = new FunctionDef('fn1', 'Get Widget', {input1: 'id', calculation: ex`Get(Widgets, id)`})
    const updateWidgetFn = new FunctionDef('fn2', 'UpdateWidget', {input1: 'id', input2: 'changes', action: true, calculation: ex`Update(Widgets, id, changes)`})
    const getSprocketFn = new FunctionDef('fn3', 'GetSprocket', {input1: 'id', calculation: ex`Get(Sprockets, id)`})
    const sprocketCollection = new Collection('coll1', 'Sprockets', {dataStore: ex`DataStore1`, collectionName: 'Sprockets'})
    const widgetCollection = new Collection('coll2', 'Widgets', {dataStore: ex`DataStore1`, collectionName: 'Widgets'})
    const dataStore = new CloudflareDataStore('ds1', 'DataStore1', {collections: 'Widgets,Sprockets'})
    const app = new ServerApp('sa1', 'Widget App', {updateTime: new Date()}, [
        getWidgetFn, updateWidgetFn, getSprocketFn,
        sprocketCollection, widgetCollection, dataStore
    ])
    const project = Project2.new([app], 'Project 1', 'proj1', {})

    const gen = new ServerAppGenerator(app, project)
    const {files} = gen.output()
    const [serverAppFile] = files

    test('app file', () => {
        expect(serverAppFile.name).toBe('WidgetApp.mjs')
        expect(serverAppFile.contents).toBe(`import * as serverRuntime from './serverRuntime.mjs'
const {runtimeFunctions} = serverRuntime
const {appFunctions} = serverRuntime
const {components} = serverRuntime

const {Get, Update} = appFunctions
const {Collection, CloudflareDataStore} = components

const WidgetApp = (user, env, ctx) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }

const DataStore1 = new CloudflareDataStore({collections: "Widgets,Sprockets", database: env.DataStore1})
const Sprockets = new Collection({dataStore: DataStore1, collectionName: 'Sprockets'})
const Widgets = new Collection({dataStore: DataStore1, collectionName: 'Widgets'})
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
    GetWidget: {func: GetWidget, update: false, argNames: ['id']},
    UpdateWidget: {func: UpdateWidget, update: true, argNames: ['id', 'changes']},
    GetSprocket: {func: GetSprocket, update: false, argNames: ['id']}
}
}

export default WidgetApp`)
    })


})

describe('handles errors and special cases', () => {
    const emptyFn = new FunctionDef('fn0', 'SayNothing', {input1: 'id', calculation: undefined, private: true})
    const syntaxErrorFn = new FunctionDef('fn1', 'SayHello', {input1: 'id', calculation: ex`Log('Hello ', id`})
    const unknownNameErrorFn = new FunctionDef('fn2', 'SayWhat', {calculation: ex`Log('Hello ', whoAreYou)`, private: true})
    const statementErrorFn = new FunctionDef('fn3', 'StateThis', {calculation: ex`while (true) Log(10)`, private: true})
    const returnErrorFn = new FunctionDef('fn4', 'ReturnIt', {calculation: ex`return 42`, private: true})
    const selectFunction = new FunctionDef('fn103', 'SelectStuff', {input1: 'min', calculation: ex`Select(Widgets.getAllData(), \$item.height > min)`})
    const ifFunction = new FunctionDef('fn103a', 'IfSomething', {input1: 'min', calculation: ex`If(min > 0, 1, Sum(min, 10))`})
    const multipleStatementQuery = new FunctionDef('fn104', 'Subtract5', {input1: 'when', calculation: ex`Check(when > 10, 'Must be at least 10')\nwhen - 5`})
    const multipleStatementAction = new FunctionDef('fn105', 'DoItAll', {input1: 'when', action: true, calculation: ex`while (true) Log(10); let answer = 42
                Log(answer)`, private: true})
    const assignmentFunction = new FunctionDef('fn106', 'AssignmentsToEquals', {input1: 'foo', action: true, calculation: ex`let a = If(true, 10, Sum(Log= 12, 3, 4))
let b = If(foo.value = 42, 10, 20)
Sum = 1`})
    const propertyShorthandFn = new FunctionDef('fn107', 'PropShorthand', {calculation: ex`{a: 10, xxx}`, private: true})
    const unexpectedNumberFn = new FunctionDef('fn108', 'UnexpectedNumber', {calculation: ex`If(Sum(1)    1, Log(10), Log(20))`, private: true})
    const widgetCollection = new Collection('coll2', 'Widgets', {dataStore: ex`DataStore1`, collectionName: 'Widgets'})
    const dataStore = new CloudflareDataStore('ds1', 'DataStore1', {collections: 'Widgets'})
    const app = new ServerApp('sa1', 'Widget App', {updateTime: new Date()}, [
        emptyFn, syntaxErrorFn, unknownNameErrorFn,statementErrorFn, returnErrorFn,
        selectFunction, ifFunction, multipleStatementQuery, multipleStatementAction, assignmentFunction, propertyShorthandFn, unexpectedNumberFn,
        widgetCollection, dataStore
    ])
    const project = Project1.new([app], 'Project 1', 'proj1', {})

    const gen = new ServerAppGenerator(app, project)
    const {files} = gen.output()
    const [serverAppFile] = files

    test('app file', () => {
        expect(serverAppFile.name).toBe('WidgetApp.mjs')
        expect(serverAppFile.contents).toBe(`import * as serverRuntime from './serverRuntime.mjs'
const {runtimeFunctions} = serverRuntime
const {globalFunctions} = serverRuntime
const {components} = serverRuntime

const {Log, Select, If, Sum, Check} = globalFunctions
const {Collection, CloudflareDataStore} = components

const WidgetApp = (user, env, ctx) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }

const DataStore1 = new CloudflareDataStore({collections: "Widgets", database: env.DataStore1})
const Widgets = new Collection({dataStore: DataStore1, collectionName: 'Widgets'})
async function SayNothing(id) {
    return undefined
}

async function SayHello(id) {
    return runtimeFunctions.codeGenerationError(\`Log('Hello ', id\`, 'Error: Unexpected character(s) (Line 1 Position 16)')
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
    return Select(await Widgets.getAllData(), ($item, $index) => $item.height > min)
}

async function IfSomething(min) {
    return await If(min > 0, 1, () => Sum(min, 10))
}

async function Subtract5(when) {
    Check(when > 10, 'Must be at least 10')
    return when - 5
}

async function DoItAll(when) {
    while (true) Log(10); let answer = 42
                    Log(answer)
}

async function AssignmentsToEquals(foo) {
    let a = await If(true, 10, () => Sum(Log == 12, 3, 4))
    let b = await If(foo.value == 42, 10, 20)
    Sum == 1
}

async function PropShorthand() {
    return {a: 10, xxx: undefined}
}

async function UnexpectedNumber() {
    return runtimeFunctions.codeGenerationError(\`If(Sum(1)    1, Log(10), Log(20))\`, 'Error: Unexpected character(s) (Line 1 Position 13)')
}

return {
    SayHello: {func: SayHello, update: false, argNames: ['id']},
    SelectStuff: {func: SelectStuff, update: false, argNames: ['min']},
    IfSomething: {func: IfSomething, update: false, argNames: ['min']},
    Subtract5: {func: Subtract5, update: false, argNames: ['when']},
    AssignmentsToEquals: {func: AssignmentsToEquals, update: true, argNames: ['foo']}
}
}

export default WidgetApp`)
    })

    expect(gen.output().errors).toStrictEqual({
        fn1: {
            calculation: "Error: Unexpected character(s) (Line 1 Position 16)",
        },
        fn107: {
            calculation: 'Incomplete item: xxx'
        },
        fn108: {
            calculation: 'Error: Unexpected character(s) (Line 1 Position 13)'
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

test('generates javascript functions', () => {
    const javascriptCode =
        `let y = 10
for (let i = 1; i < 10; i++) {
    y += Sum(widget, 10)
}
return y
`
    const javascriptActionCode =
        `let y = 10
for (let i = 1; i < y; i++) {
    Update(Things, i, {a: i})
}
`
    const javaScriptFn = new FunctionDef('fn1', 'DoSum', {input1: 'widget', calculation: {expr: javascriptCode}, javascript: true})
    const javaScriptActionFn = new FunctionDef('fn2', 'DoUpdate', {input1: 'widget', calculation: {expr: javascriptActionCode}, action: true, javascript: true})
    const thingsCollection = new Collection('coll2', 'Things', {})

    const app = new ServerApp('sa1', 'Widget App', {updateTime: new Date()}, [javaScriptFn, javaScriptActionFn, thingsCollection])
    const project = Project1.new([app], 'Project 1', 'proj1', {})

    const gen = new ServerAppGenerator(app, project)
    const {files} = gen.output()
    const [serverAppFile] = files

    expect(serverAppFile.contents).toBe(`import * as serverRuntime from './serverRuntime.mjs'
const {runtimeFunctions} = serverRuntime
const {globalFunctions} = serverRuntime
const {appFunctions} = serverRuntime
const {components} = serverRuntime

const {Sum} = globalFunctions
const {Update} = appFunctions
const {Collection} = components

const WidgetApp = (user, env, ctx) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }

const Things = new Collection({collectionName: 'Things'})
async function DoSum(widget) {
    let y = 10
    for (let i = 1; i < 10; i++) {
        y += Sum(widget, 10)
    }
    return y
}

async function DoUpdate(widget) {
    let y = 10
    for (let i = 1; i < y; i++) {
        Update(Things, i, {a: i})
    }
}

return {
    DoSum: {func: DoSum, update: false, argNames: ['widget']},
    DoUpdate: {func: DoUpdate, update: true, argNames: ['widget']}
}
}

export default WidgetApp`)

})
