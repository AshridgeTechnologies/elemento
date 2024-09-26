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
import Block from '../../src/model/Block'
import AppBar from '../../src/model/AppBar'
import UserLogon from '../../src/model/UserLogon'
import BrowserDataStore from '../../src/model/BrowserDataStore'
import FirestoreDataStore from '../../src/model/FirestoreDataStore'
import ServerAppConnector from '../../src/model/ServerAppConnector'
import Project, {COMPONENTS_ID, TOOLS_ID} from '../../src/model/Project'
import ServerApp from '../../src/model/ServerApp'
import DataTypes from '../../src/model/types/DataTypes'
import TextType from '../../src/model/types/TextType'
import NumberType from '../../src/model/types/NumberType'
import SpeechInput from '../../src/model/SpeechInput';
import FunctionImport from "../../src/model/FunctionImport";
import DateInput from '../../src/model/DateInput'
import Form from '../../src/model/Form';
import Tool from '../../src/model/Tool'
import ToolFolder from '../../src/model/ToolFolder'
import Calculation from '../../src/model/Calculation'
import ToolImport from '../../src/model/ToolImport'
import Rule from '../../src/model/types/Rule';
import ComponentDef from '../../src/model/ComponentDef'
import ComponentInstance from '../../src/model/ComponentInstance'
import ComponentFolder from '../../src/model/ComponentFolder'
import ItemSet from '../../src/model/ItemSet'
import {knownSync} from '../../src/generator/generatorHelpers'
import Dialog from '../../src/model/Dialog'

const project = (...els: Element[]) => Project.new(els, 'Project 1', 'proj1', {})

test('generates app and all page output files', ()=> {
    const app = new App('app1', 'App 1', {maxWidth: '60%', fonts: 'Crazy Font\nWeird Font'}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there!'}),
                new Text('id2', 't2', {content: ex`23 + 45`}),
            ]
        ),
        new Page('p2', 'Page 2', {notLoggedInPage: ex`Page1`}, [
                new Text('id3', 'Text 2', {content: 'Green!'}),
                new Text('id4', 't3', {content: 'Red!'}),
            ]
        )])

    const gen = new Generator(app, project(app))

    expect(gen.output().files[0].name).toBe('Page1.js')
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there!').props),
        React.createElement(TextElement, elProps(pathTo('t2')).content(23 + 45).props),
    )
}
`)
    expect(gen.output().files[1].name).toBe('Page2.js')
    expect(gen.output().files[1].contents).toBe(`function Page2(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text2')).content('Green!').props),
        React.createElement(TextElement, elProps(pathTo('t3')).content('Red!').props),
    )
}
Page2.notLoggedInPage = 'Page1'
`)
    expect(gen.output().files[2].name).toBe('appMain.js')
    expect(gen.output().files[2].contents).toBe(`export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const {App} = Elemento.components
    const pages = {Page1, Page2}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))

    return React.createElement(App, {...elProps('App1').maxWidth('60%').fonts(['Crazy Font', 'Weird Font']).props},)
}
`)

})

test('generates Tool and all page output files, generates nothing for ToolImport', ()=> {
    const tool = new Tool('tool1', 'Tool 1', {maxWidth: '60%'}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there!'}),
                new Button('id2', 'Button 1', {content: 'Do It', action: ex`Editor.Highlight('menuItem+File')`}),
            ]
        )]
    )

    const toolImport = new ToolImport('toolImport1', 'Tool Import 1', {source: 'https://example.com/aTool'})

    const gen = new Generator(tool, project(new ToolFolder(TOOLS_ID, 'Tools', {}, [tool, toolImport])))

    expect(gen.output().files[0].name).toBe('Page1.js')
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement, Button} = Elemento.components
    const {Editor, Preview} = Elemento
    const _state = Elemento.useGetStore()
    const Button1_action = React.useCallback(wrapFn(pathTo('Button1'), 'action', async () => {
        await Editor.Highlight('menuItem+File')
    }), [])
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there!').props),
        React.createElement(Button, elProps(pathTo('Button1')).content('Do It').appearance('outline').action(Button1_action).props),
    )
}
`)

    expect(gen.output().files[1].name).toBe('Tool1.js')
    expect(gen.output().files[1].contents).toBe(`export default function Tool1(props) {
    const pathTo = name => 'Tool1' + '.' + name
    const {App} = Elemento.components
    const {Editor, Preview} = Elemento
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('Tool1', new App.State({pages, appContext}))

    return React.createElement(App, {...elProps('Tool1').maxWidth('60%').props},)
}
`)

    expect(gen.output().files.length).toBe(2)
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

    expect(output.code).toBe(`const runtimeUrl = window.elementoRuntimeUrl || 'https://elemento.online/lib/runtime.js'
const Elemento = await import(runtimeUrl)
const {React, trace, elProps, stateProps, wrapFn} = Elemento

// Page1.js
function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there!').props),
    )
}

// Page2.js
function Page2(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text2')).content('Green!').props),
    )
}

// appMain.js
export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const {App} = Elemento.components
    const pages = {Page1, Page2}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))

    return React.createElement(App, {...elProps('App1').props},)
}
`)
})

test('includes all DataTypes files and global functions in data types', () => {
    const name = new TextType('tt1', 'Name', {required: true, maxLength: 20})
    const itemAmount = new NumberType('nt1', 'Item Amount', {max: 10}, [
        new Rule('rule1', 'Even rule', {description: 'Must be even', formula: ex`And(\$item > 0, \$item % 2 === 0)`})
    ])
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

    const project = Project.new([app1, app2, dataTypes1, dataTypes2], 'Project 1', 'proj1', {})

    const output = generate(app1, project)

    expect(output.code).toBe(`const runtimeUrl = window.elementoRuntimeUrl || 'https://elemento.online/lib/runtime.js'
const Elemento = await import(runtimeUrl)
const {React, trace, elProps, stateProps, wrapFn} = Elemento

const {types: {ChoiceType, DateType, ListType, NumberType, DecimalType, RecordType, TextType, TrueFalseType, Rule}} = Elemento

// Types1.js
const Types1 = (() => {

    const Name = new TextType('Name', {required: true, maxLength: 20})

    return {
        Name
    }
})()

// Types2.js
const Types2 = (() => {
    const {And} = Elemento.globalFunctions

    const ItemAmount = new NumberType('Item Amount', {required: false, max: 10}, [
        new Rule('Even rule', $item => And($item > 0, $item % 2 === 0), {description: 'Must be even'})
    ])

    return {
        ItemAmount
    }
})()

// Page1.js
function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Uses Data Types 2' + Types2.ItemAmount.max).props),
    )
}

// appMain.js
export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const {App} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))

    return React.createElement(App, {...elProps('App1').props},)
}
`)

})

test('generates html runner file', () => {
    const app = new App('app1', 'App 1', {fonts: 'Crazy Font\nWeird Font'}, [
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link id="web-font-link" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&family=Crazy Font&family=Weird Font&display=swap"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
  <style>
    body { margin: 0; padding: 0}
    #main { height: 100vh; width: 100vw; margin: 0 }
  </style>
</head>
<body>
<script type="module">
    const elementoRuntimeHost = (location.host.match(/^(localhost:|elemento-apps)/)) ? location.origin : 'https://elemento.online'
    window.elementoRuntimeUrl = elementoRuntimeHost + '/lib/runtime.js'
    import(window.elementoRuntimeUrl).then( runtime => runtime.runAppFromWindowUrl() )
</script>
</body>
</html>
`)
})

test('generates App Bar elements with contents', ()=> {
    const app = new App('app1', 'Test1', {}, [
        new AppBar('ab1', 'App Bar 1', {title: 'My App'}, [
            new Text('id0', 'Text 0', {styles: {width: 200}, content: 'Welcome!'})
        ]),
        new Page('p1', 'Page 1', {}, [
            new TextInput('id1', 't1', {initialValue: 'Hi there!', multiline: true, label: "Text Input One", styles: {width: 150}}),
            new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`}),
            new TextInput('id2', 't3', {}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[1].contents).toBe(`export default function Test1(props) {
    const pathTo = name => 'Test1' + '.' + name
    const {App, AppBar, TextElement} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('Test1', new App.State({pages, appContext}))

    return React.createElement(App, {...elProps('Test1').props, topChildren: React.createElement( React.Fragment, null, React.createElement(AppBar, elProps(pathTo('AppBar1')).title('My App').props,
            React.createElement(TextElement, elProps(pathTo('Text0')).styles(elProps(pathTo('Text0.Styles')).width(200).props).content('Welcome!').props),
    ))
    },)
}
`)
})

test('generates startup action for App', ()=> {
    const app = new App('app1', 'Test1', {startupAction: ex`Log('Off we go!')`}, [
        new Page('p1', 'Page 1', {}, [
            new Text('id1', 't1', {content: 'Hi there!'})
        ])
    ])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[1].contents).toBe(`export default function Test1(props) {
    const pathTo = name => 'Test1' + '.' + name
    const {App} = Elemento.components
    const {Log} = Elemento.globalFunctions
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('Test1', new App.State({pages, appContext}))
    const Test1_startupAction = React.useCallback(wrapFn(pathTo('Test1'), 'startupAction', () => {
        Log('Off we go!')
    }), [])

    return React.createElement(App, {...elProps('Test1').startupAction(Test1_startupAction).props},)
}
`)
})

test('generates TextInput elements with initial value and styles including expressions', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('id1', 't1', {initialValue: 'Hi there!', multiline: true, label: "Text Input One", styles: {width: 150}, readOnly: true}),
            new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`, styles: {borderBottom: ex`50 + 50`}}),
            new TextInput('id3', 't3', {}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const t1 = _state.setObject(pathTo('t1'), new TextInput.State(stateProps(pathTo('t1')).value('Hi there!').props))
    const t2 = _state.setObject(pathTo('t2'), new TextInput.State(stateProps(pathTo('t2')).value('Some' + ' things').props))
    const t3 = _state.setObject(pathTo('t3'), new TextInput.State(stateProps(pathTo('t3')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('t1')).label('Text Input One').readOnly(true).multiline(true).styles(elProps(pathTo('t1.Styles')).width(150).props).props),
        React.createElement(TextInput, elProps(pathTo('t2')).label('t2').styles(elProps(pathTo('t2.Styles')).borderBottom(50 + 50).props).props),
        React.createElement(TextInput, elProps(pathTo('t3')).label('t3').props),
    )
}
`)
})

test('generates Text elements with multiline content', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there!\nHow are you?\nToday',
                    styles: {fontSize: 36, fontFamily: 'Cat', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 33}}),
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).styles(elProps(pathTo('Text1.Styles')).fontSize(36).fontFamily('Cat').color('red').backgroundColor('green').border(10).borderColor('black').width(100).height(200).marginBottom(33).props).content(\`Hi there!
How are you?
Today\`).props),
    )
}
`)
})

test('generates Text elements with placeholders', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there @Comp1@ and @Comp2@!'},
                    [
                        new TextInput('ti1', 'Comp 1', {}),
                        new Button('b1', 'Comp 2', {content: 'Click here'})
                    ]
                )
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement, TextInput, Button} = Elemento.components
    const _state = Elemento.useGetStore()
    const Comp1 = _state.setObject(pathTo('Comp1'), new TextInput.State(stateProps(pathTo('Comp1')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there @Comp1@ and @Comp2@!').props,
            React.createElement(TextInput, elProps(pathTo('Comp1')).label('Comp 1').props),
            React.createElement(Button, elProps(pathTo('Comp2')).content('Click here').appearance('outline').props),
    ),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there \\'Doctor\\' How are you?').props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, NumberInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const t1 = _state.setObject(pathTo('t1'), new NumberInput.State(stateProps(pathTo('t1')).value(44).props))
    const t2 = _state.setObject(pathTo('t2'), new NumberInput.State(stateProps(pathTo('t2')).value(22 + 33).props))
    const t3 = _state.setObject(pathTo('t3'), new NumberInput.State(stateProps(pathTo('t3')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(NumberInput, elProps(pathTo('t1')).label('Number Input One').props),
        React.createElement(NumberInput, elProps(pathTo('t2')).label('t2').props),
        React.createElement(NumberInput, elProps(pathTo('t3')).label('t3').props),
    )
}
`)
})

test('generates DateInput elements with initial value', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new DateInput('id1', 't1', {initialValue: new Date('2022-04-05'), label: "Date Input One"}),
            new DateInput('id2', 't2', {initialValue: ex`DateVal('2022-02-03')`}),
            new DateInput('id3', 't3', {}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, DateInput} = Elemento.components
    const {DateVal} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const t1 = _state.setObject(pathTo('t1'), new DateInput.State(stateProps(pathTo('t1')).value(new Date('2022-04-05T00:00:00.000Z')).props))
    const t2 = _state.setObject(pathTo('t2'), new DateInput.State(stateProps(pathTo('t2')).value(DateVal('2022-02-03')).props))
    const t3 = _state.setObject(pathTo('t3'), new DateInput.State(stateProps(pathTo('t3')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(DateInput, elProps(pathTo('t1')).label('Date Input One').props),
        React.createElement(DateInput, elProps(pathTo('t2')).label('t2').props),
        React.createElement(DateInput, elProps(pathTo('t3')).label('t3').props),
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
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, SpeechInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const t1 = _state.setObject(pathTo('t1'), new SpeechInput.State(stateProps(pathTo('t1')).language('fr').expectedPhrases(['One', 'Two']).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(SpeechInput, elProps(pathTo('t1')).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, SelectInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const Select1 = _state.setObject(pathTo('Select1'), new SelectInput.State(stateProps(pathTo('Select1')).value('44').props))
    const Select2 = _state.setObject(pathTo('Select2'), new SelectInput.State(stateProps(pathTo('Select2')).value(4+'4').props))
    const Select3 = _state.setObject(pathTo('Select3'), new SelectInput.State(stateProps(pathTo('Select3')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(SelectInput, elProps(pathTo('Select1')).label('Select Input One').values(['22', '33', '44']).props),
        React.createElement(SelectInput, elProps(pathTo('Select2')).label('Select2').values(['22', '33', '44']).props),
        React.createElement(SelectInput, elProps(pathTo('Select3')).label('Select3').values([]).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TrueFalseInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const t1 = _state.setObject(pathTo('t1'), new TrueFalseInput.State(stateProps(pathTo('t1')).value(true).props))
    const t2 = _state.setObject(pathTo('t2'), new TrueFalseInput.State(stateProps(pathTo('t2')).value(true || false).props))
    const t3 = _state.setObject(pathTo('t3'), new TrueFalseInput.State(stateProps(pathTo('t3')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TrueFalseInput, elProps(pathTo('t1')).label('True False Input One').props),
        React.createElement(TrueFalseInput, elProps(pathTo('t2')).label('t2').props),
        React.createElement(TrueFalseInput, elProps(pathTo('t3')).label('t3').props),
    )
}
`)
})

test('generates Button elements with properties including await in action', ()=> {
    const actionExpr = ex`const message = "You clicked me!"; await Log(message)
    Log("Didn't you?")`
    const actionExprWithForEach = ex`let newWords = JSON.parse('some json');
    ForEach(newWords, Add(Words, $item));`
    const app = new App('app1', 'test1', {}, [
        new Collection('id3', 'Words', {}),
        new Page('p1', 'Page 1', {}, [
            new Button('id1', 'b1', {content: 'Click here!', action: actionExpr, appearance: ex`22 && "filled"`, show: false}),
            new Button('id2', 'b2', {content: 'Do it all!', action: actionExprWithForEach}),
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Button} = Elemento.components
    const {Log, ForEach} = Elemento.globalFunctions
    const {Add} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const Words = _state.useObject('test1.Words')
    const b1_action = React.useCallback(wrapFn(pathTo('b1'), 'action', async () => {
        const message = 'You clicked me!'; await Log(message)
            Log('Didn\\'t you?')
    }), [])
    const b2_action = React.useCallback(wrapFn(pathTo('b2'), 'action', async () => {
        let newWords = await JSON.parse('some json');
            ForEach(newWords, async ($item, $index) => await Add(Words, $item))
    }), [])
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Button, elProps(pathTo('b1')).content('Click here!').appearance(22 && 'filled').show(false).action(b1_action).props),
        React.createElement(Button, elProps(pathTo('b2')).content('Do it all!').appearance('outline').action(b2_action).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, UserLogon} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(UserLogon, elProps(pathTo('b1')).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, Menu, MenuItem} = Elemento.components
    const {Log} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const Item1_action = React.useCallback(wrapFn(pathTo('Item1'), 'action', () => {
        Log('I am Item One')
    }), [])
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Menu, elProps(pathTo('Menu1')).label('Stuff to do').filled(true).props,
            React.createElement(MenuItem, elProps(pathTo('Item1')).label('Do it').action(Item1_action).props),
            React.createElement(MenuItem, elProps(pathTo('Item2')).label('Say it').props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, Data} = Elemento.components
    const _state = Elemento.useGetStore()
    const t1 = _state.setObject(pathTo('t1'), new Data.State(stateProps(pathTo('t1')).value(44).props))
    const t2 = _state.setObject(pathTo('t2'), new Data.State(stateProps(pathTo('t2')).value(({a:10, b: 'Bee'})).props))
    const t3 = _state.setObject(pathTo('t3'), new Data.State(stateProps(pathTo('t3')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Data, elProps(pathTo('t1')).display(false).props),
        React.createElement(Data, elProps(pathTo('t2')).display(true).props),
        React.createElement(Data, elProps(pathTo('t3')).display(false).props),
    )
}
`)
    expect(output.errors).toStrictEqual({})
})

test('generates Calculation elements with initial value and no errors on object expressions', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Calculation('id1', 't1', {calculation: ex`44 + 7`}),
                new Calculation('id2', 't2', {calculation: ex`{a:10, b: "Bee"}`, show: true, label: 'My Calc', styles: {width: ex`3+100`}}),
                new Calculation('id3', 't3', {}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Calculation} = Elemento.components
    const _state = Elemento.useGetStore()
    const t1 = _state.setObject(pathTo('t1'), new Calculation.State(stateProps(pathTo('t1')).value(44 + 7).props))
    const t2 = _state.setObject(pathTo('t2'), new Calculation.State(stateProps(pathTo('t2')).value(({a:10, b: 'Bee'})).props))
    const t3 = _state.setObject(pathTo('t3'), new Calculation.State(stateProps(pathTo('t3')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Calculation, elProps(pathTo('t1')).props),
        React.createElement(Calculation, elProps(pathTo('t2')).label('My Calc').show(true).styles(elProps(pathTo('t2.Styles')).width(3+100).props).props),
        React.createElement(Calculation, elProps(pathTo('t3')).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, Collection} = Elemento.components
    const _state = Elemento.useGetStore()
    const Store1 = _state.useObject('test1.Store1')
    const t1 = _state.setObject(pathTo('t1'), new Collection.State(stateProps(pathTo('t1')).dataStore(Store1).collectionName('Widgets').props))
    const t2 = _state.setObject(pathTo('t2'), new Collection.State(stateProps(pathTo('t2')).value(['red', 'yellow']).collectionName('t2').props))
    const t3 = _state.setObject(pathTo('t3'), new Collection.State(stateProps(pathTo('t3')).collectionName('t3').props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Collection, elProps(pathTo('t1')).display(false).props),
        React.createElement(Collection, elProps(pathTo('t2')).display(true).props),
        React.createElement(Collection, elProps(pathTo('t3')).display(false).props),
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
    const project = Project.new([app, serverApp], 'The Project', 'proj1', {})

    const output = new Generator(app, project).output()

    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Button} = Elemento.components
    const _state = Elemento.useGetStore()
    const Connector1 = _state.useObject('App1.Connector1')
    const DoItButton_action = React.useCallback(wrapFn(pathTo('DoItButton'), 'action', async () => {
        await Connector1.DoStuff('Number1')
    }), [])
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Button, elProps(pathTo('DoItButton')).content('Go on, do it!').appearance('outline').action(DoItButton_action).props),
    )
}
`)

    expect(output.files[1].name).toBe('appMain.js')
    expect(output.files[1].contents).toBe(`function configServerApp1() {
    return {
        appName: 'Server App 1',
        url: '/capi/:versionId/ServerApp1',

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
    const pathTo = name => 'App1' + '.' + name
    const {App, ServerAppConnector} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))
    const Connector1 = _state.setObject('App1.Connector1', new ServerAppConnector.State({configuration: configServerApp1()}))

    return React.createElement(App, {...elProps('App1').props},)
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
    const project = Project.new([app, serverApp], 'The Project', 'proj1', {})

    const output = new Generator(app, project).output()
    expect(output.files[1].contents).toBe(`function configServerApp1() {
    return {
        appName: 'Server App 1',
        url: '/capi/:versionId/ServerApp1',

        functions: {
            GetWidget: {
                params: ['id']
            }
        }
    };
}

export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const {App, ServerAppConnector} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))
    const ServerApp1 = _state.setObject('App1.ServerApp1', new ServerAppConnector.State({configuration: configServerApp1()}))

    return React.createElement(App, {...elProps('App1').props},)
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
    const project = Project.new([app, serverApp], 'The Project', 'proj1', {})

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
    const pathTo = name => 'App1' + '.' + name
    const {App, ServerAppConnector} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))
    const Connector1 = _state.setObject('App1.Connector1', new ServerAppConnector.State({configuration: configServerApp1()}))

    return React.createElement(App, {...elProps('App1').props},)
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
    const project = Project.new([app, serverApp], 'The Project', 'proj1', {})

    const output = new Generator(app, project).output()

    expect(output.files[1].contents).toBe(`function configServerApp() {
    return Elemento.codeGenerationError(\`'ServerAppX'\`, 'Unknown name');
}

export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const {App, ServerAppConnector} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))
    const Connector1 = _state.setObject('App1.Connector1', new ServerAppConnector.State({configuration: configServerApp()}))

    return React.createElement(App, {...elProps('App1').props},)
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
    const project = Project.new([app, serverApp], 'The Project', 'proj1', {})

    const output = new Generator(app, project).output()

    expect(output.files[1].contents).toBe(`function configServerApp() {
    return {};
}

export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const {App, ServerAppConnector} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))
    const Connector1 = _state.setObject('App1.Connector1', new ServerAppConnector.State({configuration: configServerApp()}))

    return React.createElement(App, {...elProps('App1').props},)
}
`)

})

test('sorts state entries into dependency order', () => {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('ti1', 'Description', {initialValue: ex`TheWidget.Description`}),
            new Data('id3', 'The Widget', {initialValue: ex`WidgetId.value && Get(Widgets, WidgetId.value)`}),
            new Data('id2', 'Widget Id', {initialValue: ex`WidgetSet.selectedItem && WidgetSet.selectedItem.id`}),
            new Collection('id1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
            new ItemSet('id4', 'Widget Set', {items: ex`Widgets.Query({})`}, [new Text('lt1', 'Desc', {content: 'Hi!'})]),
            ]
        ),
        new FileDataStore('fds1', 'Store1', {})
    ])

    const output = new Generator(app, project(app)).output()

    expect(output.files[0].contents).toBe(`const Page1_WidgetSetItem = React.memo(function Page1_WidgetSetItem(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const {ItemSetItem, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    const canDragItem = undefined
    const styles = undefined

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Desc')).content('Hi!').props),
    )
})


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextInput, Data, Collection, ItemSet} = Elemento.components
    const {Get} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const Store1 = _state.useObject('test1.Store1')
    const Widgets = _state.setObject(pathTo('Widgets'), new Collection.State(stateProps(pathTo('Widgets')).dataStore(Store1).collectionName('Widgets').props))
    const WidgetSet = _state.setObject(pathTo('WidgetSet'), new ItemSet.State(stateProps(pathTo('WidgetSet')).items(Widgets.Query({})).props))
    const WidgetId = _state.setObject(pathTo('WidgetId'), new Data.State(stateProps(pathTo('WidgetId')).value(WidgetSet.selectedItem && WidgetSet.selectedItem.id).props))
    const TheWidget = _state.setObject(pathTo('TheWidget'), new Data.State(stateProps(pathTo('TheWidget')).value(WidgetId.value && Get(Widgets, WidgetId.value)).props))
    const Description = _state.setObject(pathTo('Description'), new TextInput.State(stateProps(pathTo('Description')).value(TheWidget.Description).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('Description')).label('Description').props),
        React.createElement(Data, elProps(pathTo('TheWidget')).display(false).props),
        React.createElement(Data, elProps(pathTo('WidgetId')).display(false).props),
        React.createElement(Collection, elProps(pathTo('Widgets')).display(false).props),
        React.createElement(ItemSet, elProps(pathTo('WidgetSet')).itemContentComponent(Page1_WidgetSetItem).props),
    )
}
`)
    expect(output.errors).toStrictEqual({})

})

test('sorts state entries into dependency order when nested inside a layout element', () => {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('ti1', 'Description', {initialValue: ex`TheWidget.Description`}),
            new Data('id3', 'The Widget', {initialValue: ex`WidgetId.value && Get(Widgets, WidgetId.value)`}),
            new Data('id2', 'Widget Id', {initialValue: ex`WidgetSet.selectedItem && WidgetSet.selectedItem.id`}),
            new Collection('id1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
            new List('ls1', 'List 1', {}, [
                new ItemSet('id4', 'Widget Set', {items: ex`Widgets.Query({})`}, [new Text('lt1', 'Desc', {content: 'Hi!'})])
            ])
        ]),
        new FileDataStore('fds1', 'Store1', {})
    ])

    const output = new Generator(app, project(app)).output()

    expect(output.files[0].contents).toBe(`const Page1_WidgetSetItem = React.memo(function Page1_WidgetSetItem(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const {ItemSetItem, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    const canDragItem = undefined
    const styles = undefined

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Desc')).content('Hi!').props),
    )
})


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextInput, Data, Collection, ListElement, ItemSet} = Elemento.components
    const {Get} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const Store1 = _state.useObject('test1.Store1')
    const Widgets = _state.setObject(pathTo('Widgets'), new Collection.State(stateProps(pathTo('Widgets')).dataStore(Store1).collectionName('Widgets').props))
    const List1 = _state.setObject(pathTo('List1'), new ListElement.State(stateProps(pathTo('List1')).props))
    const WidgetSet = _state.setObject(pathTo('WidgetSet'), new ItemSet.State(stateProps(pathTo('WidgetSet')).items(Widgets.Query({})).props))
    const WidgetId = _state.setObject(pathTo('WidgetId'), new Data.State(stateProps(pathTo('WidgetId')).value(WidgetSet.selectedItem && WidgetSet.selectedItem.id).props))
    const TheWidget = _state.setObject(pathTo('TheWidget'), new Data.State(stateProps(pathTo('TheWidget')).value(WidgetId.value && Get(Widgets, WidgetId.value)).props))
    const Description = _state.setObject(pathTo('Description'), new TextInput.State(stateProps(pathTo('Description')).value(TheWidget.Description).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('Description')).label('Description').props),
        React.createElement(Data, elProps(pathTo('TheWidget')).display(false).props),
        React.createElement(Data, elProps(pathTo('WidgetId')).display(false).props),
        React.createElement(Collection, elProps(pathTo('Widgets')).display(false).props),
        React.createElement(ListElement, elProps(pathTo('List1')).props,
            React.createElement(ItemSet, elProps(pathTo('WidgetSet')).itemContentComponent(Page1_WidgetSetItem).props),
    ),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement, NumberInput} = Elemento.components
    const {Get} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const Widgets = _state.useObject('App1.Widgets')
    const WidgetValue = _state.setObject(pathTo('WidgetValue'), new NumberInput.State(stateProps(pathTo('WidgetValue')).value(Get(Widgets, 'x1').a).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Update the widget').props),
        React.createElement(NumberInput, elProps(pathTo('WidgetValue')).label('New widget value').props),
    )
}
`)

    expect(output.files[1].contents).toBe(`export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const {App, Collection, MemoryDataStore, FileDataStore, BrowserDataStore, FirestoreDataStore} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))
    const [Store1] = React.useState(new MemoryDataStore(stateProps(pathTo('Store1')).value(({ Widgets: { x1: {a: 10}}})).props))
    const Widgets = _state.setObject('App1.Widgets', new Collection.State(stateProps('App1.Widgets').dataStore(Store1).collectionName('Widgets').props))
    const Store2 = _state.setObject('App1.Store2', new FileDataStore.State(stateProps('App1.Store2').props))
    const Store3 = _state.setObject('App1.Store3', new BrowserDataStore.State(stateProps('App1.Store3').databaseName('Accounts').collectionNames(['Cheques', 'Postings']).props))
    const Store4 = _state.setObject('App1.Store4', new FirestoreDataStore.State(stateProps('App1.Store4').collections(\`Cheques: userPrivate
Postings: creator, techs\`).props))

    return React.createElement(App, {...elProps('App1').props},
        React.createElement(Collection, elProps(pathTo('Widgets')).display(false).props)
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement, NumberInput} = Elemento.components
    const {Get} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const Widgets = _state.useObject('App1.Widgets')
    const WidgetValue = _state.setObject(pathTo('WidgetValue'), new NumberInput.State(stateProps(pathTo('WidgetValue')).value(Get(Widgets, 'x1').a).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Update the widget').props),
        React.createElement(NumberInput, elProps(pathTo('WidgetValue')).label('New widget value').props),
    )
}
`)

    expect(output.files[1].contents).toBe(`export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const {App, Collection, MemoryDataStore} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))
    const [Store1] = React.useState(new MemoryDataStore(stateProps(pathTo('Store1')).value(({ Widgets: { x1: {a: 10}}})).props))
    const Widgets = _state.setObject('App1.Widgets', new Collection.State(stateProps('App1.Widgets').dataStore(Elemento.codeGenerationError(\`StoreX\`, 'Unknown names: StoreX')).collectionName('Widgets').props))

    return React.createElement(App, {...elProps('App1').props},
        React.createElement(Collection, elProps(pathTo('Widgets')).display(false).props)
    )
}
`)

    expect(output.errors).toStrictEqual({
        coll1: {
            dataStore: 'Unknown names: StoreX'
        }
    })
})

test('generates ItemSet element with separate child component and global functions and select action', ()=> {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('id4', 'Text Input 1', {}),
            new SelectInput('id5', 'Item Color', {}),
            new Data('id6', 'Data 1', {initialValue: 10}),
            new Block('la1', 'Layout 1', {}, [
                new ItemSet('is1', 'Item Set 1', {items: [{a: 10}, {a: 20}], canDragItem: ex`\$item.id + Data1 !== Floor(99.9)`,
                    itemStyles: {color: ex`\$selected ? 'red' : ItemColor`, width: 200}, selectAction: ex`Log(\$item.id)`}, [
                    new Text('t1', 'Text 1', {content: ex`"Hi there " + TextInput2 + " in " + TextInput1 + $itemId`}),
                    new TextInput('id2', 'Text Input 2', {initialValue: ex`"from " + Left($item, 3)`}),
                    new Button('id3', 'Button Update', {content: 'Update', action: ex`Update('Things', \$item.id, {done: true})`}),
                ])
            ])
            ]
        ),
    ])

    const gen = new Generator(app, project(app))

    expect(gen.output().files[0].contents).toBe(`const Page1_ItemSet1Item = React.memo(function Page1_ItemSet1Item(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const {ItemSetItem, TextElement, TextInput, Button} = Elemento.components
    const {Floor, Left} = Elemento.globalFunctions
    const {Update} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const ItemColor = _state.useObject(parentPathWith('ItemColor'))
    const Data1 = _state.useObject(parentPathWith('Data1'))
    const TextInput1 = _state.useObject(parentPathWith('TextInput1'))
    const TextInput2 = _state.setObject(pathTo('TextInput2'), new TextInput.State(stateProps(pathTo('TextInput2')).value('from ' + Left($item, 3)).props))
    const ButtonUpdate_action = React.useCallback(wrapFn(pathTo('ButtonUpdate'), 'action', async () => {
        await Update('Things', \$item.id, {done: true})
    }), [$item])
    const canDragItem = $item.id + Data1 !== Floor(99.9)
    const styles = elProps(pathTo('ItemSet1.Styles')).color($selected ? 'red' : ItemColor).width(200).props

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there ' + TextInput2 + ' in ' + TextInput1 + $itemId).props),
        React.createElement(TextInput, elProps(pathTo('TextInput2')).label('Text Input 2').props),
        React.createElement(Button, elProps(pathTo('ButtonUpdate')).content('Update').appearance('outline').action(ButtonUpdate_action).props),
    )
})


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextInput, SelectInput, Data, Block, ItemSet} = Elemento.components
    const {Log, Floor} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const TextInput1 = _state.setObject(pathTo('TextInput1'), new TextInput.State(stateProps(pathTo('TextInput1')).props))
    const ItemColor = _state.setObject(pathTo('ItemColor'), new SelectInput.State(stateProps(pathTo('ItemColor')).props))
    const Data1 = _state.setObject(pathTo('Data1'), new Data.State(stateProps(pathTo('Data1')).value(10).props))
    const Layout1 = _state.setObject(pathTo('Layout1'), new Block.State(stateProps(pathTo('Layout1')).props))
    const ItemSet1_selectAction = React.useCallback(wrapFn(pathTo('ItemSet1'), 'selectAction', ($item, $itemId, $index) => {
        Log($item.id)
    }), [])
    const ItemSet1 = _state.setObject(pathTo('ItemSet1'), new ItemSet.State(stateProps(pathTo('ItemSet1')).items([{a: 10}, {a: 20}]).selectAction(ItemSet1_selectAction).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('TextInput1')).label('Text Input 1').props),
        React.createElement(SelectInput, elProps(pathTo('ItemColor')).label('Item Color').props),
        React.createElement(Data, elProps(pathTo('Data1')).display(false).props),
        React.createElement(Block, elProps(pathTo('Layout1')).layout('vertical').props,
            React.createElement(ItemSet, elProps(pathTo('ItemSet1')).itemContentComponent(Page1_ItemSet1Item).props),
    ),
    )
}
`)
})

test('generates ItemSet element inside List', ()=> {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('id4', 'Text Input 1', {}),
            new List('l1', 'List 1', {}, [
                new ItemSet('is1', 'Item Set 1', {items: [{a: 10}, {a: 20}], itemStyles: {color: 'red', width: 200}, selectAction: ex`Log(\$item.id)`}, [
                    new Text('t1', 'Text 1', {content: ex`"Hi there " + TextInput2 + " in " + TextInput1`}),
                    new TextInput('id2', 'Text Input 2', {initialValue: ex`"from " + Left($item, 3)`}),
                    new Button('id3', 'Button Update', {content: 'Update', action: ex`Update('Things', \$item.id, {done: true})`}),
                ])
            ])
            ]
        ),
    ])

    const gen = new Generator(app, project(app))

    expect(gen.output().files[0].contents).toBe(`const Page1_ItemSet1Item = React.memo(function Page1_ItemSet1Item(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const {ItemSetItem, TextElement, TextInput, Button} = Elemento.components
    const {Left} = Elemento.globalFunctions
    const {Update} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const TextInput1 = _state.useObject(parentPathWith('TextInput1'))
    const TextInput2 = _state.setObject(pathTo('TextInput2'), new TextInput.State(stateProps(pathTo('TextInput2')).value('from ' + Left($item, 3)).props))
    const ButtonUpdate_action = React.useCallback(wrapFn(pathTo('ButtonUpdate'), 'action', async () => {
        await Update('Things', \$item.id, {done: true})
    }), [\$item])
    const canDragItem = undefined
    const styles = elProps(pathTo('ItemSet1.Styles')).color('red').width(200).props

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there ' + TextInput2 + ' in ' + TextInput1).props),
        React.createElement(TextInput, elProps(pathTo('TextInput2')).label('Text Input 2').props),
        React.createElement(Button, elProps(pathTo('ButtonUpdate')).content('Update').appearance('outline').action(ButtonUpdate_action).props),
    )
})


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextInput, ListElement, ItemSet} = Elemento.components
    const {Log} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const TextInput1 = _state.setObject(pathTo('TextInput1'), new TextInput.State(stateProps(pathTo('TextInput1')).props))
    const List1 = _state.setObject(pathTo('List1'), new ListElement.State(stateProps(pathTo('List1')).props))
    const ItemSet1_selectAction = React.useCallback(wrapFn(pathTo('ItemSet1'), 'selectAction', ($item, $itemId, $index) => {
        Log($item.id)
    }), [])
    const ItemSet1 = _state.setObject(pathTo('ItemSet1'), new ItemSet.State(stateProps(pathTo('ItemSet1')).items([{a: 10}, {a: 20}]).selectAction(ItemSet1_selectAction).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('TextInput1')).label('Text Input 1').props),
        React.createElement(ListElement, elProps(pathTo('List1')).props,
            React.createElement(ItemSet, elProps(pathTo('ItemSet1')).itemContentComponent(Page1_ItemSet1Item).props),
    ),
    )
}
`)
})

test('generates ItemSet element with no items expression if undefined', ()=> {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 2', {}, [
            // @ts-ignore
            new ItemSet('is1', 'Item Set 1', {items: undefined, selectable: false}, [
                new Text('id1', 'Text 1', {content: 'Hi there!'}),
            ])
            ]
        ),
    ])

    const gen = new Generator(app, project(app))

    expect(gen.output().files[0].contents).toBe(`const Page2_ItemSet1Item = React.memo(function Page2_ItemSet1Item(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const {ItemSetItem, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    const canDragItem = undefined
    const styles = undefined

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there!').props),
    )
})


function Page2(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, ItemSet} = Elemento.components
    const _state = Elemento.useGetStore()
    const ItemSet1 = _state.setObject(pathTo('ItemSet1'), new ItemSet.State(stateProps(pathTo('ItemSet1')).selectable(false).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(ItemSet, elProps(pathTo('ItemSet1')).itemContentComponent(Page2_ItemSet1Item).props),
    )
}
`)

})

test('generates Block element with properties and children and includes drag functions if needed', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new NumberInput('n1', 'Widget Count', {initialValue: ex`18`, label: 'New widget value'}),
            new Block('lay1', 'Layout 1', {layout: 'horizontal wrapped', styles: {width: 500, backgroundColor: 'pink'}}, [
                new Text('text1', 'T1', {content: ex`23 + 45`}),
                new TextInput('input1', 'Name Input', {}),
                new SelectInput('select1', 'Colour', {values: ['red', 'green']}),
                new Button('b1', 'B1', {content: 'Click here!'}),
            ]),
            new Text('text2', 'T2', {content: ex`If(DragIsOver(Layout1) && DraggedItemId == 'blue', 'Drag', '')`})
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {DragIsOver, DraggedItemId} = Elemento.dragFunctions()
    const {Page, NumberInput, Block, TextElement, TextInput, SelectInput, Button} = Elemento.components
    const {If} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const WidgetCount = _state.setObject(pathTo('WidgetCount'), new NumberInput.State(stateProps(pathTo('WidgetCount')).value(18).props))
    const Layout1 = _state.setObject(pathTo('Layout1'), new Block.State(stateProps(pathTo('Layout1')).props))
    const NameInput = _state.setObject(pathTo('NameInput'), new TextInput.State(stateProps(pathTo('NameInput')).props))
    const Colour = _state.setObject(pathTo('Colour'), new SelectInput.State(stateProps(pathTo('Colour')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(NumberInput, elProps(pathTo('WidgetCount')).label('New widget value').props),
        React.createElement(Block, elProps(pathTo('Layout1')).layout('horizontal wrapped').styles(elProps(pathTo('Layout1.Styles')).width(500).backgroundColor('pink').props).props,
            React.createElement(TextElement, elProps(pathTo('T1')).content(23 + 45).props),
            React.createElement(TextInput, elProps(pathTo('NameInput')).label('Name Input').props),
            React.createElement(SelectInput, elProps(pathTo('Colour')).label('Colour').values(['red', 'green']).props),
            React.createElement(Button, elProps(pathTo('B1')).content('Click here!').appearance('outline').props),
    ),
        React.createElement(TextElement, elProps(pathTo('T2')).content(If(DragIsOver(Layout1) && DraggedItemId == 'blue', 'Drag', '')).props),
    )
}
`)
})

test('generates Dialog element with properties and children', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Dialog('dlg1', 'Dialog 1', {initiallyOpen: true, styles: {width: 500, backgroundColor: 'pink'}}, [
                new Text('text1', 'T1', {content: ex`23 + 45`}),
                new TextInput('input1', 'Name Input', {}),
            ]),
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Dialog, TextElement, TextInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const Dialog1 = _state.setObject(pathTo('Dialog1'), new Dialog.State(stateProps(pathTo('Dialog1')).initiallyOpen(true).props))
    const NameInput = _state.setObject(pathTo('NameInput'), new TextInput.State(stateProps(pathTo('NameInput')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Dialog, elProps(pathTo('Dialog1')).styles(elProps(pathTo('Dialog1.Styles')).width(500).backgroundColor('pink').props).props,
            React.createElement(TextElement, elProps(pathTo('T1')).content(23 + 45).props),
            React.createElement(TextInput, elProps(pathTo('NameInput')).label('Name Input').props),
    ),
    )
}
`)
})

test('generates simple Form element with separate child component and includes Data but not Calculation', ()=> {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Form('form1', 'Details Form', {initialValue: ex`{TextInput2: 'foo', NumberInput1: 27}`},
                    [
                    new TextInput('id2', 'Text Input 2', {}),
                        new NumberInput('id3', 'Number Input 1', {initialValue: ex`5 + 3`}),
                        new Calculation('id4', 'Calculation 1', { calculation: ex`1 + 2`}),
                        new Data('id5', 'Data 1', { initialValue: ex`1 + 2`}),
                    ])
            ]
        ),
    ])

    const gen = new Generator(app, project(app))

    expect(gen.output().files[0].contents).toBe(`function Page1_DetailsForm(props) {
    const pathTo = name => props.path + '.' + name
    const {Form, TextInput, NumberInput, Calculation, Data} = Elemento.components
    const _state = Elemento.useGetStore()
    const \$form = _state.useObject(props.path)
    const TextInput2 = _state.setObject(pathTo('TextInput2'), new TextInput.State(stateProps(pathTo('TextInput2')).value(\$form.originalValue?.TextInput2).props))
    const NumberInput1 = _state.setObject(pathTo('NumberInput1'), new NumberInput.State(stateProps(pathTo('NumberInput1')).value(5 + 3).props))
    const Calculation1 = _state.setObject(pathTo('Calculation1'), new Calculation.State(stateProps(pathTo('Calculation1')).value(1 + 2).props))
    const Data1 = _state.setObject(pathTo('Data1'), new Data.State(stateProps(pathTo('Data1')).value(1 + 2).props))
    \$form._updateValue()

    return React.createElement(Form, props,
        React.createElement(TextInput, elProps(pathTo('TextInput2')).label('Text Input 2').props),
        React.createElement(NumberInput, elProps(pathTo('NumberInput1')).label('Number Input 1').props),
        React.createElement(Calculation, elProps(pathTo('Calculation1')).props),
        React.createElement(Data, elProps(pathTo('Data1')).display(false).props),
    )
}


Page1_DetailsForm.State = class Page1_DetailsForm_State extends Elemento.components.BaseFormState {
    ownFieldNames = ['TextInput2', 'NumberInput1', 'Data1']
}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page} = Elemento.components
    const _state = Elemento.useGetStore()
    const DetailsForm = _state.setObject(pathTo('DetailsForm'), new Page1_DetailsForm.State(stateProps(pathTo('DetailsForm')).value(({TextInput2: 'foo', NumberInput1: 27})).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Page1_DetailsForm, elProps(pathTo('DetailsForm')).label('Details Form').horizontal(false).wrap(false).props),
    )
}
`)
})

test('generates nested Form elements', ()=> {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Form('form1', 'Details Form', {initialValue: ex`{TextInput2: 'foo', NumberInput1: 27, FurtherDetails: {Description: 'Long', Size: 77}}`},
                    [
                        new TextInput('id2', 'Text Input 2', {}),
                        new NumberInput('id3', 'Number Input 1', {initialValue: ex`5 + 3`}),
                        new Form('form2', 'Further Details', {horizontal: true}, [
                            new TextInput('ti2', 'Description', {}),
                            new NumberInput('ni2', 'Size', {}),
                        ])
                    ])
            ]
        ),
    ])

    const gen = new Generator(app, project(app))

    expect(gen.output().files[0].contents).toBe(`function DetailsForm_FurtherDetails(props) {
    const pathTo = name => props.path + '.' + name
    const {Form, TextInput, NumberInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const \$form = _state.useObject(props.path)
    const Description = _state.setObject(pathTo('Description'), new TextInput.State(stateProps(pathTo('Description')).value(\$form.originalValue?.Description).props))
    const Size = _state.setObject(pathTo('Size'), new NumberInput.State(stateProps(pathTo('Size')).value(\$form.originalValue?.Size).props))
    \$form._updateValue()

    return React.createElement(Form, props,
        React.createElement(TextInput, elProps(pathTo('Description')).label('Description').props),
        React.createElement(NumberInput, elProps(pathTo('Size')).label('Size').props),
    )
}


DetailsForm_FurtherDetails.State = class DetailsForm_FurtherDetails_State extends Elemento.components.BaseFormState {
    ownFieldNames = ['Description', 'Size']
}


function Page1_DetailsForm(props) {
    const pathTo = name => props.path + '.' + name
    const {Form, TextInput, NumberInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const \$form = _state.useObject(props.path)
    const TextInput2 = _state.setObject(pathTo('TextInput2'), new TextInput.State(stateProps(pathTo('TextInput2')).value(\$form.originalValue?.TextInput2).props))
    const NumberInput1 = _state.setObject(pathTo('NumberInput1'), new NumberInput.State(stateProps(pathTo('NumberInput1')).value(5 + 3).props))
    const FurtherDetails = _state.setObject(pathTo('FurtherDetails'), new DetailsForm_FurtherDetails.State(stateProps(pathTo('FurtherDetails')).value(\$form.originalValue?.FurtherDetails).props))
    \$form._updateValue()

    return React.createElement(Form, props,
        React.createElement(TextInput, elProps(pathTo('TextInput2')).label('Text Input 2').props),
        React.createElement(NumberInput, elProps(pathTo('NumberInput1')).label('Number Input 1').props),
        React.createElement(DetailsForm_FurtherDetails, elProps(pathTo('FurtherDetails')).label('Further Details').horizontal(true).wrap(false).props),
    )
}


Page1_DetailsForm.State = class Page1_DetailsForm_State extends Elemento.components.BaseFormState {
    ownFieldNames = ['TextInput2', 'NumberInput1', 'FurtherDetails']
}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page} = Elemento.components
    const _state = Elemento.useGetStore()
    const DetailsForm = _state.setObject(pathTo('DetailsForm'), new Page1_DetailsForm.State(stateProps(pathTo('DetailsForm')).value(({TextInput2: 'foo', NumberInput1: 27, FurtherDetails: {Description: 'Long', Size: 77}})).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Page1_DetailsForm, elProps(pathTo('DetailsForm')).label('Details Form').horizontal(false).wrap(false).props),
    )
}
`)
})

test('generates Form element with separate child component', ()=> {
    const app = new App('app1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new TextInput('id0', 'Text Input 1', {}),
                new TrueFalseInput('tf1', 'TF Input 1', {}),
                new Form('form1', 'Details Form', {initialValue: ex`{TextInput2: 'foo', NumberInput1: 27}`, label: 'The Details',
                    styles: {width: '93%'},
                        horizontal: true, wrap: false,
                        keyAction: ex`Log('You pressed', \$key, \$event.ctrlKey); If(\$key == 'Enter', DetailsForm.submit())`,
                        submitAction: ex`Log(\$data, TextInput1, TFInput1); Update('Things', '123', \$form.updates)`},
                    [
                    new TextInput('id2', 'Text Input 2', {}),
                    new Text('id1', 'Text 1', {content: ex`"Hi there " + Left(TextInput2, 2)`}),
                    new NumberInput('id3', 'Number Input 1', {initialValue: ex`5 + 3`}),
                    new Text('id5', 'Text 2', {content: ex`"Number is " + \$form.value.NumberInput1`}),
                    new Button('id4', 'Button Update', {content: 'Update', action: ex`\$form.Submit('normal')`}),
                ])
            ]
        ),
    ])

    const gen = new Generator(app, project(app))

    expect(gen.output().files[0].contents).toBe(`function Page1_DetailsForm(props) {
    const pathTo = name => props.path + '.' + name
    const {Form, TextInput, TextElement, NumberInput, Button} = Elemento.components
    const {Left} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const \$form = _state.useObject(props.path)
    const TextInput2 = _state.setObject(pathTo('TextInput2'), new TextInput.State(stateProps(pathTo('TextInput2')).value(\$form.originalValue?.TextInput2).props))
    const NumberInput1 = _state.setObject(pathTo('NumberInput1'), new NumberInput.State(stateProps(pathTo('NumberInput1')).value(5 + 3).props))
    \$form._updateValue()
    const ButtonUpdate_action = React.useCallback(wrapFn(pathTo('ButtonUpdate'), 'action', async () => {
        await \$form.Submit('normal')
    }), [\$form])

    return React.createElement(Form, props,
        React.createElement(TextInput, elProps(pathTo('TextInput2')).label('Text Input 2').props),
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there ' + Left(TextInput2, 2)).props),
        React.createElement(NumberInput, elProps(pathTo('NumberInput1')).label('Number Input 1').props),
        React.createElement(TextElement, elProps(pathTo('Text2')).content('Number is ' + \$form.value.NumberInput1).props),
        React.createElement(Button, elProps(pathTo('ButtonUpdate')).content('Update').appearance('outline').action(ButtonUpdate_action).props),
    )
}


Page1_DetailsForm.State = class Page1_DetailsForm_State extends Elemento.components.BaseFormState {
    ownFieldNames = ['TextInput2', 'NumberInput1']
}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextInput, TrueFalseInput} = Elemento.components
    const {Log, If} = Elemento.globalFunctions
    const {Update} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const TextInput1 = _state.setObject(pathTo('TextInput1'), new TextInput.State(stateProps(pathTo('TextInput1')).props))
    const TFInput1 = _state.setObject(pathTo('TFInput1'), new TrueFalseInput.State(stateProps(pathTo('TFInput1')).props))
    const DetailsForm_submitAction = React.useCallback(wrapFn(pathTo('DetailsForm'), 'submitAction', async (\$form, \$data) => {
        Log(\$data, TextInput1, TFInput1); await Update('Things', '123', \$form.updates)
    }), [TextInput1, TFInput1])
    const DetailsForm = _state.setObject(pathTo('DetailsForm'), new Page1_DetailsForm.State(stateProps(pathTo('DetailsForm')).value(({TextInput2: 'foo', NumberInput1: 27})).submitAction(DetailsForm_submitAction).props))
    const DetailsForm_keyAction = React.useCallback(wrapFn(pathTo('DetailsForm'), 'keyAction', async (\$event) => {
        const \$key = \$event.key
        Log('You pressed', \$key, \$event.ctrlKey); If(\$key == 'Enter', async () => await DetailsForm.submit())
    }), [])
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('TextInput1')).label('Text Input 1').props),
        React.createElement(TrueFalseInput, elProps(pathTo('TFInput1')).label('TF Input 1').props),
        React.createElement(Page1_DetailsForm, elProps(pathTo('DetailsForm')).label('The Details').horizontal(true).wrap(false).keyAction(DetailsForm_keyAction).styles(elProps(pathTo('DetailsForm.Styles')).width('93%').props).props),
    )
}
`)
})

test('generates user defined component and instance', () => {

    const compDef = new ComponentDef('c1', 'My Component', {input1: 'source', input2: 'destination'},[
        new Text('id1', 'Text 1', {content: ex`"From " + props.source`}),
        new Text('id2', 't2', {content: ex`"To " + props.destination`}),
    ])

    const componentFolder = new ComponentFolder(COMPONENTS_ID, 'Components', {}, [compDef])
    const app = new App('app1', 'App 1', {maxWidth: '60%'}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id3', 'Text 3', {content: 'Over here!'}),
                new ComponentInstance('id4', 'A Component', {componentType: compDef.codeName, source: 'Here', destination: 'There', styles: {color: 'blue'}, show: true}),
            ]
        )])

    const gen = new Generator(app, project(app, componentFolder))

    expect(gen.output().files[0].name).toBe('MyComponent.js')
    expect(gen.output().files[0].contents).toBe(`function MyComponent(props) {
    const pathTo = name => props.path + '.' + name
    const {ComponentElement, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()

    return React.createElement(ComponentElement, props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('From ' + props.source).props),
        React.createElement(TextElement, elProps(pathTo('t2')).content('To ' + props.destination).props),
    )
}
`)

    expect(gen.output().files[1].name).toBe('Page1.js')
    expect(gen.output().files[1].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text3')).content('Over here!').props),
        React.createElement(MyComponent, elProps(pathTo('AComponent')).source('Here').destination('There').show(true).styles(elProps(pathTo('AComponent.Styles')).color('blue').props).props),
    )
}
`)

    expect(gen.output().files[2].name).toBe('appMain.js')
    expect(gen.output().files[2].contents).toBe(`export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const {App} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('App1', new App.State({pages, appContext}))

    return React.createElement(App, {...elProps('App1').maxWidth('60%').props},)
}
`)

})

test('transforms expressions to functions where needed and does not fail where no expression present', () => {
    const app = new App('app1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Data('d1', 'TallWidgets', {initialValue: ex`Select(Widgets.getAllData(), $item.height > $index)`}),
                new Data('d2', 'TallerWidgets', {initialValue: ex`ForEach(Widgets.getAllData(), $item.height + 10)`}),
                new Data('d2a', 'FixedWidgets', {initialValue: ex`ForEach(Widgets.getAllData(), 99)`}),
                new Data('d3', 'NoWidgets', {initialValue: ex`Select(Widgets.getAllData())`}),
                new Data('d4', 'CountNoCondition', {initialValue: ex`Count(Widgets.getAllData())`}),
                new Data('d5', 'IfPlainValues', {initialValue: ex`If(true, 1, Date)`}),
                new Data('d6', 'IfOneArg', {initialValue: ex`If(false, Sum(10, 20))`}),
                new Data('d7', 'IfTwoArgs', {initialValue: ex`If(false, 2, Sum(10, 20))`}),
            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Data} = Elemento.components
    const {Select, ForEach, Count, If, Sum} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const Widgets = _state.useObject('App1.Widgets')
    const TallWidgets = _state.setObject(pathTo('TallWidgets'), new Data.State(stateProps(pathTo('TallWidgets')).value(Select(Widgets.getAllData(), ($item, $index) => $item.height > $index)).props))
    const TallerWidgets = _state.setObject(pathTo('TallerWidgets'), new Data.State(stateProps(pathTo('TallerWidgets')).value(ForEach(Widgets.getAllData(), ($item, $index) => $item.height + 10)).props))
    const FixedWidgets = _state.setObject(pathTo('FixedWidgets'), new Data.State(stateProps(pathTo('FixedWidgets')).value(ForEach(Widgets.getAllData(), ($item, $index) => 99)).props))
    const NoWidgets = _state.setObject(pathTo('NoWidgets'), new Data.State(stateProps(pathTo('NoWidgets')).value(Select(Widgets.getAllData())).props))
    const CountNoCondition = _state.setObject(pathTo('CountNoCondition'), new Data.State(stateProps(pathTo('CountNoCondition')).value(Count(Widgets.getAllData())).props))
    const IfPlainValues = _state.setObject(pathTo('IfPlainValues'), new Data.State(stateProps(pathTo('IfPlainValues')).value(If(true, 1, Date)).props))
    const IfOneArg = _state.setObject(pathTo('IfOneArg'), new Data.State(stateProps(pathTo('IfOneArg')).value(If(false, () => Sum(10, 20))).props))
    const IfTwoArgs = _state.setObject(pathTo('IfTwoArgs'), new Data.State(stateProps(pathTo('IfTwoArgs')).value(If(false, 2, () => Sum(10, 20))).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Data, elProps(pathTo('TallWidgets')).display(false).props),
        React.createElement(Data, elProps(pathTo('TallerWidgets')).display(false).props),
        React.createElement(Data, elProps(pathTo('FixedWidgets')).display(false).props),
        React.createElement(Data, elProps(pathTo('NoWidgets')).display(false).props),
        React.createElement(Data, elProps(pathTo('CountNoCondition')).display(false).props),
        React.createElement(Data, elProps(pathTo('IfPlainValues')).display(false).props),
        React.createElement(Data, elProps(pathTo('IfOneArg')).display(false).props),
        React.createElement(Data, elProps(pathTo('IfTwoArgs')).display(false).props),
    )
}
`)
})

test('generates local user defined functions even if empty or code error in a page', () => {
    const app = new App('app1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
            new FunctionDef('f1', 'IsTallWidget', {input1: 'widget', calculation: ex`let heightAllowed = MinHeight\nlet isShiny = widget.shiny\nOr(widget.height > heightAllowed, isShiny)`}),
            new FunctionDef('f2', 'Empty Function', {calculation: ex``}),
            new FunctionDef('f3', 'Very Empty Function', {calculation: undefined}),
            new FunctionDef('f4', 'Bad Code Function', {calculation: ex`let x =`}),
            new Data('d1', 'TallWidgets', {initialValue: ex`Select(Widgets.getAllData(), IsTallWidget(\$item))`}),
            new NumberInput('n1', 'Min Height', {}),
            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Data, NumberInput} = Elemento.components
    const {Or, Select} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const Widgets = _state.useObject('App1.Widgets')
    const EmptyFunction = _state.setObject(pathTo('EmptyFunction'), React.useCallback(wrapFn(pathTo('EmptyFunction'), 'calculation', () => {}), []))
    const VeryEmptyFunction = _state.setObject(pathTo('VeryEmptyFunction'), React.useCallback(wrapFn(pathTo('VeryEmptyFunction'), 'calculation', () => {}), []))
    const BadCodeFunction = _state.setObject(pathTo('BadCodeFunction'), React.useCallback(wrapFn(pathTo('BadCodeFunction'), 'calculation', () => Elemento.codeGenerationError(\`let x =\`, 'Error: Unexpected character(s) (Line 1 Position 7)')), []))
    const MinHeight = _state.setObject(pathTo('MinHeight'), new NumberInput.State(stateProps(pathTo('MinHeight')).props))
    const IsTallWidget = _state.setObject(pathTo('IsTallWidget'), React.useCallback(wrapFn(pathTo('IsTallWidget'), 'calculation', (widget) => {
        let heightAllowed = MinHeight
        let isShiny = widget.shiny
        return Or(widget.height > heightAllowed, isShiny)
    }), [MinHeight]))
    const TallWidgets = _state.setObject(pathTo('TallWidgets'), new Data.State(stateProps(pathTo('TallWidgets')).value(Select(Widgets.getAllData(), ($item, $index) => IsTallWidget(\$item))).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Data, elProps(pathTo('TallWidgets')).display(false).props),
        React.createElement(NumberInput, elProps(pathTo('MinHeight')).label('Min Height').props),
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
            new FunctionDef('f2', 'DoNothing', {calculation: {expr: ''}, javascript: true}),
            ]
        )
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page} = Elemento.components
    const {Sum} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const WidgetHeight = _state.setObject(pathTo('WidgetHeight'), React.useCallback(wrapFn(pathTo('WidgetHeight'), 'calculation', (widget) => {
        let y = 10
        for (let i = 1; i < 10; i++) {
            y += Sum(widget, 10)
        }
        return y
    }), []))
    const DoNothing = _state.setObject(pathTo('DoNothing'), React.useCallback(wrapFn(pathTo('DoNothing'), 'calculation', () => {}), []))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,

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

    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page} = Elemento.components
    const _state = Elemento.useGetStore()
    const WidgetHeight = _state.setObject(pathTo('WidgetHeight'), React.useCallback(wrapFn(pathTo('WidgetHeight'), 'calculation', (words, factory, formula) => {
        function generateClause(placeholder) {
            const subFormulaArgs = placeholder.replace('[', '').replace(']','').trim().split(/ +/)
            
            let args = subFormulaArgs.map( arg => words[arg] || arg )
            return factory.call(null, args)
        }
        return formula.replaceAll(/\\[[\\w ]+\\]/g, generateClause)
    }), []))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,

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
    const pathTo = name => 'Test1' + '.' + name
    const {App, AppBar, TextElement} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('Test1', new App.State({pages, appContext}))
    const AppBarText = _state.setObject('Test1.AppBarText', React.useCallback(wrapFn(pathTo('AppBarText'), 'calculation', (greeting) => {
        return greeting + 'our new app'
    }), []))

    return React.createElement(App, {...elProps('Test1').props, topChildren: React.createElement( React.Fragment, null, React.createElement(AppBar, elProps(pathTo('AppBar1')).title('My App').props,
            React.createElement(TextElement, elProps(pathTo('Text0')).content(AppBarText('Welcome to ')).props),
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
            new ItemSet('id4', 'Widget Set', {items: ex`Widgets.Query({})`}, [
                new Text('lt1', 'Desc', {content: 'Hi!'}),
                new FunctionDef('f2', 'ExtraHeight', {calculation: ex`\$item.height - MinHeight`}),
            ]),
        ]),
        new Collection('coll1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`const Page1_WidgetSetItem = React.memo(function Page1_WidgetSetItem(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const {ItemSetItem, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    const MinHeight = _state.useObject(parentPathWith('MinHeight'))
    const ExtraHeight = _state.setObject(pathTo('ExtraHeight'), React.useCallback(wrapFn(pathTo('ExtraHeight'), 'calculation', () => {
        return $item.height - MinHeight
    }), [$item, MinHeight]))
    const canDragItem = undefined
    const styles = undefined

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Desc')).content('Hi!').props),
    )
})


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Data, NumberInput, ItemSet} = Elemento.components
    const {Or, Select} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const Widgets = _state.useObject('App1.Widgets')
    const MinHeight = _state.setObject(pathTo('MinHeight'), new NumberInput.State(stateProps(pathTo('MinHeight')).props))
    const IsTallWidget = _state.setObject(pathTo('IsTallWidget'), React.useCallback(wrapFn(pathTo('IsTallWidget'), 'calculation', (widget) => {
        return Or(widget.height > MinHeight, widget.shiny)
    }), [MinHeight]))
    const TallWidgets = _state.setObject(pathTo('TallWidgets'), new Data.State(stateProps(pathTo('TallWidgets')).value(Select(Widgets.getAllData(), ($item, $index) => IsTallWidget(\$item))).props))
    const WidgetSet = _state.setObject(pathTo('WidgetSet'), new ItemSet.State(stateProps(pathTo('WidgetSet')).items(Widgets.Query({})).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Data, elProps(pathTo('TallWidgets')).display(false).props),
        React.createElement(NumberInput, elProps(pathTo('MinHeight')).label('Min Height').props),
        React.createElement(ItemSet, elProps(pathTo('WidgetSet')).itemContentComponent(Page1_WidgetSetItem).props),
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
    expect(gen.output().code).toBe(`const runtimeUrl = window.elementoRuntimeUrl || 'https://elemento.online/lib/runtime.js'
const Elemento = await import(runtimeUrl)
const {React, trace, elProps, stateProps, wrapFn} = Elemento
const {importModule, importHandlers} = Elemento
const GetName = await import('../files/Function1.js').then(...importHandlers())
const CalcTax = await importModule('https://cdn.example.com/CalcStuff.js')
const DoStuff = await import('../files/DoStuff.js').then(...importHandlers())
const GetAmount = await import('../files/Functions.js').then(...importHandlers('amount'))
const Calcs = await import('../files/Functions.js').then(...importHandlers('*'))

// Page1.js
function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('This is ' + GetName('xyz') + DoStuff()).props),
    )
}

// appMain.js
export default function Test1(props) {
    const pathTo = name => 'Test1' + '.' + name
    const {App} = Elemento.components
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('Test1', new App.State({pages, appContext}))

    return React.createElement(App, {...elProps('Test1').props},)
}
`)
})

test('generates function imports for a Tool', () => {
    const tool = new Tool('tool1', 'Test1', {}, [
        new FunctionImport('f1', 'Get Name', {source: 'Function1.js'}),
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: ex`'This is ' + GetName('xyz')`}),
            ]
        )])

    const gen = new Generator(tool, project(new ToolFolder('tf1', 'Tools', {}, [tool])))
    expect(gen.output().code).toBe(`const runtimeUrl = window.elementoRuntimeUrl || 'https://elemento.online/lib/runtime.js'
const Elemento = await import(runtimeUrl)
const {React, trace, elProps, stateProps, wrapFn} = Elemento
const {importModule, importHandlers} = Elemento
const GetName = await import('../../files/Function1.js').then(...importHandlers())

// Page1.js
function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const {Editor, Preview} = Elemento
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('This is ' + GetName('xyz')).props),
    )
}

// Test1.js
export default function Test1(props) {
    const pathTo = name => 'Test1' + '.' + name
    const {App} = Elemento.components
    const {Editor, Preview} = Elemento
    const pages = {Page1}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('Test1', new App.State({pages, appContext}))

    return React.createElement(App, {...elProps('Test1').props},)
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(Elemento.codeGenerationError(\`'Hello 'Doctor' how are you?'\`, 'Error: Unexpected character(s) (Line 1 Position 8)')).props),
    )
}
`)
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Error: Unexpected character(s) (Line 1 Position 8)'
        }
    })

})

test('generates errors for styles sub-property expressions', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new TextInput('id1', 't1', {label: 'Some Text', styles: {color: 'red', borderWidth: ex`10~`, backgroundColor: ex`'pink'x`}}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.errors).toStrictEqual({
        id1: {
            styles: {
                backgroundColor: 'Error: Unexpected character(s) (Line 1 Position 6)',
                borderWidth: 'Error: Unexpected character(s) (Line 1 Position 2)'
            }
        }
    })

    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const t1 = _state.setObject(pathTo('t1'), new TextInput.State(stateProps(pathTo('t1')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('t1')).label('Some Text').styles(elProps(pathTo('t1.Styles')).color('red').borderWidth(Elemento.codeGenerationError(\`10~\`, 'Error: Unexpected character(s) (Line 1 Position 2)')).backgroundColor(Elemento.codeGenerationError(\`'pink'x\`, 'Error: Unexpected character(s) (Line 1 Position 6)')).props).props),
    )
}
`)
})

test('generates error on correct line for syntax error in multiline content expression', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`23\n +`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(Elemento.codeGenerationError(\`23
 +\`, 'Error: Unexpected character(s) (Line 2 Position 2)')).props),
    )
}
`)
    expect(output.errors).toStrictEqual({
        id1: {
            content: "Error: Unexpected character(s) (Line 2 Position 2)"
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const {Sum} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(Sum(2, 3, 4)).props),
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
                new Text('id5', 't5', {content: ex`document.getElementById('test1.Page1.t1').scrollTop`}),
            ]
        )])

    const content = new Generator(app, project(app)).output().files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(undefined).props),
        React.createElement(TextElement, elProps(pathTo('t2')).content(null).props),
        React.createElement(TextElement, elProps(pathTo('t3')).content(new Date(2020, 3, 4)).props),
        React.createElement(TextElement, elProps(pathTo('t4')).content(Math.sqrt(2)).props),
        React.createElement(TextElement, elProps(pathTo('t5')).content(document.getElementById('test1.Page1.t1').scrollTop).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, Button} = Elemento.components
    const _state = Elemento.useGetStore()
    const app = _state.useObject('test1')
    const {ShowPage} = app
    const b1_action = React.useCallback(wrapFn(pathTo('b1'), 'action', async () => {
        await ShowPage(Page2)
    }), [])
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Button, elProps(pathTo('b1')).content('Change Page').appearance('outline').action(b1_action).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement, TextInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const ForenameInput = _state.setObject(pathTo('ForenameInput'), new TextInput.State(stateProps(pathTo('ForenameInput')).props))
    const SurnameInput = _state.setObject(pathTo('SurnameInput'), new TextInput.State(stateProps(pathTo('SurnameInput')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(ForenameInput.value + ' ' + SurnameInput.value).props),
        React.createElement(TextInput, elProps(pathTo('ForenameInput')).label('Forename Input').props),
        React.createElement(TextInput, elProps(pathTo('SurnameInput')).label('Surname Input').props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(Elemento.codeGenerationError(\`sumxx(2, 3, 4)\`, 'Unknown names: sumxx')).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(Elemento.codeGenerationError(\`return 42\`, 'Error: Invalid expression')).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextInput} = Elemento.components
    const _state = Elemento.useGetStore()
    const NameInput = _state.setObject(pathTo('NameInput'), new TextInput.State(stateProps(pathTo('NameInput')).value(Elemento.codeGenerationError(\`{a: 10,\`, 'Error: Unexpected character(s) (Line 1 Position 8)')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('NameInput')).label('Name Input').props),
    )
}
`)
    expect(output.errors).toStrictEqual({
        id2: {
            initialValue: 'Error: Unexpected character(s) (Line 1 Position 8)'
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

test('let as identifier generates error with quotes removed', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`let + 10`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Error: The keyword let is reserved (Line 1 Position 0)'
        }
    })
})

test('multiple statements in value expression generates error', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`while (true) log(10); log(20)`}),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const {Sum} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(Sum == 1).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextInput, TextElement} = Elemento.components
    const {If} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const Input = _state.setObject(pathTo('Input'), new TextInput.State(stateProps(pathTo('Input')).props))
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('Input')).label('Input').props),
        React.createElement(TextElement, elProps(pathTo('Answer')).content(If(Input.value == 42, 10, 20)).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const {If, Sum, Log} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(If(true, 10, () => Sum(Log == 12, 3, 4))).props),
    )
}
`)
    expect(output.errors).toStrictEqual({})
})

test('assignment deep in complex expression is treated as comparison', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('b1', 'Button 1', {action: ex`let a = If(true, 10, Sum(Log= 12, 3, 4))
    let b = If(Sum = 42, 10, 20)
    Sum = 1`})
            ]
        )])

    const output = new Generator(app, project(app)).output()
    const content = output.files[0].contents
    expect(content).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Button} = Elemento.components
    const {If, Sum, Log} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const Button1_action = React.useCallback(wrapFn(pathTo('Button1'), 'action', () => {
        let a = If(true, 10, () => Sum(Log == 12, 3, 4))
            let b = If(Sum == 42, 10, 20)
            Sum == 1
    }), [])
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Button, elProps(pathTo('Button1')).content('Button 1').appearance('outline').action(Button1_action).props),
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
    const pathTo = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const _state = Elemento.useGetStore()
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(({a: 10, xxx: undefined})).props),
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
            content: 'Error: Unexpected character(s) (Line 1 Position 13)'
        }
    })
})

test('Circular reference generates error', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new FunctionDef('fn1', 'Get Stuff', {calculation: ex`'abc' + 12`}),
                new TextInput('id1', 'Val 1', {initialValue: ex`Val2`}),
                new TextInput('id2', 'Val 2', {initialValue: ex`Val1 + GetStuff()`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.errors).toStrictEqual({
        id2: {
            element: 'Circular reference: this element uses another element which then uses this one.  The element is one of: Val 1, Get Stuff'
        }
    })
})

test('Accepts modern JavaScript features', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Optional ops', {content: ex`{a: 20}?.b ?? 20`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.errors).toStrictEqual({})
})

test('generates standalone expressions block for selected element', ()=> {
    const app = new App('app1', 'Test1', {}, [
        new AppBar('ab1', 'App Bar 1', {title: 'My App'}, [
            new Text('id0', 'Text 0', {styles: {width: 200}, content: 'Welcome!'})
        ]),
        new Page('p1', 'Page 1', {}, [
                new TextInput('id1', 't1', {initialValue: ex`t2.value`, multiline: true, label: "Text Input One", styles: {width: 150}}),
                new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`}),
                new TextInput('id2', 't3', {}),
            ]
        )])

    const project1 = project(app)
    const gen = new Generator(app, project1)
    const exprs = {
        't1.value': `t2.value`,
        't2.value': `_selectedElement.value`,
        't3.update': `Set(t3, 'Xyz')`
    }
    const updatesAllowed = ['t3.update']
    const selectedElement = project1.findElement('id1')
    const page = app.findElement('p1') as Page
    const [block] = gen.generateStandaloneBlock(selectedElement, exprs, page, updatesAllowed)
    expect(block).toBe(`
const pathTo = name => props.path + '.' + name
const _selectedElement = _state.getObject('Test1.Page1.t1')
const {Set} = Elemento.appFunctions
const t2 = _state.getObject(pathTo('t2'))
const t3 = _state.getObject(pathTo('t3'));
({
  't1.value': () => (t2.value),
  't2.value': () => (_selectedElement.value),
  't3.update': {updateAllowed: true, fn: () => (Set(t3, 'Xyz'))}
})`.trimStart())
})

test('generates standalone expressions block without selected element', ()=> {
    const app = new App('app1', 'Test1', {}, [
        new AppBar('ab1', 'App Bar 1', {title: 'My App'}, [
            new Text('id0', 'Text 0', {styles: {width: 200}, content: 'Welcome!'})
        ]),
        new Page('p1', 'Page 1', {}, [
                new TextInput('id1', 't1', {initialValue: 'Hi there!', multiline: true, label: "Text Input One", styles: {width: 150}}),
                new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`}),
                new TextInput('id2', 't3', {}),
            ]
        )])

    const gen = new Generator(app, project(app))
    const exprs = {
        't1.value': `t1.value`
    }
    const page = app.findElement('p1') as Page
    const [block] = gen.generateStandaloneBlock(null, exprs, page, [])
    expect(block).toBe(`
const pathTo = name => props.path + '.' + name
const t1 = _state.getObject(pathTo('t1'));
({
  't1.value': () => (t1.value)
})`.trimStart())
})

test('generates standalone expressions block and errors and clears errors', ()=> {
    const app = new App('app1', 'Test 1', {}, [
        new AppBar('ab1', 'App Bar 1', {title: 'My App'}, [
            new Text('id0', 'Text 0', {styles: {width: 200}, content: 'Welcome!'})
        ]),
        new Page('p1', 'Page 1', {}, [
                new TextInput('id1', 't1', {initialValue: 'Hi there!', multiline: true, label: "Text Input One", styles: {width: 150}}),
                new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`}),
                new TextInput('id2', 't3', {}),
            ]
        )])

    const gen = new Generator(app, project(app))
    const exprs = {
        'expr 1': `t1.`,
        'expr 2': `XX1.value`,
    }
    const page = app.findElement('p1') as Page
    const [block, errors] = gen.generateStandaloneBlock(null, exprs, page, [])
    expect(block).toBe(`
const pathTo = name => props.path + '.' + name;
({
  'expr 1': () => ({_error: 'Error: Unexpected character(s) (Line 1 Position 3)'}),
  'expr 2': () => ({_error: 'Unknown names: XX1'})
})`.trimStart())

    expect(errors).toStrictEqual({
        'expr 1': 'Error: Unexpected character(s) (Line 1 Position 3)',
        'expr 2': 'Unknown names: XX1'
    })

    const fixedExprs = {'expr 1': 't1.value'}
    const [_, newErrors] = gen.generateStandaloneBlock(null, fixedExprs, page, [])
    expect(newErrors).toStrictEqual({})
})

test.each(['Reset', 'Set', 'NotifyError', 'Notify', 'CurrentUser', 'GetRandomId'])('%s is included in knownSync', (fnName) => {
    expect(knownSync(fnName)).toBe(true)
})

test.each(['Update', 'Add', 'AddAll', 'Remove', 'Get', 'Query'])('%s is not included in knownSync', (fnName) => {
    expect(knownSync(fnName)).toBe(false)
})
