import Generator, {generate} from '../../src/generator/Generator'
import Element from '../../src/model/Element';
import App from '../../src/model/App';
import Text from '../../src/model/Text';
import Button from '../../src/model/Button'
import Menu from '../../src/model/Menu'
import MenuItem from '../../src/model/MenuItem'
import Page from '../../src/model/Page'
import TextInput from '../../src/model/TextInput'
import NumberInput from '../../src/model/NumberInput'
import TrueFalseInput from '../../src/model/TrueFalseInput'
import SelectInput from '../../src/model/SelectInput'
import List from '../../src/model/List'
import Data from '../../src/model/Data'
import {ex} from '../testutil/testHelpers'
import Collection from '../../src/model/Collection'
import FunctionDef from '../../src/model/FunctionDef'
import MemoryDataStore from '../../src/model/MemoryDataStore'
import FileDataStore from '../../src/model/FileDataStore'
import Layout from '../../src/model/Layout'
import AppBar from '../../src/model/AppBar'
import UserLogon from '../../src/model/UserLogon'
import BrowserDataStore from '../../src/model/BrowserDataStore'
import FirestoreDataStore from '../../src/model/FirestoreDataStore'
import ServerAppConnector from '../../src/model/ServerAppConnector'
import Project from '../../src/model/Project'
import ServerApp from '../../src/model/ServerApp'
import DataTypes from '../../src/model/types/DataTypes'
import TextType from '../../src/model/types/TextType'
import NumberType from '../../src/model/types/NumberType'
import SpeechInput from '../../src/model/SpeechInput';
import FunctionImport from "../../src/model/FunctionImport";

const project = (el: Element) => new Project('proj1', 'Project 1', {}, [el])
test('generates main app and all page output files', ()=> {
    const app = new App('app1', 'App 1', {maxWidth: '60%'}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there!'}),
                new Text('id2', 't2', {content: ex`23 + 45`}),
            ]
        ),
        new Page('p2', 'Page 2', {}, [
                new Text('id3', 'Text 2', {content: 'Green!'}),
                new Text('id4', 't3', {content: 'Red!'}),
            ]
        )])

    const gen = new Generator(app, project(app))

    expect(gen.output().files[0].name).toBe('Page1.js')
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Hi there!'),
        React.createElement(TextElement, {path: pathWith('t2')}, 23 + 45),
    )
}
`)
    expect(gen.output().files[1].name).toBe('Page2.js')
    expect(gen.output().files[1].contents).toBe(`function Page2(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text2')}, 'Green!'),
        React.createElement(TextElement, {path: pathWith('t3')}, 'Red!'),
    )
}
`)
    expect(gen.output().files[2].name).toBe('appMain.js')
    expect(gen.output().files[2].contents).toBe(`export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App} = Elemento.components
    const pages = {Page1, Page2}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))

    return React.createElement(App, {path: 'App1', maxWidth: '60%',},)
}
`)

})

test('can get all code in one string from the output with imports and export', function () {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there!'}),
            ]
        ),
        new Page('p2', 'Page 2', {}, [
                new Text('id3', 'Text 2', {content: 'Green!'}),
            ]
        )])

    const output = generate(app, project(app))

    expect(output.code).toBe(`import React from 'react'
import Elemento from 'elemento-runtime'

// Page1.js
function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Hi there!'),
    )
}

// Page2.js
function Page2(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text2')}, 'Green!'),
    )
}

// appMain.js
export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App} = Elemento.components
    const pages = {Page1, Page2}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))

    return React.createElement(App, {path: 'App1', },)
}
`)
})

test('includes all DataTypes files', () => {
    const name = new TextType('tt1', 'Name', {required: true, maxLength: 20})
    const itemAmount = new NumberType('nt1', 'Item Amount', {max: 10})
    const dataTypes1 = new DataTypes('dt1', 'Types 1', {}, [name])
    const dataTypes2 = new DataTypes('dt2', 'Types 2', {}, [itemAmount])

    const app1 = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: ex`"Uses Data Types 2" + Types2.ItemAmount.max`}),
            ]
        )
    ])
    const app2 = new App('app2', 'App 2', {}, [
        new Page('p2', 'Page 1', {}, [
                new Text('id2', 'Text 1', {content: ex`"Uses Data Types 1" + Types1.Name.maxLength`}),
            ]
        )
    ])

    const project = new Project('proj1', 'Project 1', {}, [app1, app2, dataTypes1, dataTypes2])

    const output = generate(app1, project)

    expect(output.code).toBe(`import React from 'react'
import Elemento from 'elemento-runtime'

const {types: {ChoiceType, DateType, ListType, NumberType, RecordType, TextType, TrueFalseType, Rule}} = Elemento

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

// Page1.js
function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, "Uses Data Types 2" + Types2.ItemAmount.max),
    )
}

// appMain.js
export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))

    return React.createElement(App, {path: 'App1', },)
}
`)

})

test('generates html runner file', () => {
    const app = new App('app1', 'App 1', {}, [
            new Page('p1', 'Page 1', {}, [
                    new Text('id1', 'Text 1', {content: 'Hi there!'}),
                ]
            )
        ]
    )

    const output = generate(app, project(app))

    expect(output.html).toBe(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="initial-scale=1, width=device-width" />
  <title>App 1</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
  <style>
    body { margin: 0; padding: 0}
    #main { height: calc(100vh - 8px); width: calc(100vw - 8px); margin: 4px }
  </style>
</head>
<body>
<script type="module">
    import {runForDev} from './runtime.js'
    runForDev('./App1.js')
</script>
</body>
</html>
`)
})

test('generates App Bar elements with contents', ()=> {
    const app = new App('app1', 'Test1', {}, [
        new AppBar('ab1', 'App Bar 1', {title: 'My App'}, [
            new Text('id0', 'Text 0', {width: 200, content: 'Welcome!'})
        ]),
        new Page('p1', 'Page 1', {}, [
            new TextInput('id1', 't1', {initialValue: 'Hi there!', maxLength: 10, multiline: true, label: "Text Input One", width: 150}),
            new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`, maxLength: ex`5 + 5`}),
            new TextInput('id2', 't3', {}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[1].contents).toBe(`export default function Test1(props) {
    const pathWith = name => 'Test1' + '.' + name
    const {App, AppBar, TextElement} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))

    return React.createElement(App, {path: 'Test1', topChildren: React.createElement( React.Fragment, null, React.createElement(AppBar, {path: pathWith('AppBar1'), title: 'My App'},
            React.createElement(TextElement, {path: pathWith('Text0'), width: 200}, 'Welcome!'),
    ))
    },)
}
`)
})

test('generates TextInput elements with initial value', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('id1', 't1', {initialValue: 'Hi there!', maxLength: 10, multiline: true, label: "Text Input One", width: 150, readOnly: true}),
            new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`, maxLength: ex`5 + 5`}),
            new TextInput('id3', 't3', {}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextInput} = Elemento.components
    const t1 = Elemento.useObjectState(pathWith('t1'), new TextInput.State({value: 'Hi there!'}))
    const t2 = Elemento.useObjectState(pathWith('t2'), new TextInput.State({value: "Some" + " things"}))
    const t3 = Elemento.useObjectState(pathWith('t3'), new TextInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {path: pathWith('t1'), label: 'Text Input One', maxLength: 10, width: 150, multiline: true, readOnly: true}),
        React.createElement(TextInput, {path: pathWith('t2'), label: 't2', maxLength: 5 + 5}),
        React.createElement(TextInput, {path: pathWith('t3'), label: 't3'}),
    )
}
`)
})

test('generates Text elements with multiline content', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there!\nHow are you?\nToday',
                    fontSize: 36, fontFamily: 'Cat', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 33}),
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1'), fontSize: 36, fontFamily: 'Cat', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 33}, \`Hi there!
How are you?
Today\`),
    )
}
`)
})

test('generates Text elements with escaped quotes', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there \'Doctor\' How are you?'}),
            ]
        )])

    const gen = new Generator(app, project(app))
    const output = gen.output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Hi there \\'Doctor\\' How are you?'),
    )
}
`)
})

test('generates NumberInput elements with initial value', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new NumberInput('id1', 't1', {initialValue: 44, label: "Number Input One"}),
            new NumberInput('id2', 't2', {initialValue: ex`22 + 33`}),
            new NumberInput('id3', 't3', {}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, NumberInput} = Elemento.components
    const t1 = Elemento.useObjectState(pathWith('t1'), new NumberInput.State({value: 44}))
    const t2 = Elemento.useObjectState(pathWith('t2'), new NumberInput.State({value: 22 + 33}))
    const t3 = Elemento.useObjectState(pathWith('t3'), new NumberInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(NumberInput, {path: pathWith('t1'), label: 'Number Input One'}),
        React.createElement(NumberInput, {path: pathWith('t2'), label: 't2'}),
        React.createElement(NumberInput, {path: pathWith('t3'), label: 't3'}),
    )
}
`)
})

test('generates SpeechInput elements with language and phrases', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new SpeechInput('id1', 't1', {language: 'fr', expectedPhrases: ['One', 'Two']}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, SpeechInput} = Elemento.components
    const t1 = Elemento.useObjectState(pathWith('t1'), new SpeechInput.State({language: 'fr', expectedPhrases: ['One', 'Two']}))

    return React.createElement(Page, {id: props.path},
        React.createElement(SpeechInput, {path: pathWith('t1')}),
    )
}
`)
})

test('generates SelectInput elements with initial value', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new SelectInput('id1', 'Select1', {values: ['22', '33', '44'], initialValue: '44', label: "Select Input One"}),
            new SelectInput('id2', 'Select2', {values: ['22', '33', '44'], initialValue: ex`4+"4"`}),
            new SelectInput('id3', 'Select3', {values: []}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, SelectInput} = Elemento.components
    const Select1 = Elemento.useObjectState(pathWith('Select1'), new SelectInput.State({value: '44'}))
    const Select2 = Elemento.useObjectState(pathWith('Select2'), new SelectInput.State({value: 4+"4"}))
    const Select3 = Elemento.useObjectState(pathWith('Select3'), new SelectInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(SelectInput, {path: pathWith('Select1'), label: 'Select Input One', values: ['22', '33', '44']}),
        React.createElement(SelectInput, {path: pathWith('Select2'), label: 'Select2', values: ['22', '33', '44']}),
        React.createElement(SelectInput, {path: pathWith('Select3'), label: 'Select3', values: []}),
    )
}
`)
})

test('generates TrueFalseInput elements with initial value', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TrueFalseInput('id1', 't1', {initialValue: true, label: "True False Input One"}),
            new TrueFalseInput('id2', 't2', {initialValue: ex`true || false`}),
            new TrueFalseInput('id3', 't3', {}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TrueFalseInput} = Elemento.components
    const t1 = Elemento.useObjectState(pathWith('t1'), new TrueFalseInput.State({value: true}))
    const t2 = Elemento.useObjectState(pathWith('t2'), new TrueFalseInput.State({value: true || false}))
    const t3 = Elemento.useObjectState(pathWith('t3'), new TrueFalseInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TrueFalseInput, {path: pathWith('t1'), label: 'True False Input One'}),
        React.createElement(TrueFalseInput, {path: pathWith('t2'), label: 't2'}),
        React.createElement(TrueFalseInput, {path: pathWith('t3'), label: 't3'}),
    )
}
`)
})

test('generates Button elements with properties', ()=> {
    const actionExpr = ex`const message = "You clicked me!"; Log(message)
    Log("Didn't you?")`
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Button('id1', 'b1', {content: 'Click here!', action: actionExpr, appearance: ex`22 && "filled"`, display: false}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Button} = Elemento.components
    const {Log} = Elemento.globalFunctions

    return React.createElement(Page, {id: props.path},
        React.createElement(Button, {path: pathWith('b1'), content: 'Click here!', appearance: 22 && "filled", display: false, action: () => {const message = "You clicked me!"; Log(message)
    Log("Didn't you?")}}),
    )
}
`)
})

test('generates User Logon elements with properties', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new UserLogon('id1', 'b1', {}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, UserLogon} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(UserLogon, {path: pathWith('b1')}),
    )
}
`)
})

test('generates Menu element with items', () => {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Menu('id1', 'Menu 1', {label: 'Stuff to do', filled: true}, [
                    new MenuItem('it1', 'Item 1', {label: 'Do it', action: ex`Log('I am Item One')`}),
                    new MenuItem('it2', 'Item 2', {label: 'Say it'}),
                ]),
            ]
        )])

    const output = generate(app, project(app))
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Menu, MenuItem} = Elemento.components
    const {Log} = Elemento.globalFunctions

    return React.createElement(Page, {id: props.path},
        React.createElement(Menu, {path: pathWith('Menu1'), label: 'Stuff to do', filled: true},
            React.createElement(MenuItem, {path: pathWith('Item1'), label: 'Do it', action: () => {Log('I am Item One')}}),
            React.createElement(MenuItem, {path: pathWith('Item2'), label: 'Say it'}),
    ),
    )
}
`)
})

test('generates Data elements with initial value and no errors on object expressions', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Data('id1', 't1', {initialValue: 44}),
                new Data('id2', 't2', {initialValue: ex`{a:10, b: "Bee"}`, display: true}),
                new Data('id3', 't3', {}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Data} = Elemento.components
    const t1 = Elemento.useObjectState(pathWith('t1'), new Data.State({value: 44}))
    const t2 = Elemento.useObjectState(pathWith('t2'), new Data.State({value: ({a:10, b: "Bee"})}))
    const t3 = Elemento.useObjectState(pathWith('t3'), new Data.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(Data, {path: pathWith('t1'), display: false}),
        React.createElement(Data, {path: pathWith('t2'), display: true}),
        React.createElement(Data, {path: pathWith('t3'), display: false}),
    )
}
`)
    expect(output.errors).toStrictEqual({})
})

test('generates Collection elements with initial value and no errors on object expressions', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Collection('id1', 't1', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
                new Collection('id2', 't2', {initialValue: ex`["red", "yellow"]`, display: true}),
                new Collection('id3', 't3', {}),
            ]
        ),
        new FileDataStore('fds1', 'Store1', {})
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Collection} = Elemento.components
    const Store1 = Elemento.useGetObjectState('app.Store1')
    const t1 = Elemento.useObjectState(pathWith('t1'), new Collection.State({dataStore: Store1, collectionName: 'Widgets'}))
    const t2 = Elemento.useObjectState(pathWith('t2'), new Collection.State({value: ["red", "yellow"]}))
    const t3 = Elemento.useObjectState(pathWith('t3'), new Collection.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(Collection, {path: pathWith('t1'), display: false}),
        React.createElement(Collection, {path: pathWith('t2'), display: true}),
        React.createElement(Collection, {path: pathWith('t3'), display: false}),
    )
}
`)
    expect(output.errors).toStrictEqual({})
})

test('generates ServerAppConnector elements with correct configuration', () => {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('b1', 'Do It Button', {content: 'Go on, do it!', action: ex`Connector1.DoStuff('Number1')`}),
            ]
        ),
        new ServerAppConnector('sac1', 'Connector 1', {serverApp: ex`ServerApp1`})
    ])

    const getWidgetFn = new FunctionDef('fn1', 'Get Widget', {input1: 'id', calculation: ex`Get(Widgets, id)`})
    const updateWidgetFn = new FunctionDef('fn2', 'UpdateWidget', {input1: 'id', input2: 'changes', action: true, calculation: ex`Update(Widgets, id, changes)`})
    const getSprocketFn = new FunctionDef('fn3', 'GetSprocket', {input1: 'id', input2: 'direct', calculation: ex`Get(Sprockets, id)`})
    const serverApp = new ServerApp('sa1', 'Server App 1', {}, [
        getWidgetFn, updateWidgetFn, getSprocketFn,
    ])
    const project = new Project('proj1', 'The Project', {}, [app, serverApp])

    const output = new Generator(app, project).output()

    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Button} = Elemento.components
    const Connector1 = Elemento.useGetObjectState('app.Connector1')

    return React.createElement(Page, {id: props.path},
        React.createElement(Button, {path: pathWith('DoItButton'), content: 'Go on, do it!', appearance: 'outline', action: () => {Connector1.DoStuff('Number1')}}),
    )
}
`)

    expect(output.files[1].name).toBe('appMain.js')
    expect(output.files[1].contents).toBe(`function configServerApp1() {
    return {
        appName: 'Server App 1',
        url: '/capi/ServerApp1',

        functions: {
            GetWidget: {
                params: ['id']
            },

            UpdateWidget: {
                params: ['id', 'changes'],
                action: true
            },

            GetSprocket: {
                params: ['id', 'direct']
            }
        }
    };
}

export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App, ServerAppConnector} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
    const Connector1 = Elemento.useObjectState('app.Connector1', new ServerAppConnector.State({configuration: configServerApp1()}))

    return React.createElement(App, {path: 'App1', },)
}
`)

})

test('generates ServerAppConnector elements with correct configuration if has same name as Server App', () => {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('b1', 'Do It Button', {content: 'Go on, do it!', action: ex`Connector1.DoStuff('Number1')`}),
            ]
        ),
        new ServerAppConnector('sac1', 'Server App 1', {serverApp: ex`ServerApp1`})
    ])

    const getWidgetFn = new FunctionDef('fn1', 'Get Widget', {input1: 'id', calculation: ex`Get(Widgets, id)`})
    const serverApp = new ServerApp('sa1', 'Server App 1', {}, [
        getWidgetFn,
    ])
    const project = new Project('proj1', 'The Project', {}, [app, serverApp])

    const output = new Generator(app, project).output()
    expect(output.files[1].contents).toBe(`function configServerApp1() {
    return {
        appName: 'Server App 1',
        url: '/capi/ServerApp1',

        functions: {
            GetWidget: {
                params: ['id']
            }
        }
    };
}

export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App, ServerAppConnector} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
    const ServerApp1 = Elemento.useObjectState('app.ServerApp1', new ServerAppConnector.State({configuration: configServerApp1()}))

    return React.createElement(App, {path: 'App1', },)
}
`)
})

test('generates ServerAppConnector elements with specified URL', () => {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('b1', 'Do It Button', {content: 'Go on, do it!', action: ex`Connector1.DoStuff('Number1')`}),
            ]
        ),
        new ServerAppConnector('sac1', 'Connector 1', {serverApp: ex`ServerApp1`, serverUrl: 'https://example.com/api'})
    ])

    const getWidgetFn = new FunctionDef('fn1', 'Get Widget', {input1: 'id', calculation: ex`Get(Widgets, id)`})
    const serverApp = new ServerApp('sa1', 'Server App 1', {}, [getWidgetFn])
    const project = new Project('proj1', 'The Project', {}, [app, serverApp])

    const output = new Generator(app, project).output()

    expect(output.files[1].contents).toBe(`function configServerApp1() {
    return {
        appName: 'Server App 1',
        url: 'https://example.com/api',

        functions: {
            GetWidget: {
                params: ['id']
            }
        }
    };
}

export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App, ServerAppConnector} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
    const Connector1 = Elemento.useObjectState('app.Connector1', new ServerAppConnector.State({configuration: configServerApp1()}))

    return React.createElement(App, {path: 'App1', },)
}
`)

})

test('generates ServerAppConnector with code generation error if ServerApp not found', () => {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('b1', 'Do It Button', {content: 'Go on, do it!', action: ex`Connector1.DoStuff('Number1')`}),
            ]
        ),
        new ServerAppConnector('sac1', 'Connector 1', {serverApp: ex`ServerAppX`})
    ])

    const getWidgetFn = new FunctionDef('fn1', 'Get Widget', {input1: 'id', calculation: ex`Get(Widgets, id)`})
    const serverApp = new ServerApp('sa1', 'Server App 1', {}, [getWidgetFn])
    const project = new Project('proj1', 'The Project', {}, [app, serverApp])

    const output = new Generator(app, project).output()

    expect(output.files[1].contents).toBe(`function configServerApp() {
    return Elemento.codeGenerationError(\`'ServerAppX'\`, 'Unknown name');
}

export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App, ServerAppConnector} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
    const Connector1 = Elemento.useObjectState('app.Connector1', new ServerAppConnector.State({configuration: configServerApp()}))

    return React.createElement(App, {path: 'App1', },)
}
`)
})

test('generates ServerAppConnector with empty config if ServerApp not specified', () => {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('b1', 'Do It Button', {content: 'Go on, do it!', action: ex`Connector1.DoStuff('Number1')`}),
            ]
        ),
        new ServerAppConnector('sac1', 'Connector 1', {})
    ])

    const getWidgetFn = new FunctionDef('fn1', 'Get Widget', {input1: 'id', calculation: ex`Get(Widgets, id)`})
    const serverApp = new ServerApp('sa1', 'Server App 1', {}, [getWidgetFn])
    const project = new Project('proj1', 'The Project', {}, [app, serverApp])

    const output = new Generator(app, project).output()

    expect(output.files[1].contents).toBe(`function configServerApp() {
    return {};
}

export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App, ServerAppConnector} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
    const Connector1 = Elemento.useObjectState('app.Connector1', new ServerAppConnector.State({configuration: configServerApp()}))

    return React.createElement(App, {path: 'App1', },)
}
`)

})

test('sorts state entries into dependency order', () => {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('ti1', 'Description', {initialValue: ex`TheWidget.Description`}),
            new Data('id3', 'The Widget', {initialValue: ex`WidgetId.value && Get(Widgets, WidgetId.value)`}),
            new Data('id2', 'Widget Id', {initialValue: ex`WidgetList.selectedItem && WidgetList.selectedItem.id`}),
            new Collection('id1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
            new List('id4', 'Widget List', {items: ex`Widgets.Query({})`}, [new Text('lt1', 'Desc', {content: 'Hi!'})]),
            ]
        ),
        new FileDataStore('fds1', 'Store1', {})
    ])

    const output = new Generator(app, project(app)).output()

    expect(output.files[0].contents).toBe(`function Page1_WidgetListItem(props) {
    const pathWith = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item} = props
    const {TextElement} = Elemento.components

    return React.createElement(React.Fragment, null,
        React.createElement(TextElement, {path: pathWith('Desc')}, 'Hi!'),
    )
}


function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextInput, Data, Collection, ListElement} = Elemento.components
    const {Get} = Elemento.appFunctions
    const Store1 = Elemento.useGetObjectState('app.Store1')
    const Widgets = Elemento.useObjectState(pathWith('Widgets'), new Collection.State({dataStore: Store1, collectionName: 'Widgets'}))
    const WidgetList = Elemento.useObjectState(pathWith('WidgetList'), new ListElement.State({}))
    const WidgetId = Elemento.useObjectState(pathWith('WidgetId'), new Data.State({value: WidgetList.selectedItem && WidgetList.selectedItem.id}))
    const TheWidget = Elemento.useObjectState(pathWith('TheWidget'), new Data.State({value: WidgetId.value && Get(Widgets, WidgetId.value)}))
    const Description = Elemento.useObjectState(pathWith('Description'), new TextInput.State({value: TheWidget.Description}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {path: pathWith('Description'), label: 'Description'}),
        React.createElement(Data, {path: pathWith('TheWidget'), display: false}),
        React.createElement(Data, {path: pathWith('WidgetId'), display: false}),
        React.createElement(Collection, {path: pathWith('Widgets'), display: false}),
        React.createElement(ListElement, {path: pathWith('WidgetList'), itemContentComponent: Page1_WidgetListItem, items: Widgets.Query({})}),
    )
}
`)
    expect(output.errors).toStrictEqual({})

})

test('generates elements under App used in Page', ()=> {
    const app = new App('app1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('text1', 'Text 1', {content: 'Update the widget'}),
                new NumberInput('n1', 'Widget Value', {initialValue: ex`Get(Widgets, 'x1').a`, label: 'New widget value'}),
            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
        new FileDataStore('fds1', 'Store 2', {}),
        new BrowserDataStore('bds1', 'Store 3', {databaseName: 'Accounts', collectionNames: ['Cheques', 'Postings']}),
        new FirestoreDataStore('fsds1', 'Store 4', {collections: 'Cheques: userPrivate\nPostings: creator, techs'}),
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, NumberInput} = Elemento.components
    const {Get} = Elemento.appFunctions
    const Widgets = Elemento.useGetObjectState('app.Widgets')
    const WidgetValue = Elemento.useObjectState(pathWith('WidgetValue'), new NumberInput.State({value: Get(Widgets, 'x1').a}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Update the widget'),
        React.createElement(NumberInput, {path: pathWith('WidgetValue'), label: 'New widget value'}),
    )
}
`)

    expect(output.files[1].contents).toBe(`export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App, Collection, MemoryDataStore, FileDataStore, BrowserDataStore, FirestoreDataStore} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
    const [Store1] = React.useState(new MemoryDataStore({value: ({ Widgets: { x1: {a: 10}}})}))
    const Widgets = Elemento.useObjectState('app.Widgets', new Collection.State({dataStore: Store1, collectionName: 'Widgets'}))
    const Store2 = Elemento.useObjectState('app.Store2', new FileDataStore.State({}))
    const Store3 = Elemento.useObjectState('app.Store3', new BrowserDataStore.State({databaseName: 'Accounts', collectionNames: ['Cheques', 'Postings']}))
    const Store4 = Elemento.useObjectState('app.Store4', new FirestoreDataStore.State({collections: \`Cheques: userPrivate
Postings: creator, techs\`}))

    return React.createElement(App, {path: 'App1', },
        React.createElement(Collection, {path: pathWith('Widgets'), display: false})
    )
}
`)

    expect(output.errors).toStrictEqual({})
})

test('generates codeGenerationError for unknown names in elements under App used in Page', ()=> {
    const app = new App('app1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('text1', 'Text 1', {content: 'Update the widget'}),
                new NumberInput('n1', 'Widget Value', {initialValue: ex`Get(Widgets, 'x1').a`, label: 'New widget value'}),
            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`StoreX`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, NumberInput} = Elemento.components
    const {Get} = Elemento.appFunctions
    const Widgets = Elemento.useGetObjectState('app.Widgets')
    const WidgetValue = Elemento.useObjectState(pathWith('WidgetValue'), new NumberInput.State({value: Get(Widgets, 'x1').a}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Update the widget'),
        React.createElement(NumberInput, {path: pathWith('WidgetValue'), label: 'New widget value'}),
    )
}
`)

    expect(output.files[1].contents).toBe(`export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App, Collection, MemoryDataStore} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
    const [Store1] = React.useState(new MemoryDataStore({value: ({ Widgets: { x1: {a: 10}}})}))
    const Widgets = Elemento.useObjectState('app.Widgets', new Collection.State({dataStore: Elemento.codeGenerationError(\`StoreX\`, 'Unknown names: StoreX'), collectionName: 'Widgets'}))

    return React.createElement(App, {path: 'App1', },
        React.createElement(Collection, {path: pathWith('Widgets'), display: false})
    )
}
`)

    expect(output.errors).toStrictEqual({
        coll1: {
            dataStore: 'Unknown names: StoreX'
        }
    })
})

test('generates List element with separate child component and global functions and select action', ()=> {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('id4', 'Text Input 1', {}),
            new Layout('la1', 'Layout 1', {}, [
                new List('l1', 'List 1', {items: [{a: 10}, {a: 20}], style: 'color: red', width: 200, selectAction: ex`Log(\$item.id)`}, [
                    new Text('id1', 'Text 1', {content: ex`"Hi there " + TextInput2 + " in " + TextInput1`}),
                    new TextInput('id2', 'Text Input 2', {initialValue: ex`"from " + Left($item, 3)`}),
                    new Button('id3', 'Button Update', {content: 'Update', action: ex`Update('Things', '123', {done: true})`}),
                ])
            ])
            ]
        ),
    ])

    const gen = new Generator(app, project(app))

    expect(gen.output().files[0].contents).toBe(`function Page1_List1Item(props) {
    const pathWith = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item} = props
    const {TextElement, TextInput, Button} = Elemento.components
    const {Left} = Elemento.globalFunctions
    const {Update} = Elemento.appFunctions
    const TextInput1 = Elemento.useGetObjectState(parentPathWith('TextInput1'))
    const TextInput2 = Elemento.useObjectState(pathWith('TextInput2'), new TextInput.State({value: "from " + Left($item, 3)}))

    return React.createElement(React.Fragment, null,
        React.createElement(TextElement, {path: pathWith('Text1')}, "Hi there " + TextInput2 + " in " + TextInput1),
        React.createElement(TextInput, {path: pathWith('TextInput2'), label: 'Text Input 2'}),
        React.createElement(Button, {path: pathWith('ButtonUpdate'), content: 'Update', appearance: 'outline', action: () => {Update('Things', '123', {done: true})}}),
    )
}


function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextInput, Layout, ListElement} = Elemento.components
    const {Log} = Elemento.globalFunctions
    const TextInput1 = Elemento.useObjectState(pathWith('TextInput1'), new TextInput.State({}))
    const List1 = Elemento.useObjectState(pathWith('List1'), new ListElement.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {path: pathWith('TextInput1'), label: 'Text Input 1'}),
        React.createElement(Layout, {path: pathWith('Layout1'), horizontal: false, wrap: false},
            React.createElement(ListElement, {path: pathWith('List1'), itemContentComponent: Page1_List1Item, items: [{a: 10}, {a: 20}], width: 200, selectAction: (\$item) => {Log(\$item.id)}, style: 'color: red'}),
    ),
    )
}
`)
})

test('generates List element with no items expression if undefined', ()=> {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 2', {}, [
            // @ts-ignore
            new List('l1', 'List 1', {items: undefined, selectable: false}, [
                new Text('id1', 'Text 1', {content: 'Hi there!'}),
            ])
            ]
        ),
    ])

    const gen = new Generator(app, project(app))

    expect(gen.output().files[0].contents).toBe(`function Page2_List1Item(props) {
    const pathWith = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item} = props
    const {TextElement} = Elemento.components

    return React.createElement(React.Fragment, null,
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Hi there!'),
    )
}


function Page2(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, ListElement} = Elemento.components
    const List1 = Elemento.useObjectState(pathWith('List1'), new ListElement.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(ListElement, {path: pathWith('List1'), itemContentComponent: Page2_List1Item, selectable: false}),
    )
}
`)

})

test('generates Layout element with properties and children', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new NumberInput('n1', 'Widget Count', {initialValue: ex`18`, label: 'New widget value'}),
            new Layout('lay1', 'Layout 1', {horizontal: true, width: 500, wrap: ex`100 < 200`, backgroundColor: 'pink'}, [
                new Text('text1', 'T1', {content: ex`23 + 45`}),
                new TextInput('input1', 'Name Input', {}),
                new SelectInput('select1', 'Colour', {values: ['red', 'green']}),
                new Button('b1', 'B1', {content: 'Click here!'}),
            ])
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, NumberInput, Layout, TextElement, TextInput, SelectInput, Button} = Elemento.components
    const WidgetCount = Elemento.useObjectState(pathWith('WidgetCount'), new NumberInput.State({value: 18}))
    const NameInput = Elemento.useObjectState(pathWith('NameInput'), new TextInput.State({}))
    const Colour = Elemento.useObjectState(pathWith('Colour'), new SelectInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(NumberInput, {path: pathWith('WidgetCount'), label: 'New widget value'}),
        React.createElement(Layout, {path: pathWith('Layout1'), horizontal: true, width: 500, wrap: 100 < 200, backgroundColor: 'pink'},
            React.createElement(TextElement, {path: pathWith('T1')}, 23 + 45),
            React.createElement(TextInput, {path: pathWith('NameInput'), label: 'Name Input'}),
            React.createElement(SelectInput, {path: pathWith('Colour'), label: 'Colour', values: ['red', 'green']}),
            React.createElement(Button, {path: pathWith('B1'), content: 'Click here!', appearance: 'outline'}),
    ),
    )
}
`)
})

test('transforms expressions to functions where needed and does not fail where no expression present', () => {
    const app = new App('app1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Data('d1', 'TallWidgets', {initialValue: ex`Select(Widgets.getAllData(), \$item.height > 10)`}),
                new Data('d2', 'TallerWidgets', {initialValue: ex`ForEach(Widgets.getAllData(), \$item.height + 10)`}),
                new Data('d3', 'NoWidgets', {initialValue: ex`Select(Widgets.getAllData())`}),
            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Data} = Elemento.components
    const {Select, ForEach} = Elemento.globalFunctions
    const Widgets = Elemento.useGetObjectState('app.Widgets')
    const TallWidgets = Elemento.useObjectState(pathWith('TallWidgets'), new Data.State({value: Select(Widgets.getAllData(), \$item => \$item.height > 10)}))
    const TallerWidgets = Elemento.useObjectState(pathWith('TallerWidgets'), new Data.State({value: ForEach(Widgets.getAllData(), \$item => \$item.height + 10)}))
    const NoWidgets = Elemento.useObjectState(pathWith('NoWidgets'), new Data.State({value: Select(Widgets.getAllData(), \$item => null)}))

    return React.createElement(Page, {id: props.path},
        React.createElement(Data, {path: pathWith('TallWidgets'), display: false}),
        React.createElement(Data, {path: pathWith('TallerWidgets'), display: false}),
        React.createElement(Data, {path: pathWith('NoWidgets'), display: false}),
    )
}
`)
})

test('generates local user defined functions in a page', () => {
    const app = new App('app1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
            new FunctionDef('f1', 'IsTallWidget', {input1: 'widget', calculation: ex`let heightAllowed = MinHeight\nlet isShiny = widget.shiny\nOr(widget.height > heightAllowed, isShiny)`}),
            new Data('d1', 'TallWidgets', {initialValue: ex`Select(Widgets.getAllData(), IsTallWidget(\$item))`}),
            new NumberInput('n1', 'Min Height', {}),
            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Data, NumberInput} = Elemento.components
    const {Or, Select} = Elemento.globalFunctions
    const Widgets = Elemento.useGetObjectState('app.Widgets')
    const MinHeight = Elemento.useObjectState(pathWith('MinHeight'), new NumberInput.State({}))
    const IsTallWidget = (widget) => {
        let heightAllowed = MinHeight
        let isShiny = widget.shiny
        return Or(widget.height > heightAllowed, isShiny)
    }
    const TallWidgets = Elemento.useObjectState(pathWith('TallWidgets'), new Data.State({value: Select(Widgets.getAllData(), \$item => IsTallWidget(\$item))}))

    return React.createElement(Page, {id: props.path},
        React.createElement(Data, {path: pathWith('TallWidgets'), display: false}),
        React.createElement(NumberInput, {path: pathWith('MinHeight'), label: 'Min Height'}),
    )
}
`)
})

test('generates javascript functions in a page that can use global functions', () => {
    const javascriptCode =
`let y = 10
for (let i = 1; i < 10; i++) {
    y += Sum(widget, 10)
}
return y
`
    const app = new App('app1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
            new FunctionDef('f1', 'WidgetHeight', {input1: 'widget', calculation: {expr: javascriptCode}, javascript: true}),
            ]
        )
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page} = Elemento.components
    const {Sum} = Elemento.globalFunctions
    const WidgetHeight = (widget) => {
        let y = 10
        for (let i = 1; i < 10; i++) {
            y += Sum(widget, 10)
        }
        return y
    }

    return React.createElement(Page, {id: props.path},

    )
}
`)
    expect(output.errors).toStrictEqual({})
})

test('generates javascript functions in a page that can have nested functions', () => {
    const javascriptCode =
`function generateClause(placeholder) {
    const subFormulaArgs = placeholder.replace('[', '').replace(']','').trim().split(/ +/)
    
    let args = subFormulaArgs.map( arg => words[arg] || arg )
    return factory.call(null, args)
}
return formula.replaceAll(/\\[[\\w ]+\\]/g, generateClause)
`
    const app = new App('app1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
            new FunctionDef('f1', 'WidgetHeight', {input1: 'words', input2: 'factory', input3: 'formula', calculation: {expr: javascriptCode}, javascript: true}),
            ]
        )
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.errors).toStrictEqual({})

    expect(output.files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page} = Elemento.components
    const WidgetHeight = (words, factory, formula) => {
        function generateClause(placeholder) {
            const subFormulaArgs = placeholder.replace('[', '').replace(']','').trim().split(/ +/)
            
            let args = subFormulaArgs.map( arg => words[arg] || arg )
            return factory.call(null, args)
        }
        return formula.replaceAll(/\\[[\\w ]+\\]/g, generateClause)
    }

    return React.createElement(Page, {id: props.path},

    )
}
`)
})

test('generates local user defined functions in the app', () => {
    const app = new App('app1', 'Test1', {}, [
        new AppBar('ab1', 'App Bar 1', {title: 'My App'}, [
            new Text('id0', 'Text 0', {content: ex`AppBarText('Welcome to ')`})
        ]),
        new FunctionDef('f1', 'AppBarText', {input1: 'greeting', calculation: ex`greeting + 'our new app'`}),
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: 'Hi there!'}),
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[1].contents).toBe(`export default function Test1(props) {
    const pathWith = name => 'Test1' + '.' + name
    const {App, AppBar, TextElement} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
    const AppBarText = (greeting) => {
        return greeting + 'our new app'
    }

    return React.createElement(App, {path: 'Test1', topChildren: React.createElement( React.Fragment, null, React.createElement(AppBar, {path: pathWith('AppBar1'), title: 'My App'},
            React.createElement(TextElement, {path: pathWith('Text0')}, AppBarText('Welcome to ')),
    ))
    },)
}
`)
})

test('generates local user defined functions in a list item that use a page item', () => {
    const app = new App('app1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
            new FunctionDef('f1', 'IsTallWidget', {input1: 'widget', calculation: ex`Or(widget.height > MinHeight, widget.shiny)`}),
            new Data('d1', 'TallWidgets', {initialValue: ex`Select(Widgets.getAllData(), IsTallWidget(\$item))`}),
            new NumberInput('n1', 'Min Height', {}),
            new List('id4', 'Widget List', {items: ex`Widgets.Query({})`}, [
                new Text('lt1', 'Desc', {content: 'Hi!'}),
                new FunctionDef('f2', 'ExtraHeight', {calculation: ex`\$item.height - MinHeight`}),
            ]),

            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1_WidgetListItem(props) {
    const pathWith = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item} = props
    const {TextElement} = Elemento.components
    const MinHeight = Elemento.useGetObjectState(parentPathWith('MinHeight'))
    const ExtraHeight = () => {
        return \$item.height - MinHeight
    }

    return React.createElement(React.Fragment, null,
        React.createElement(TextElement, {path: pathWith('Desc')}, 'Hi!'),
    )
}


function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Data, NumberInput, ListElement} = Elemento.components
    const {Or, Select} = Elemento.globalFunctions
    const Widgets = Elemento.useGetObjectState('app.Widgets')
    const MinHeight = Elemento.useObjectState(pathWith('MinHeight'), new NumberInput.State({}))
    const IsTallWidget = (widget) => {
        return Or(widget.height > MinHeight, widget.shiny)
    }
    const TallWidgets = Elemento.useObjectState(pathWith('TallWidgets'), new Data.State({value: Select(Widgets.getAllData(), \$item => IsTallWidget(\$item))}))
    const WidgetList = Elemento.useObjectState(pathWith('WidgetList'), new ListElement.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(Data, {path: pathWith('TallWidgets'), display: false}),
        React.createElement(NumberInput, {path: pathWith('MinHeight'), label: 'Min Height'}),
        React.createElement(ListElement, {path: pathWith('WidgetList'), itemContentComponent: Page1_WidgetListItem, items: Widgets.Query({})}),
    )
}
`)
})

test('generates function imports in the app', () => {
    const app = new App('app1', 'Test1', {}, [
        new FunctionImport('f1', 'Get Name', {source: 'Function1.js'}),
        new FunctionImport('f2', 'Calc Tax', {source: 'https://cdn.example.com/CalcStuff.js'}),
        new FunctionImport('f3', 'Do Stuff', {}),
        new FunctionImport('f4', 'Get Amount', {source: 'Functions.js', exportName: 'amount'}),
        new FunctionImport('fAll', 'Calcs', {source: 'Functions.js', exportName: '*'}),
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: ex`'This is ' + GetName('xyz') + DoStuff()`}),
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().code).toBe(`import React from 'react'
import Elemento from 'elemento-runtime'
const GetName = await Elemento.importModule('./files/Function1.js')
const CalcTax = await Elemento.importModule('https://cdn.example.com/CalcStuff.js')
const DoStuff = await Elemento.importModule('./files/DoStuff.js')
const GetAmount = await Elemento.importModule('./files/Functions.js', 'amount')
const Calcs = await Elemento.importModule('./files/Functions.js', '*')

// Page1.js
function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'This is ' + GetName('xyz') + DoStuff()),
    )
}

// appMain.js
export default function Test1(props) {
    const pathWith = name => 'Test1' + '.' + name
    const {App} = Elemento.components
    const pages = {Page1}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))

    return React.createElement(App, {path: 'Test1', },)
}
`)
})

test('generates error for syntax error in expression', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`'Hello 'Doctor' how are you?'`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, Elemento.codeGenerationError(\`'Hello 'Doctor' how are you?'\`, 'Error: Line 1: Unexpected identifier')),
    )
}
`)
    expect(output.errors).toStrictEqual({
        id1: {
            content: "Error: Line 1: Unexpected identifier"
        }
    })

})

test('generates error on correct line for syntax error in multiline content expression', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`23\n +`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, Elemento.codeGenerationError(\`23
 +\`, 'Error: Line 2: Unexpected end of input')),
    )
}
`)
    expect(output.errors).toStrictEqual({
        id1: {
            content: "Error: Line 2: Unexpected end of input"
        }
    })

})

test('global functions available in content expression', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`Sum(2, 3, 4)`}),
            ]
        )])

    const content = new Generator(app, project(app)).output().files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const {Sum} = Elemento.globalFunctions

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, Sum(2, 3, 4)),
    )
}
`)
})

test('built-in names available in content expression', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`undefined`}),
                new Text('id2', 't2', {content: ex`null`}),
                new Text('id3', 't3', {content: ex`new Date(2020, 3, 4)`}),
                new Text('id4', 't4', {content: ex`Math.sqrt(2)`}),
            ]
        )])

    const content = new Generator(app, project(app)).output().files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, undefined),
        React.createElement(TextElement, {path: pathWith('t2')}, null),
        React.createElement(TextElement, {path: pathWith('t3')}, new Date(2020, 3, 4)),
        React.createElement(TextElement, {path: pathWith('t4')}, Math.sqrt(2)),
    )
}
`)
})

test('app state functions and Page names available in expression', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('id1', 'b1', {content: 'Change Page', action: ex`ShowPage(Page2)`}),
            ]
        ),
        new Page('p2', 'Page 2', {}, [
                new Button('id1', 'b2', {content: 'Back to Page 1', action: ex`ShowPage(Page1)`}),
            ]
        )])

    const content = new Generator(app, project(app)).output().files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Button} = Elemento.components
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app

    return React.createElement(Page, {id: props.path},
        React.createElement(Button, {path: pathWith('b1'), content: 'Change Page', appearance: 'outline', action: () => {ShowPage(Page2)}}),
    )
}
`)
})

test('page elements available in content expression', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`ForenameInput.value + " " + SurnameInput.value`}),
                new TextInput('id2', 'Forename Input', {}),
                new TextInput('id3', 'Surname Input', {}),
            ]
        )])

    const content = new Generator(app, project(app)).output().files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, TextInput} = Elemento.components
    const ForenameInput = Elemento.useObjectState(pathWith('ForenameInput'), new TextInput.State({}))
    const SurnameInput = Elemento.useObjectState(pathWith('SurnameInput'), new TextInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, ForenameInput.value + " " + SurnameInput.value),
        React.createElement(TextInput, {path: pathWith('ForenameInput'), label: 'Forename Input'}),
        React.createElement(TextInput, {path: pathWith('SurnameInput'), label: 'Surname Input'}),
    )
}
`)
})

test('unknown global functions generate error', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`sumxx(2, 3, 4)`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    const content = output.files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, Elemento.codeGenerationError(\`sumxx(2, 3, 4)\`, 'Unknown names: sumxx')),
    )
}
`)
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Unknown names: sumxx'
        }
    })

})

test('return statement in expression generates error', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`return 42`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    const content = output.files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, Elemento.codeGenerationError(\`return 42\`, 'Error: Invalid expression')),
    )
}
`)
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Error: Invalid expression'
        }
    })

})

test('syntax error statement in initialValue generates error into state defaults', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new TextInput('id2', 'Name Input', {initialValue: ex`{a: 10,`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    const content = output.files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextInput} = Elemento.components
    const NameInput = Elemento.useObjectState(pathWith('NameInput'), new TextInput.State({value: Elemento.codeGenerationError(\`{a: 10,\`, 'Error: Line 1: Unexpected token )')}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {path: pathWith('NameInput'), label: 'Name Input'}),
    )
}
`)
    expect(output.errors).toStrictEqual({
        id2: {
            initialValue: 'Error: Line 1: Unexpected token )'
        }
    })

})

test('statement not expression generates error', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`while (true) log(10)`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Error: Invalid expression'
        }
    })
})

test('multiple statements in value expression generates error', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`while (true) log(10); return 42`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Error: Must be a single expression'
        }
    })
})

test('multiple statements in action expression is ok', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('id1', 'b1', {action: ex`while (true) Log(10); let answer = 42
                Log(answer)`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.errors).toStrictEqual({})
})

test('assignment at top level is treated as comparison', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`Sum = 1`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    const content = output.files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const {Sum} = Elemento.globalFunctions

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, Sum == 1),
    )
}
`)
    expect(output.errors).toStrictEqual({})
})

test('assignment in function argument is treated as comparison', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new TextInput('id1', 'Input', {}),
                new Text('id2', 'Answer', {content: ex`If(Input.value = 42, 10, 20)`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    const content = output.files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextInput, TextElement} = Elemento.components
    const {If} = Elemento.globalFunctions
    const Input = Elemento.useObjectState(pathWith('Input'), new TextInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {path: pathWith('Input'), label: 'Input'}),
        React.createElement(TextElement, {path: pathWith('Answer')}, If(Input.value == 42, 10, 20)),
    )
}
`)
    expect(output.errors).toStrictEqual({})
})

test('assignment anywhere in expression is treated as comparison', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`If(true, 10, Sum(Log= 12, 3, 4))`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    const content = output.files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const {If, Sum, Log} = Elemento.globalFunctions

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, If(true, 10, Sum(Log == 12, 3, 4))),
    )
}
`)
    expect(output.errors).toStrictEqual({})
})

test('assignment deep in complex expression is treated as comparison', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('id1', 'b1', {action: ex`let a = If(true, 10, Sum(Log= 12, 3, 4))
    let b = If(Sum = 42, 10, 20)
    Sum = 1`})
            ]
        )])

    const output = new Generator(app, project(app)).output()
    const content = output.files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Button} = Elemento.components
    const {If, Sum, Log} = Elemento.globalFunctions

    return React.createElement(Page, {id: props.path},
        React.createElement(Button, {path: pathWith('b1'), content: 'Do something', appearance: 'outline', action: () => {let a = If(true, 10, Sum(Log == 12, 3, 4))
    let b = If(Sum == 42, 10, 20)
    Sum == 1}}),
    )
}
`)
    expect(output.errors).toStrictEqual({})
})

test('property shorthand to name of property reports error and generates an error in the code', () => {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`{a: 10, xxx}`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    const content = output.files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, ({a: 10, xxx: undefined})),
    )
}
`)
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Incomplete item: xxx'
        }
    })

})

test('Unexpected number error in expression generates error', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`If(Sum(1)    1, Log(10), Log(20))`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Error: Unexpected token 1'
        }
    })

})

