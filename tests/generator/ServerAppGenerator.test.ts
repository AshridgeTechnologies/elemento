import ServerApp from '../../src/model/ServerApp'
import ServerAppGenerator from '../../src/generator/ServerAppGenerator'
import FunctionDef from '../../src/model/FunctionDef'
import {ex} from '../testutil/testHelpers'
import Collection from '../../src/model/Collection'
import FirestoreDataStore from '../../src/model/FirestoreDataStore'
import TextType from '../../src/model/types/TextType'
import NumberType from '../../src/model/types/NumberType'
import DataTypes from '../../src/model/types/DataTypes'
import Project from '../../src/model/Project'

describe('generates files for app and exposes public functions and includes data types', () => {
    const name = new TextType('tt1', 'Name', {required: true, maxLength: 20})
    const itemAmount = new NumberType('nt1', 'Item Amount', {max: 10})
    const dataTypes1 = new DataTypes('dt1', 'Types 1', {}, [name])
    const dataTypes2 = new DataTypes('dt2', 'Types 2', {}, [itemAmount])
    const plusFn = new FunctionDef('fn1', 'Plus', {input1: 'a', input2: 'b', calculation: ex`Sum(a, b)`})
    const timesFn = new FunctionDef('fn2', 'Times', {input1: 'c', input2: 'd', calculation: ex`c * d`})
    const totalFn = new FunctionDef('fn3', 'Total', {input1: 'x', input2: 'y', input3: 'z', calculation: ex`Times(y, Plus(x, z))`})
    const privateFn = new FunctionDef('fn4', 'HideMe', {input1: 'where', calculation: ex`where + ' - there'`, private: true})
    const app = new ServerApp('sa1', 'Server App 1', {}, [
        plusFn, timesFn, totalFn, privateFn
    ])
    const project = new Project('proj1', 'Project 1', {}, [dataTypes1, dataTypes2, app])
    const gen = new ServerAppGenerator(app, project)
    const {files} = gen.output()
    const [serverAppFile, expressAppFile] = files


    test('generates only app and express file', () => {
        expect(files.length).toBe(2)
    })

    test('app file', () => {
        expect(serverAppFile.name).toBe('ServerApp1.mjs')
        expect(serverAppFile.contents).toBe(`import {runtimeFunctions} from './serverRuntime.cjs'
import {globalFunctions} from './serverRuntime.cjs'
import {types} from './serverRuntime.cjs'

const {Sum} = globalFunctions
const {ChoiceType, DateType, ListType, NumberType, DecimalType, RecordType, TextType, TrueFalseType, Rule} = types

// Types1.js
const Name = new TextType('Name', {required: true, maxLength: 20})

const Types1 = {
    Name
}

// Types2.js
const ItemAmount = new NumberType('Item Amount', {required: false, max: 10})

const Types2 = {
    ItemAmount
}


const ServerApp1 = (user) => {

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

    test('express app file', () => {
        expect(expressAppFile.name).toBe('ServerApp1Express.js')
        expect(expressAppFile.contents).toBe(`import {expressApp} from './serverRuntime.cjs'
import baseAppFactory from './ServerApp1.mjs'

const app = expressApp(baseAppFactory)

export default app`)
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
    const project = new Project('proj1', 'Project 1', {}, [app])

    const gen = new ServerAppGenerator(app, project)
    const {files} = gen.output()
    const [serverAppFile, expressAppFile] = files

    test('app file', () => {
        expect(serverAppFile.name).toBe('WidgetApp.mjs')
        expect(serverAppFile.contents).toBe(`import {runtimeFunctions} from './serverRuntime.cjs'
import {appFunctions} from './serverRuntime.cjs'
import {components} from './serverRuntime.cjs'

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
    GetWidget: {func: GetWidget, update: false, argNames: ['id']},
    UpdateWidget: {func: UpdateWidget, update: true, argNames: ['id', 'changes']},
    GetSprocket: {func: GetSprocket, update: false, argNames: ['id']}
}
}

export default WidgetApp`)
    })

    test('express app file', () => {
        expect(expressAppFile.name).toBe('WidgetAppExpress.js')
        expect(expressAppFile.contents).toBe(`import {expressApp} from './serverRuntime.cjs'
import baseAppFactory from './WidgetApp.mjs'

const app = expressApp(baseAppFactory)

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
    const widgetCollection = new Collection('coll2', 'Widgets', {dataStore: ex`DataStore1`, collectionName: 'Widgets'})
    const dataStore = new FirestoreDataStore('ds1', 'DataStore1', {collections: 'Widgets'})
    const app = new ServerApp('sa1', 'Widget App', {}, [
        emptyFn, syntaxErrorFn, unknownNameErrorFn,statementErrorFn, returnErrorFn,
        selectFunction, multipleStatementAction, assignmentFunction, propertyShorthandFn, unexpectedNumberFn,
        widgetCollection, dataStore
    ])
    const project = new Project('proj1', 'Project 1', {}, [app])

    const gen = new ServerAppGenerator(app, project)
    const {files} = gen.output()
    const [serverAppFile] = files

    test('app file', () => {
        expect(serverAppFile.name).toBe('WidgetApp.mjs')
        expect(serverAppFile.contents).toBe(`import {runtimeFunctions} from './serverRuntime.cjs'
import {globalFunctions} from './serverRuntime.cjs'
import {components} from './serverRuntime.cjs'

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
    SayHello: {func: SayHello, update: false, argNames: ['id']},
    SelectStuff: {func: SelectStuff, update: false, argNames: ['min']},
    AssignmentsToEquals: {func: AssignmentsToEquals, update: true, argNames: ['foo']}
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
