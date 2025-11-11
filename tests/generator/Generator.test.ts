import {expect, test} from "vitest"
import Generator, {generate} from '../../src/generator/Generator'
import Element from '../../src/model/Element';
import App from '../../src/model/App';
import {Page, Block, ItemSet, Text,  TextInput, Button, Menu, MenuItem, AppBar, Dialog, NumberInput,
    BrowserDataStore, Calculation, DateInput, SelectInput, TrueFalseInput, Collection, Data, FileDataStore,
    Form, List, MemoryDataStore, SpeechInput, UserLogon, WebFileDataStore, FunctionDef, FunctionImport} from '../testutil/modelHelpers'
import {ex} from '../testutil/testHelpers'
import ServerAppConnector from '../../src/model/ServerAppConnector'
import Project, {COMPONENTS_ID, TOOLS_ID} from '../../src/model/Project'
import ServerApp from '../../src/model/ServerApp'
import DataTypes from '../../src/model/types/DataTypes'
import TextType from '../../src/model/types/TextType'
import NumberType from '../../src/model/types/NumberType'
import Tool from '../../src/model/Tool'
import ToolFolder from '../../src/model/ToolFolder'
import ToolImport from '../../src/model/ToolImport'
import Rule from '../../src/model/types/Rule';
import ComponentDef from '../../src/model/ComponentDef'
import ComponentInstance from '../../src/model/ComponentInstance'
import ComponentFolder from '../../src/model/ComponentFolder'
import {knownSync} from '../../src/generator/generatorHelpers'
import InputProperty from '../../src/model/InputProperty'
import OutputProperty from '../../src/model/OutputProperty'

const project = (...els: Element[]) => Project.new(els, 'Project 1', 'proj1', {})

test('generates app and all page output files', ()=> {
    const app = new App('app1', 'App 1', {maxWidth: '60%', fonts: 'Crazy Font\nWeird Font', themeOptions: ex`{primary: 'blue'}`}, [
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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there!').props),
        React.createElement(TextElement, elProps(pathTo('t2')).content(23 + 45).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)
    expect(gen.output().files[1].name).toBe('Page2.js')
    expect(gen.output().files[1].contents).toBe(`function Page2(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page2.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text2')).content('Green!').props),
        React.createElement(TextElement, elProps(pathTo('t3')).content('Red!').props)
    )
}
Page2.notLoggedInPage = 'Page1'


Page2.State = class Page2_State extends Elemento.components.ElementoComponentState {

}
`)
    expect(gen.output().files[2].name).toBe('appMain.js')
    expect(gen.output().files[2].contents).toBe(`export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const pages = {Page1, Page2}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = ({primary: 'blue'})
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})

    return React.createElement(App, {...elProps('App1').maxWidth('60%').themeOptions({primary: 'blue'}).fonts(['Crazy Font', 'Weird Font']).pages(pages).urlContext(urlContext).props},)
}


App1.State = class App1_State extends App.State {

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
    const {Editor, Preview} = Elemento
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there!').props),
        React.createElement(Button, elProps(pathTo('Button1')).content('Do It').appearance('outline').action(_state.Button1_action).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    async Button1_action() {
        
        await Editor.Highlight('menuItem+File')
    }
}
`)

    expect(gen.output().files[1].name).toBe('Tool1.js')
    expect(gen.output().files[1].contents).toBe(`export default function Tool1(props) {
    const pathTo = name => 'Tool1' + '.' + name
    const {Editor, Preview} = Elemento
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('Tool1', Tool1.State, {pages, urlContext, themeOptions})

    return React.createElement(App, {...elProps('Tool1').maxWidth('60%').pages(pages).urlContext(urlContext).props},)
}


Tool1.State = class Tool1_State extends App.State {

}
`)

    expect(gen.output().files.length).toBe(2)
})

test('can get all code in one string from the output with imports and export', function() {
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
const {React, trace, elProps, stateProps, wrapFn, useComponentState, codeGenerationError} = Elemento
const {Page, TextElement, App} = Elemento.components

// Page1.js
function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there!').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}

// Page2.js
function Page2(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page2.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text2')).content('Green!').props)
    )
}


Page2.State = class Page2_State extends Elemento.components.ElementoComponentState {

}

// appMain.js
export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const pages = {Page1, Page2}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})

    return React.createElement(App, {...elProps('App1').pages(pages).urlContext(urlContext).props},)
}


App1.State = class App1_State extends App.State {

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
const {React, trace, elProps, stateProps, wrapFn, useComponentState, codeGenerationError} = Elemento
const {Page, TextElement, App} = Elemento.components

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Uses Data Types 2' + Types2.ItemAmount.max).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}

// appMain.js
export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})

    return React.createElement(App, {...elProps('App1').pages(pages).urlContext(urlContext).props},)
}


App1.State = class App1_State extends App.State {

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
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('Test1', Test1.State, {pages, urlContext, themeOptions})

    return React.createElement(App, {...elProps('Test1').pages(pages).urlContext(urlContext).props, topChildren: React.createElement( React.Fragment, null, React.createElement(AppBar, elProps(pathTo('AppBar1')).title('My App').props,
            React.createElement(TextElement, elProps(pathTo('Text0')).styles(elProps(pathTo('Text0.Styles')).width(200).props).content('Welcome!').props)
    ))
    },)
}


Test1.State = class Test1_State extends App.State {

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
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('Test1', Test1.State, {pages, urlContext, themeOptions})

    return React.createElement(App, {...elProps('Test1').startupAction(_state.Test1_startupAction).pages(pages).urlContext(urlContext).props},)
}


Test1.State = class Test1_State extends App.State {
    Test1_startupAction() {
        
        Log('Off we go!')
    }
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
    const _state = useComponentState(props.path, Page1.State, {})
    const {t1, t2, t3} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('t1')).initialValue('Hi there!').label('Text Input One').readOnly(true).multiline(true).styles(elProps(pathTo('t1.Styles')).width(150).props).props),
        React.createElement(TextInput, elProps(pathTo('t2')).initialValue('Some' + ' things').label('t2').styles(elProps(pathTo('t2.Styles')).borderBottom(50 + 50).props).props),
        React.createElement(TextInput, elProps(pathTo('t3')).label('t3').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).styles(elProps(pathTo('Text1.Styles')).fontSize(36).fontFamily('Cat').color('red').backgroundColor('green').border(10).borderColor('black').width(100).height(200).marginBottom(33).props).content(\`Hi there!
How are you?
Today\`).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    const {Comp1} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there @Comp1@ and @Comp2@!').props,
            React.createElement(TextInput, elProps(pathTo('Comp1')).label('Comp 1').props),
            React.createElement(Button, elProps(pathTo('Comp2')).content('Click here').appearance('outline').props)
    )
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)
})

test('generates Text elements with escaped quotes', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there \'Doctor\' How are you?'})
            ]
        )])

    const gen = new Generator(app, project(app))
    const output = gen.output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there \\'Doctor\\' How are you?').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)
})

test('generates NumberInput elements with initial value', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new NumberInput('id1', 't1', {initialValue: 44, label: "Number Input One"}),
            new NumberInput('id2', 't2', {initialValue: ex`22 + 33`}),
            new NumberInput('id3', 't3', {})
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {t1, t2, t3} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(NumberInput, elProps(pathTo('t1')).initialValue(44).label('Number Input One').props),
        React.createElement(NumberInput, elProps(pathTo('t2')).initialValue(22 + 33).label('t2').props),
        React.createElement(NumberInput, elProps(pathTo('t3')).label('t3').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)
})

test('generates DateInput elements with initial value', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new DateInput('id1', 't1', {initialValue: new Date('2022-04-05'), label: "Date Input One"}),
            new DateInput('id2', 't2', {initialValue: ex`DateVal('2022-02-03')`}),
            new DateInput('id3', 't3', {})
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {t1, t2, t3} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(DateInput, elProps(pathTo('t1')).initialValue(new Date('2022-04-05T00:00:00.000Z')).label('Date Input One').props),
        React.createElement(DateInput, elProps(pathTo('t2')).initialValue(DateVal('2022-02-03')).label('t2').props),
        React.createElement(DateInput, elProps(pathTo('t3')).label('t3').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)
})

test('generates SpeechInput elements with language and phrases', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new SpeechInput('id1', 't1', {language: 'fr', expectedPhrases: ['One', 'Two']})
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {t1} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(SpeechInput, elProps(pathTo('t1')).language('fr').expectedPhrases(['One', 'Two']).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)
})

test('generates SelectInput elements with initial value', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new SelectInput('id1', 'Select1', {values: ['22', '33', '44'], initialValue: '44', label: "Select Input One"}),
            new SelectInput('id2', 'Select2', {values: ['22', '33', '44'], initialValue: ex`4+"4"`}),
            new SelectInput('id3', 'Select3', {values: []})
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {Select1, Select2, Select3} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(SelectInput, elProps(pathTo('Select1')).initialValue('44').label('Select Input One').values(['22', '33', '44']).props),
        React.createElement(SelectInput, elProps(pathTo('Select2')).initialValue(4+'4').label('Select2').values(['22', '33', '44']).props),
        React.createElement(SelectInput, elProps(pathTo('Select3')).label('Select3').values([]).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)
})

test('generates TrueFalseInput elements with initial value', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TrueFalseInput('id1', 't1', {initialValue: true, label: "True False Input One"}),
            new TrueFalseInput('id2', 't2', {initialValue: ex`true || false`}),
            new TrueFalseInput('id3', 't3', {})
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {t1, t2, t3} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TrueFalseInput, elProps(pathTo('t1')).initialValue(true).label('True False Input One').props),
        React.createElement(TrueFalseInput, elProps(pathTo('t2')).initialValue(true || false).label('t2').props),
        React.createElement(TrueFalseInput, elProps(pathTo('t3')).label('t3').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
            new Button('id2', 'b2', {content: 'Do it all!', action: actionExprWithForEach})
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const app = useComponentState('test1')
    const Words = app.Words
    const _state = useComponentState(props.path, Page1.State, {app})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Button, elProps(pathTo('b1')).content('Click here!').appearance(22 && 'filled').action(_state.b1_action).show(false).props),
        React.createElement(Button, elProps(pathTo('b2')).content('Do it all!').appearance('outline').action(_state.b2_action).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    async b1_action() {
        
        const message = 'You clicked me!'; await Log(message)
            Log('Didn\\'t you?')
    }
    async b2_action() {
        const {Words} = this.app
        let newWords = await JSON.parse('some json');
            ForEach(newWords, async ($item, $index) => await Add(Words, $item))
    }
}
`)
})

test('generates Button element action functions that depend on stateful components even if they have the same name as the button', () => {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('ti1', 'Description', {}),
            new FunctionDef('f1', 'Do Stuff', {calculation: ex`Log("Doing it")`}),
            new Button('id1', 'Do Stuff', {content: 'Click here!', action: ex`DoStuff(Description)`})
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {Description, DoStuff} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('Description')).label('Description').props),
        React.createElement(Button, elProps(pathTo('DoStuff')).content('Click here!').appearance('outline').action(_state.DoStuff_action).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    DoStuff() {
        
        return Log('Doing it')
    }

    DoStuff_action() {
        const {DoStuff, Description} = this
        DoStuff(Description)
    }
}
`)
})

test('generates User Logon elements with properties', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new UserLogon('id1', 'b1', {})
    ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(UserLogon, elProps(pathTo('b1')).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)
})

test('generates Menu element with items', () => {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Menu('id1', 'Menu 1', {label: 'Stuff to do', filled: true}, [
                    new MenuItem('it1', 'Item 1', {label: 'Do it', action: ex`Log('I am Item One')`}),
                    new MenuItem('it2', 'Item 2', {label: 'Say it'})
                ])
            ]
        )])

    const output = generate(app, project(app))
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Menu, elProps(pathTo('Menu1')).label('Stuff to do').filled(true).props,
            React.createElement(MenuItem, elProps(pathTo('Item1')).label('Do it').action(_state.Item1_action).props),
            React.createElement(MenuItem, elProps(pathTo('Item2')).label('Say it').props)
    )
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    Item1_action() {
        
        Log('I am Item One')
    }
}
`)
})

test('generates Data elements with initial value and no errors on object expressions', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Data('id1', 't1', {initialValue: 44}),
                new Data('id2', 't2', {initialValue: ex`{a:10, b: "Bee"}`, display: true}),
                new Data('id3', 't3', {})
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {t1, t2, t3} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Data, elProps(pathTo('t1')).initialValue(44).display(false).props),
        React.createElement(Data, elProps(pathTo('t2')).initialValue({a:10, b: 'Bee'}).display(true).props),
        React.createElement(Data, elProps(pathTo('t3')).display(false).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)
    expect(output.errors).toStrictEqual({})
})

test('generates Calculation elements with initial value and no errors on object expressions', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Calculation('id1', 't1', {calculation: ex`44 + 7`}),
                new Calculation('id2', 't2', {calculation: ex`{a:10, b: "Bee"}`, show: true, label: 'My Calc', styles: {width: ex`3+100`}}),
                new Calculation('id3', 't3', {})
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {t1, t2, t3} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Calculation, elProps(pathTo('t1')).calculation(44 + 7).props),
        React.createElement(Calculation, elProps(pathTo('t2')).calculation({a:10, b: 'Bee'}).label('My Calc').show(true).styles(elProps(pathTo('t2.Styles')).width(3+100).props).props),
        React.createElement(Calculation, elProps(pathTo('t3')).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)
    expect(output.errors).toStrictEqual({})
})

test('generates Collection elements with initial value and no errors on object expressions', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Collection('id1', 't1', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
                new Collection('id2', 't2', {initialValue: ex`["red", "yellow"]`, display: true}),
                new Collection('id3', 't3', {})
            ]
        ),
        new FileDataStore('fds1', 'Store1', {})
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const app = useComponentState('test1')
    const Store1 = app.Store1
    const _state = useComponentState(props.path, Page1.State, {app})
    const {t1, t2, t3} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Collection, elProps(pathTo('t1')).dataStore(Store1).collectionName('Widgets').display(false).props),
        React.createElement(Collection, elProps(pathTo('t2')).initialValue(['red', 'yellow']).collectionName('t2').display(true).props),
        React.createElement(Collection, elProps(pathTo('t3')).collectionName('t3').display(false).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const serverApp = new ServerApp('sa1', 'Server App 1', {updateTime: new Date()}, [
        getWidgetFn, updateWidgetFn, getSprocketFn,
    ])
    const project = Project.new([app, serverApp], 'The Project', 'proj1', {})

    const output = new Generator(app, project).output()

    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const app = useComponentState('App1')
    const Connector1 = app.Connector1
    const _state = useComponentState(props.path, Page1.State, {app})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Button, elProps(pathTo('DoItButton')).content('Go on, do it!').appearance('outline').action(_state.DoItButton_action).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    async DoItButton_action() {
        const {Connector1} = this.app
        await Connector1.DoStuff('Number1')
    }
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
    const pathTo = name => 'App1' + '.' + name
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})
    const {Connector1} = _state

    return React.createElement(App, {...elProps('App1').pages(pages).urlContext(urlContext).props},)
}


App1.State = class App1_State extends App.State {

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
    const serverApp = new ServerApp('sa1', 'Server App 1', {updateTime: new Date()}, [
        getWidgetFn,
    ])
    const project = Project.new([app, serverApp], 'The Project', 'proj1', {})

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
    const pathTo = name => 'App1' + '.' + name
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})
    const {ServerApp1} = _state

    return React.createElement(App, {...elProps('App1').pages(pages).urlContext(urlContext).props},)
}


App1.State = class App1_State extends App.State {

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
    const serverApp = new ServerApp('sa1', 'Server App 1', {updateTime: new Date()}, [getWidgetFn])
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
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})
    const {Connector1} = _state

    return React.createElement(App, {...elProps('App1').pages(pages).urlContext(urlContext).props},)
}


App1.State = class App1_State extends App.State {

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
    const serverApp = new ServerApp('sa1', 'Server App 1', {updateTime: new Date()}, [getWidgetFn])
    const project = Project.new([app, serverApp], 'The Project', 'proj1', {})

    const output = new Generator(app, project).output()

    expect(output.files[1].contents).toBe(`function configServerApp() {
    return codeGenerationError(\`'ServerAppX'\`, 'Unknown name');
}

export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})
    const {Connector1} = _state

    return React.createElement(App, {...elProps('App1').pages(pages).urlContext(urlContext).props},)
}


App1.State = class App1_State extends App.State {

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
    const serverApp = new ServerApp('sa1', 'Server App 1', {updateTime: new Date()}, [getWidgetFn])
    const project = Project.new([app, serverApp], 'The Project', 'proj1', {})

    const output = new Generator(app, project).output()

    expect(output.files[1].contents).toBe(`function configServerApp() {
    return {};
}

export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})
    const {Connector1} = _state

    return React.createElement(App, {...elProps('App1').pages(pages).urlContext(urlContext).props},)
}


App1.State = class App1_State extends App.State {

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

    expect(output.files[0].contents).toBe(`const Page1_WidgetSetItem = React.memo(function Page1_WidgetSetItemFn(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const _state = useComponentState(props.path, Page1_WidgetSetItem.State, {$item, $itemId, $index, $selected})
    const canDragItem = undefined
    const styles = undefined

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Desc')).content('Hi!').props)
    )
})


Page1_WidgetSetItem.State = class Page1_WidgetSetItem_State extends Elemento.components.ElementoComponentState {

}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const app = useComponentState('test1')
    const Store1 = app.Store1
    const _state = useComponentState(props.path, Page1.State, {app})
    const {Description, TheWidget, WidgetId, Widgets, WidgetSet} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('Description')).initialValue(TheWidget.Description).label('Description').props),
        React.createElement(Data, elProps(pathTo('TheWidget')).initialValue(WidgetId.value && Get(Widgets, WidgetId.value)).display(false).props),
        React.createElement(Data, elProps(pathTo('WidgetId')).initialValue(WidgetSet.selectedItem && WidgetSet.selectedItem.id).display(false).props),
        React.createElement(Collection, elProps(pathTo('Widgets')).dataStore(Store1).collectionName('Widgets').display(false).props),
        React.createElement(ItemSet, elProps(pathTo('WidgetSet')).itemContentComponent(Page1_WidgetSetItem).items(Widgets.Query({})).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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

    expect(output.files[0].contents).toBe(`const Page1_WidgetSetItem = React.memo(function Page1_WidgetSetItemFn(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const _state = useComponentState(props.path, Page1_WidgetSetItem.State, {$item, $itemId, $index, $selected})
    const canDragItem = undefined
    const styles = undefined

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Desc')).content('Hi!').props)
    )
})


Page1_WidgetSetItem.State = class Page1_WidgetSetItem_State extends Elemento.components.ElementoComponentState {

}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const app = useComponentState('test1')
    const Store1 = app.Store1
    const _state = useComponentState(props.path, Page1.State, {app})
    const {Description, TheWidget, WidgetId, Widgets, List1, WidgetSet} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('Description')).initialValue(TheWidget.Description).label('Description').props),
        React.createElement(Data, elProps(pathTo('TheWidget')).initialValue(WidgetId.value && Get(Widgets, WidgetId.value)).display(false).props),
        React.createElement(Data, elProps(pathTo('WidgetId')).initialValue(WidgetSet.selectedItem && WidgetSet.selectedItem.id).display(false).props),
        React.createElement(Collection, elProps(pathTo('Widgets')).dataStore(Store1).collectionName('Widgets').display(false).props),
        React.createElement(ListElement, elProps(pathTo('List1')).props,
            React.createElement(ItemSet, elProps(pathTo('WidgetSet')).itemContentComponent(Page1_WidgetSetItem).items(Widgets.Query({})).props)
    )
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    ])

    const output = new Generator(app, project(app)).output()
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const app = useComponentState('App1')
    const Widgets = app.Widgets
    const _state = useComponentState(props.path, Page1.State, {app})
    const {WidgetValue} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Update the widget').props),
        React.createElement(NumberInput, elProps(pathTo('WidgetValue')).initialValue(Get(Widgets, 'x1').a).label('New widget value').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)

    expect(output.files[1].contents).toBe(`export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})
    const {Widgets, Store1, Store2, Store3} = _state

    return React.createElement(App, {...elProps('App1').pages(pages).urlContext(urlContext).props},
        React.createElement(Collection, elProps(pathTo('Widgets')).dataStore(Store1).collectionName('Widgets').display(false).props)
    )
}


App1.State = class App1_State extends App.State {

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
    const app = useComponentState('App1')
    const Widgets = app.Widgets
    const _state = useComponentState(props.path, Page1.State, {app})
    const {WidgetValue} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Update the widget').props),
        React.createElement(NumberInput, elProps(pathTo('WidgetValue')).initialValue(Get(Widgets, 'x1').a).label('New widget value').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)

    expect(output.files[1].contents).toBe(`export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})
    const {Widgets, Store1} = _state

    return React.createElement(App, {...elProps('App1').pages(pages).urlContext(urlContext).props},
        React.createElement(Collection, elProps(pathTo('Widgets')).dataStore(codeGenerationError(\`StoreX\`, 'Unknown names: StoreX')).collectionName('Widgets').display(false).props)
    )
}


App1.State = class App1_State extends App.State {

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

    expect(gen.output().files[0].contents).toBe(`const Page1_ItemSet1Item = React.memo(function Page1_ItemSet1ItemFn(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const $container = useComponentState(Elemento.parentPath(props.path))
    const {ItemColor, Data1, TextInput1} = $container
    const _state = useComponentState(props.path, Page1_ItemSet1Item.State, {$item, $itemId, $index, $selected})
    const {TextInput2} = _state
    const canDragItem = $item.id + Data1 !== Floor(99.9)
    const styles = elProps(pathTo('ItemSet1.Styles')).color($selected ? 'red' : ItemColor).width(200).props

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there ' + TextInput2 + ' in ' + TextInput1 + $itemId).props),
        React.createElement(TextInput, elProps(pathTo('TextInput2')).initialValue('from ' + Left($item, 3)).label('Text Input 2').props),
        React.createElement(Button, elProps(pathTo('ButtonUpdate')).content('Update').appearance('outline').action(_state.ButtonUpdate_action).props)
    )
})


Page1_ItemSet1Item.State = class Page1_ItemSet1Item_State extends Elemento.components.ElementoComponentState {
    async ButtonUpdate_action() {
        
        await Update('Things', $item.id, {done: true})
    }
}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {TextInput1, ItemColor, Data1, Layout1, ItemSet1} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('TextInput1')).label('Text Input 1').props),
        React.createElement(SelectInput, elProps(pathTo('ItemColor')).label('Item Color').props),
        React.createElement(Data, elProps(pathTo('Data1')).initialValue(10).display(false).props),
        React.createElement(Block, elProps(pathTo('Layout1')).layout('vertical').props,
            React.createElement(ItemSet, elProps(pathTo('ItemSet1')).itemContentComponent(Page1_ItemSet1Item).items([{a: 10}, {a: 20}]).selectAction(_state.ItemSet1_selectAction).props)
    )
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    ItemSet1_selectAction($item, $itemId, $index) {
        
        Log($item.id)
    }
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

    expect(gen.output().files[0].contents).toBe(`const Page1_ItemSet1Item = React.memo(function Page1_ItemSet1ItemFn(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const $container = useComponentState(Elemento.parentPath(props.path))
    const {TextInput1} = $container
    const _state = useComponentState(props.path, Page1_ItemSet1Item.State, {$item, $itemId, $index, $selected})
    const {TextInput2} = _state
    const canDragItem = undefined
    const styles = elProps(pathTo('ItemSet1.Styles')).color('red').width(200).props

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there ' + TextInput2 + ' in ' + TextInput1).props),
        React.createElement(TextInput, elProps(pathTo('TextInput2')).initialValue('from ' + Left($item, 3)).label('Text Input 2').props),
        React.createElement(Button, elProps(pathTo('ButtonUpdate')).content('Update').appearance('outline').action(_state.ButtonUpdate_action).props)
    )
})


Page1_ItemSet1Item.State = class Page1_ItemSet1Item_State extends Elemento.components.ElementoComponentState {
    async ButtonUpdate_action() {
        
        await Update('Things', $item.id, {done: true})
    }
}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {TextInput1, List1, ItemSet1} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('TextInput1')).label('Text Input 1').props),
        React.createElement(ListElement, elProps(pathTo('List1')).props,
            React.createElement(ItemSet, elProps(pathTo('ItemSet1')).itemContentComponent(Page1_ItemSet1Item).items([{a: 10}, {a: 20}]).selectAction(_state.ItemSet1_selectAction).props)
    )
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    ItemSet1_selectAction($item, $itemId, $index) {
        
        Log($item.id)
    }
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

    expect(gen.output().files[0].contents).toBe(`const Page2_ItemSet1Item = React.memo(function Page2_ItemSet1ItemFn(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const _state = useComponentState(props.path, Page2_ItemSet1Item.State, {$item, $itemId, $index, $selected})
    const canDragItem = undefined
    const styles = undefined

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there!').props)
    )
})


Page2_ItemSet1Item.State = class Page2_ItemSet1Item_State extends Elemento.components.ElementoComponentState {

}


function Page2(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page2.State, {})
    const {ItemSet1} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(ItemSet, elProps(pathTo('ItemSet1')).itemContentComponent(Page2_ItemSet1Item).selectable(false).props)
    )
}


Page2.State = class Page2_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    const {WidgetCount, Layout1, NameInput, Colour} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(NumberInput, elProps(pathTo('WidgetCount')).initialValue(18).label('New widget value').props),
        React.createElement(Block, elProps(pathTo('Layout1')).layout('horizontal wrapped').styles(elProps(pathTo('Layout1.Styles')).width(500).backgroundColor('pink').props).props,
            React.createElement(TextElement, elProps(pathTo('T1')).content(23 + 45).props),
            React.createElement(TextInput, elProps(pathTo('NameInput')).label('Name Input').props),
            React.createElement(SelectInput, elProps(pathTo('Colour')).label('Colour').values(['red', 'green']).props),
            React.createElement(Button, elProps(pathTo('B1')).content('Click here!').appearance('outline').props)
    ),
        React.createElement(TextElement, elProps(pathTo('T2')).content(If(DragIsOver(Layout1) && DraggedItemId == 'blue', 'Drag', '')).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    const {Dialog1, NameInput} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Dialog, elProps(pathTo('Dialog1')).initiallyOpen(true).styles(elProps(pathTo('Dialog1.Styles')).width(500).backgroundColor('pink').props).props,
            React.createElement(TextElement, elProps(pathTo('T1')).content(23 + 45).props),
            React.createElement(TextInput, elProps(pathTo('NameInput')).label('Name Input').props)
    )
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1_DetailsForm.State, props)
    const {TextInput2, NumberInput1, Calculation1, Data1} = _state

    return React.createElement(Form, props,
        React.createElement(TextInput, elProps(pathTo('TextInput2')).label('Text Input 2').props),
        React.createElement(NumberInput, elProps(pathTo('NumberInput1')).initialValue(5 + 3).label('Number Input 1').props),
        React.createElement(Calculation, elProps(pathTo('Calculation1')).calculation(1 + 2).props),
        React.createElement(Data, elProps(pathTo('Data1')).initialValue(1 + 2).display(false).props)
    )
}


Page1_DetailsForm.State = class Page1_DetailsForm_State extends Elemento.components.BaseFormState {
    ownFieldNames = ['TextInput2', 'NumberInput1', 'Data1']

}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {DetailsForm} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Page1_DetailsForm, elProps(pathTo('DetailsForm')).initialValue({TextInput2: 'foo', NumberInput1: 27}).label('Details Form').horizontal(false).wrap(false).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, DetailsForm_FurtherDetails.State, props)
    const {Description, Size} = _state

    return React.createElement(Form, props,
        React.createElement(TextInput, elProps(pathTo('Description')).label('Description').props),
        React.createElement(NumberInput, elProps(pathTo('Size')).label('Size').props)
    )
}


DetailsForm_FurtherDetails.State = class DetailsForm_FurtherDetails_State extends Elemento.components.BaseFormState {
    ownFieldNames = ['Description', 'Size']

}


function Page1_DetailsForm(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1_DetailsForm.State, props)
    const {TextInput2, NumberInput1, FurtherDetails} = _state

    return React.createElement(Form, props,
        React.createElement(TextInput, elProps(pathTo('TextInput2')).label('Text Input 2').props),
        React.createElement(NumberInput, elProps(pathTo('NumberInput1')).initialValue(5 + 3).label('Number Input 1').props),
        React.createElement(DetailsForm_FurtherDetails, elProps(pathTo('FurtherDetails')).label('Further Details').horizontal(true).wrap(false).props)
    )
}


Page1_DetailsForm.State = class Page1_DetailsForm_State extends Elemento.components.BaseFormState {
    ownFieldNames = ['TextInput2', 'NumberInput1', 'FurtherDetails']

}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {DetailsForm} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Page1_DetailsForm, elProps(pathTo('DetailsForm')).initialValue({TextInput2: 'foo', NumberInput1: 27, FurtherDetails: {Description: 'Long', Size: 77}}).label('Details Form').horizontal(false).wrap(false).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1_DetailsForm.State, props)
    const {TextInput2, NumberInput1} = _state

    return React.createElement(Form, props,
        React.createElement(TextInput, elProps(pathTo('TextInput2')).label('Text Input 2').props),
        React.createElement(TextElement, elProps(pathTo('Text1')).content('Hi there ' + Left(TextInput2, 2)).props),
        React.createElement(NumberInput, elProps(pathTo('NumberInput1')).initialValue(5 + 3).label('Number Input 1').props),
        React.createElement(TextElement, elProps(pathTo('Text2')).content('Number is ' + \$form.value.NumberInput1).props),
        React.createElement(Button, elProps(pathTo('ButtonUpdate')).content('Update').appearance('outline').action(_state.ButtonUpdate_action).props)
    )
}


Page1_DetailsForm.State = class Page1_DetailsForm_State extends Elemento.components.BaseFormState {
    ownFieldNames = ['TextInput2', 'NumberInput1']
    async ButtonUpdate_action() {
        
        await $form.Submit('normal')
    }
}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {TextInput1, TFInput1, DetailsForm} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('TextInput1')).label('Text Input 1').props),
        React.createElement(TrueFalseInput, elProps(pathTo('TFInput1')).label('TF Input 1').props),
        React.createElement(Page1_DetailsForm, elProps(pathTo('DetailsForm')).initialValue({TextInput2: 'foo', NumberInput1: 27}).label('The Details').horizontal(true).wrap(false).keyAction(_state.DetailsForm_keyAction).submitAction(_state.DetailsForm_submitAction).styles(elProps(pathTo('DetailsForm.Styles')).width('93%').props).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    async DetailsForm_keyAction($event) {
        const $key = $event.key
        const {DetailsForm} = this
        Log('You pressed', $key, $event.ctrlKey); await If($key == 'Enter', async () => await DetailsForm.submit())
    }
    async DetailsForm_submitAction($form, $data) {
        const {TextInput1, TFInput1} = this
        Log($data, TextInput1, TFInput1); await Update('Things', '123', $form.updates)
    }
}
`)
})

test('generates user defined component and instance', () => {

    const compDef = new ComponentDef('c1', 'My Component', {},[
        new InputProperty('ip1', 'source', {propertyType: 'string'}),
        new InputProperty('ip2', 'destination', {propertyType: 'string'}),
        new Text('id1', 'Text 1', {content: ex`"From " + source`}),
        new Text('id2', 't2', {content: ex`"To " + destination`}),
        new Button('b1', 'Do Something', {action: ex`Log('Hi')`}),
        new OutputProperty('op1', 'From To', {calculation: ex`"From" + source + " to " + destination`}),
        new FunctionDef('fn1', 'Journey', {calculation: ex`"Start: " + source + " Destination: " + destination`})
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
    const {source, destination} = props
    const _state = useComponentState(props.path)
    const {Journey} = _state

    return React.createElement(ComponentElement, props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('From ' + source).props),
        React.createElement(TextElement, elProps(pathTo('t2')).content('To ' + destination).props),
        React.createElement(Button, elProps(pathTo('DoSomething')).content('Do Something').appearance('outline').action(_state.DoSomething_action).props)
    )
}


MyComponent.State = class MyComponent_State extends Elemento.components.ElementoComponentState {
    Journey() {
        const {source, destination} = this.props
        return 'Start: ' + source + ' Destination: ' + destination
    }

    DoSomething_action() {
        
        Log('Hi')
    }
    get FromTo() { 
        const {source, destination} = this.props
        return 'From' + source + ' to ' + destination
    }
}
`)

    expect(gen.output().files[1].name).toBe('Page1.js')
    expect(gen.output().files[1].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {AComponent} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text3')).content('Over here!').props),
        React.createElement(MyComponent, elProps(pathTo('AComponent')).source('Here').destination('There').show(true).styles(elProps(pathTo('AComponent.Styles')).color('blue').props).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}
`)

    expect(gen.output().files[2].name).toBe('appMain.js')
    expect(gen.output().files[2].contents).toBe(`export default function App1(props) {
    const pathTo = name => 'App1' + '.' + name
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('App1', App1.State, {pages, urlContext, themeOptions})

    return React.createElement(App, {...elProps('App1').maxWidth('60%').pages(pages).urlContext(urlContext).props},)
}


App1.State = class App1_State extends App.State {

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
    const app = useComponentState('App1')
    const Widgets = app.Widgets
    const _state = useComponentState(props.path, Page1.State, {app})
    const {TallWidgets, TallerWidgets, FixedWidgets, NoWidgets, CountNoCondition, IfPlainValues, IfOneArg, IfTwoArgs} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Data, elProps(pathTo('TallWidgets')).initialValue(Select(Widgets.getAllData(), ($item, $index) => $item.height > $index)).display(false).props),
        React.createElement(Data, elProps(pathTo('TallerWidgets')).initialValue(ForEach(Widgets.getAllData(), ($item, $index) => $item.height + 10)).display(false).props),
        React.createElement(Data, elProps(pathTo('FixedWidgets')).initialValue(ForEach(Widgets.getAllData(), ($item, $index) => 99)).display(false).props),
        React.createElement(Data, elProps(pathTo('NoWidgets')).initialValue(Select(Widgets.getAllData())).display(false).props),
        React.createElement(Data, elProps(pathTo('CountNoCondition')).initialValue(Count(Widgets.getAllData())).display(false).props),
        React.createElement(Data, elProps(pathTo('IfPlainValues')).initialValue(If(true, 1, Date)).display(false).props),
        React.createElement(Data, elProps(pathTo('IfOneArg')).initialValue(If(false, () => Sum(10, 20))).display(false).props),
        React.createElement(Data, elProps(pathTo('IfTwoArgs')).initialValue(If(false, 2, () => Sum(10, 20))).display(false).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
            new FunctionDef('f5', 'Async Action', {calculation: ex`let a = EmptyFunction()\nlet tw = Select(Widgets.getAllData(), IsTallWidget(\$item))\nGet(Widgets, 123).height + 10`, action: true}),
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
    const app = useComponentState('App1')
    const Widgets = app.Widgets
    const _state = useComponentState(props.path, Page1.State, {app})
    const {IsTallWidget, EmptyFunction, VeryEmptyFunction, BadCodeFunction, AsyncAction, TallWidgets, MinHeight} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Data, elProps(pathTo('TallWidgets')).initialValue(Select(Widgets.getAllData(), ($item, $index) => IsTallWidget($item))).display(false).props),
        React.createElement(NumberInput, elProps(pathTo('MinHeight')).label('Min Height').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    IsTallWidget(widget) {
        const {MinHeight} = this
        let heightAllowed = MinHeight
        let isShiny = widget.shiny
        return Or(widget.height > heightAllowed, isShiny)
    }
    EmptyFunction() {}
    VeryEmptyFunction() {}
    BadCodeFunction() { return codeGenerationError(\`let x =\`, 'Error: Unexpected character(s) (Line 1 Position 7)')}
    async AsyncAction() {
        const {EmptyFunction, IsTallWidget} = this
        const {Widgets} = this.app
        let a = EmptyFunction()
        let tw = Select(await Widgets.getAllData(), ($item, $index) => IsTallWidget($item))
        (await Get(Widgets, 123)).height + 10
    }
}
`)
})

test('Function can be recursive and does not depend on itself', ()=> {
    const app = new App('app1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new FunctionDef('fn1', 'Get Stuff', {calculation: ex`'abc' + GetStuff()`}),
                new TextInput('id2', 'Val 2', {initialValue: ex`GetStuff()`}),
            ]
        )])

    const output = new Generator(app, project(app)).output()
    expect(output.errors).toStrictEqual({})
    expect(output.files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    const {GetStuff, Val2} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('Val2')).initialValue(GetStuff()).label('Val 2').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    GetStuff() {
        const {GetStuff} = this
        return 'abc' + GetStuff()
    }
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
    const _state = useComponentState(props.path, Page1.State, {})
    const {WidgetHeight, DoNothing} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,

    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    WidgetHeight(widget) {
        
        let y = 10
        for (let i = 1; i < 10; i++) {
            y += Sum(widget, 10)
        }
        return y
    }
    DoNothing() {}
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
    const _state = useComponentState(props.path, Page1.State, {})
    const {WidgetHeight} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,

    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    WidgetHeight(words, factory, formula) {
        
        function generateClause(placeholder) {
            const subFormulaArgs = placeholder.replace('[', '').replace(']','').trim().split(/ +/)
            
            let args = subFormulaArgs.map( arg => words[arg] || arg )
            return factory.call(null, args)
        }
        return formula.replaceAll(/\\[[\\w ]+\\]/g, generateClause)
    }
}
`)
})

test('generates local user defined functions in the app that can use built-in app functions', () => {
    const app = new App('app1', 'Test1', {}, [
        new AppBar('ab1', 'App Bar 1', {title: 'My App'}, [
            new Text('id0', 'Text 0', {content: ex`AppBarText('Welcome to ' + CurrentUrl())`})
        ]),
        new FunctionDef('f1', 'AppBarText', {input1: 'greeting', calculation: ex`greeting + 'our new app' + ' at ' + CurrentUrl()`}),
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: 'Hi there!'}),
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[1].contents).toBe(`export default function Test1(props) {
    const pathTo = name => 'Test1' + '.' + name
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('Test1', Test1.State, {pages, urlContext, themeOptions})
    const {CurrentUrl} = _state
    const {AppBarText} = _state

    return React.createElement(App, {...elProps('Test1').pages(pages).urlContext(urlContext).props, topChildren: React.createElement( React.Fragment, null, React.createElement(AppBar, elProps(pathTo('AppBar1')).title('My App').props,
            React.createElement(TextElement, elProps(pathTo('Text0')).content(AppBarText('Welcome to ' + CurrentUrl())).props)
    ))
    },)
}


Test1.State = class Test1_State extends App.State {
    AppBarText(greeting) {
        const {CurrentUrl} = this
        return greeting + 'our new app' + ' at ' + CurrentUrl()
    }
}
`)
})

test('generates page elements that can use user-defined and built-in app functions', () => {
    const app = new App('app1', 'Test1', {}, [
        new FunctionDef('f1', 'Greeting', {input1: 'greeting', calculation: ex`greeting + 'our new app' + ' at ' + CurrentUrl()`}),
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`'Hi there!' + Greeting() + Calc1` }),
                new Text('id2', 't2', {content: ex`'This is page' + CurrentUrl()` }),
                new Button('id3', 'b1', {content: ex`'Show page' + CurrentUrl()`, action: ex`Log(CurrentUrl()); ShowPage(Page1)` }),
                new Calculation('id4', 'Calc 1', {calculation: ex`'This is page' + CurrentUrl() + ' Hi ' + Greeting()` }),
            ]
        )])

    const gen = new Generator(app, project(app))
    expect(gen.output().files[0].contents).toBe(`function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const app = useComponentState('Test1')
    const {CurrentUrl, ShowPage} = app
    const Greeting = app.Greeting
    const _state = useComponentState(props.path, Page1.State, {app})
    const {Calc1} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content('Hi there!' + Greeting() + Calc1).props),
        React.createElement(TextElement, elProps(pathTo('t2')).content('This is page' + CurrentUrl()).props),
        React.createElement(Button, elProps(pathTo('b1')).content('Show page' + CurrentUrl()).appearance('outline').action(_state.b1_action).props),
        React.createElement(Calculation, elProps(pathTo('Calc1')).calculation('This is page' + CurrentUrl() + ' Hi ' + Greeting()).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    async b1_action() {
        const {CurrentUrl, ShowPage} = this.app
        Log(await CurrentUrl()); await ShowPage(Page1)
    }
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
    expect(output.files[0].contents).toBe(`const Page1_WidgetSetItem = React.memo(function Page1_WidgetSetItemFn(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const $container = useComponentState(Elemento.parentPath(props.path))
    const {MinHeight} = $container
    const _state = useComponentState(props.path, Page1_WidgetSetItem.State, {$item, $itemId, $index, $selected})
    const {ExtraHeight} = _state
    const canDragItem = undefined
    const styles = undefined

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Desc')).content('Hi!').props)
    )
})


Page1_WidgetSetItem.State = class Page1_WidgetSetItem_State extends Elemento.components.ElementoComponentState {
    ExtraHeight() {
        
        return $item.height - MinHeight
    }
}


function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const app = useComponentState('App1')
    const Widgets = app.Widgets
    const _state = useComponentState(props.path, Page1.State, {app})
    const {IsTallWidget, TallWidgets, MinHeight, WidgetSet} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Data, elProps(pathTo('TallWidgets')).initialValue(Select(Widgets.getAllData(), ($item, $index) => IsTallWidget($item))).display(false).props),
        React.createElement(NumberInput, elProps(pathTo('MinHeight')).label('Min Height').props),
        React.createElement(ItemSet, elProps(pathTo('WidgetSet')).itemContentComponent(Page1_WidgetSetItem).items(Widgets.Query({})).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    IsTallWidget(widget) {
        const {MinHeight} = this
        return Or(widget.height > MinHeight, widget.shiny)
    }
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
const {React, trace, elProps, stateProps, wrapFn, useComponentState, codeGenerationError} = Elemento
const {importModule, importHandlers} = Elemento
const GetName = await import('../files/Function1.js').then(...importHandlers())
const CalcTax = await importModule('https://cdn.example.com/CalcStuff.js')
const DoStuff = await import('../files/DoStuff.js').then(...importHandlers())
const GetAmount = await import('../files/Functions.js').then(...importHandlers('amount'))
const Calcs = await import('../files/Functions.js').then(...importHandlers('*'))
const {Page, TextElement, App} = Elemento.components

// Page1.js
function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('This is ' + GetName('xyz') + DoStuff()).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}

// appMain.js
export default function Test1(props) {
    const pathTo = name => 'Test1' + '.' + name
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('Test1', Test1.State, {pages, urlContext, themeOptions})

    return React.createElement(App, {...elProps('Test1').pages(pages).urlContext(urlContext).props},)
}


Test1.State = class Test1_State extends App.State {

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
const {React, trace, elProps, stateProps, wrapFn, useComponentState, codeGenerationError} = Elemento
const {importModule, importHandlers} = Elemento
const GetName = await import('../../files/Function1.js').then(...importHandlers())
const {Page, TextElement, App} = Elemento.components

// Page1.js
function Page1(props) {
    const pathTo = name => props.path + '.' + name
    const {Editor, Preview} = Elemento
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('Text1')).content('This is ' + GetName('xyz')).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

}

// Test1.js
export default function Test1(props) {
    const pathTo = name => 'Test1' + '.' + name
    const {Editor, Preview} = Elemento
    const pages = {Page1}
    const urlContext = Elemento.useGetUrlContext()
    const themeOptions = undefined
    const _state = useComponentState('Test1', Test1.State, {pages, urlContext, themeOptions})

    return React.createElement(App, {...elProps('Test1').pages(pages).urlContext(urlContext).props},)
}


Test1.State = class Test1_State extends App.State {

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(codeGenerationError(\`'Hello 'Doctor' how are you?'\`, 'Error: Unexpected character(s) (Line 1 Position 8)')).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    const {t1} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('t1')).label('Some Text').styles(elProps(pathTo('t1.Styles')).color('red').borderWidth(codeGenerationError(\`10~\`, 'Error: Unexpected character(s) (Line 1 Position 2)')).backgroundColor(codeGenerationError(\`'pink'x\`, 'Error: Unexpected character(s) (Line 1 Position 6)')).props).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(codeGenerationError(\`23
 +\`, 'Error: Unexpected character(s) (Line 2 Position 2)')).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(Sum(2, 3, 4)).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(undefined).props),
        React.createElement(TextElement, elProps(pathTo('t2')).content(null).props),
        React.createElement(TextElement, elProps(pathTo('t3')).content(new Date(2020, 3, 4)).props),
        React.createElement(TextElement, elProps(pathTo('t4')).content(Math.sqrt(2)).props),
        React.createElement(TextElement, elProps(pathTo('t5')).content(document.getElementById('test1.Page1.t1').scrollTop).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const app = useComponentState('test1')
    const {ShowPage} = app
    const _state = useComponentState(props.path, Page1.State, {app})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Button, elProps(pathTo('b1')).content('Change Page').appearance('outline').action(_state.b1_action).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    async b1_action() {
        const {ShowPage} = this.app
        await ShowPage(Page2)
    }
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
    const _state = useComponentState(props.path, Page1.State, {})
    const {ForenameInput, SurnameInput} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(ForenameInput.value + ' ' + SurnameInput.value).props),
        React.createElement(TextInput, elProps(pathTo('ForenameInput')).label('Forename Input').props),
        React.createElement(TextInput, elProps(pathTo('SurnameInput')).label('Surname Input').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(codeGenerationError(\`sumxx(2, 3, 4)\`, 'Unknown names: sumxx')).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(codeGenerationError(\`return 42\`, 'Error: Invalid expression')).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    const {NameInput} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('NameInput')).initialValue(codeGenerationError(\`{a: 10,\`, 'Error: Unexpected character(s) (Line 1 Position 8)')).label('Name Input').props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(Sum == 1).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    const {Input} = _state
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextInput, elProps(pathTo('Input')).label('Input').props),
        React.createElement(TextElement, elProps(pathTo('Answer')).content(If(Input.value == 42, 10, 20)).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(If(true, 10, () => Sum(Log == 12, 3, 4))).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Button, elProps(pathTo('Button1')).content('Button 1').appearance('outline').action(_state.Button1_action).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {
    async Button1_action() {
        
        let a = await If(true, 10, () => Sum(Log == 12, 3, 4))
            let b = await If(Sum == 42, 10, 20)
            Sum == 1
    }
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
    const _state = useComponentState(props.path, Page1.State, {})
    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(TextElement, elProps(pathTo('t1')).content(({a: 10, xxx: undefined})).props)
    )
}


Page1.State = class Page1_State extends Elemento.components.ElementoComponentState {

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

test.skip('Circular reference generates error', ()=> {
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
            element: 'Circular reference: this element uses another element which then uses this one.  The element is one of: Val 1'
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

test('generates standalone expressions block for selected element and includes app level elements', ()=> {
    const app = new App('app1', 'Test1', {}, [
        new Data('d1', 'Width', {initialValue: 200}),
        new AppBar('ab1', 'App Bar 1', {title: 'My App'}, [
            new Text('id0', 'Text 0', {styles: {width: 200}, content: 'Welcome!'})
        ]),
        new Page('p1', 'Page 1', {}, [
                new TextInput('id1', 't1', {initialValue: ex`t2.value`, multiline: true, label: "Text Input One", styles: {width: ex`Width`}}),
                new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`}),
                new TextInput('id3', 't3', {}),
            ]
        )])

    const project1 = project(app)
    const gen = new Generator(app, project1)
    const exprs = {
        't1.value': `t2.value`,
        't2.value': `_selectedElement.value`,
        't3.update': `Set(t3, 'Xyz')`,
        'the width': `Width.value`
    }
    const updatesAllowed = ['t3.update']
    const selectedElement = project1.findElement('id1')
    const page = app.findElement('p1') as typeof Page
    const [block] = gen.generateStandaloneBlock(selectedElement, exprs, page, updatesAllowed)
    expect(block).toBe(`
const pathTo = name => props.path + '.' + name
const _selectedElement = getObject('Test1.Page1.t1')
const {Set} = Elemento.appFunctions
const Width = getObject('Test1.Width')
const t2 = getObject(pathTo('t2'))
const t3 = getObject(pathTo('t3'));
({
  't1.value': () => (t2.value),
  't2.value': () => (_selectedElement.value),
  't3.update': {updateAllowed: true, fn: () => (Set(t3, 'Xyz'))},
  'the width': () => (Width.value)
})`.trimStart())
})

test('generates standalone expressions block for app level selected element and includes other app level elements', ()=> {
    const app = new App('app1', 'Test1', {}, [
        new WebFileDataStore('wf1', 'Store 1', {url: 'http://foo.com'}),
        new Collection('c1', 'Puzzles', {dataStore: ex`Store1`, collectionName: 'Puzzles'}),
        new Page('p1', 'Page 1', {}, [
                new TextInput('id3', 't3', {}),
            ]
        )])

    const project1 = project(app)
    const gen = new Generator(app, project1)
    const exprs = {
        'dataStore': `Store1`,
        'selectedElement': `Puzzles`,
    }
    const selectedElement = project1.findElement('c1')
    const [block] = gen.generateStandaloneBlock(selectedElement, exprs, app, [])
    expect(block).toBe(`
const pathTo = name => props.path + '.' + name
const _selectedElement = getObject('Test1.Puzzles')
const Store1 = getObject(pathTo('Store1'))
const Puzzles = getObject(pathTo('Puzzles'));
({
  'dataStore': () => (Store1),
  'selectedElement': () => (Puzzles)
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
    const page = app.findElement('p1') as typeof Page
    const [block] = gen.generateStandaloneBlock(null, exprs, page, [])
    expect(block).toBe(`
const pathTo = name => props.path + '.' + name
const t1 = getObject(pathTo('t1'));
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
    const page = app.findElement('p1') as typeof Page
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

test.each(['If', 'Update', 'Add', 'AddAll', 'Remove', 'Get', 'GetIfExists', 'Query'])('%s is not included in knownSync', (fnName) => {
    expect(knownSync(fnName)).toBe(false)
})
