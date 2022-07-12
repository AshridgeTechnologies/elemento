import Generator, {generate} from '../../src/generator/Generator'
import App from '../../src/model/App';
import Text from '../../src/model/Text';
import Button from '../../src/model/Button';
import Page from '../../src/model/Page'
import TextInput from '../../src/model/TextInput'
import NumberInput from '../../src/model/NumberInput'
import TrueFalseInput from '../../src/model/TrueFalseInput'
import SelectInput from '../../src/model/SelectInput'
import List from '../../src/model/List'
import Data from '../../src/model/Data'
import {ex} from '../testutil/testHelpers'
import {Collection, FunctionDef} from '../../src/model/index'
import MemoryDataStore from '../../src/model/MemoryDataStore'
import FileDataStore from '../../src/model/FileDataStore'
import Layout from '../../src/model/Layout'
import AppBar from '../../src/model/AppBar'

test('generates app and all page output files', ()=> {
    const app = new App('t1', 'App 1', {maxWidth: '60%'}, [
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

    const gen = new Generator(app)

    expect(gen.output().files[0].name).toBe('Page1.js')
    expect(gen.output().files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Hi there!'),
        React.createElement(TextElement, {path: pathWith('t2')}, 23 + 45),
    )
}
`)
    expect(gen.output().files[1].name).toBe('Page2.js')
    expect(gen.output().files[1].content).toBe(`function Page2(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text2')}, 'Green!'),
        React.createElement(TextElement, {path: pathWith('t3')}, 'Red!'),
    )
}
`)
    expect(gen.output().files[2].name).toBe('appMain.js')
    expect(gen.output().files[2].content).toBe(`export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App} = Elemento.components
    const pages = {Page1, Page2}
    const app = Elemento.useObjectState('app', new App.State({pages}))

    return React.createElement(App, {path: 'App1', maxWidth: '60%',},)
}
`)

})

test('can get all code in one string from the output with imports and export', function () {
    const app = new App('t1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there!'}),
            ]
        ),
        new Page('p2', 'Page 2', {}, [
                new Text('id3', 'Text 2', {content: 'Green!'}),
            ]
        )])

    const output = generate(app)

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
    const app = Elemento.useObjectState('app', new App.State({pages}))

    return React.createElement(App, {path: 'App1', },)
}
`)
})

test('generates App Bar elements with contents', ()=> {
    const app = new App('t1', 'Test1', {}, [
        new AppBar('ab1', 'App Bar 1', {title: 'My App'}, [
            new Text('id0', 'Text 0', {width: 200, content: 'Welcome!'})
        ]),
        new Page('p1', 'Page 1', {}, [
            new TextInput('id1', 't1', {initialValue: 'Hi there!', maxLength: 10, multiline: true, label: "Text Input One", width: 150}),
            new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`, maxLength: ex`5 + 5`}),
            new TextInput('id2', 't3', {}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.output().files[1].content).toBe(`export default function Test1(props) {
    const pathWith = name => 'Test1' + '.' + name
    const {App, AppBar, TextElement} = Elemento.components
    const pages = {Page1}
    const app = Elemento.useObjectState('app', new App.State({pages}))

    return React.createElement(App, {path: 'Test1', topChildren: React.createElement( React.Fragment, null, React.createElement(AppBar, {path: pathWith('AppBar1'), title: 'My App'},
            React.createElement(TextElement, {path: pathWith('Text0'), width: 200}, 'Welcome!'),
    ))
    },)
}
`)
})

test('generates TextInput elements with initial value', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('id1', 't1', {initialValue: 'Hi there!', maxLength: 10, multiline: true, label: "Text Input One", width: 150}),
            new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`, maxLength: ex`5 + 5`}),
            new TextInput('id2', 't3', {}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.output().files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextInput} = Elemento.components
    const t1 = Elemento.useObjectState(pathWith('t1'), new TextInput.State({value: 'Hi there!', }))
    const t2 = Elemento.useObjectState(pathWith('t2'), new TextInput.State({value: "Some" + " things", }))
    const t3 = Elemento.useObjectState(pathWith('t3'), new TextInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {path: pathWith('t1'), maxLength: 10, multiline: true, label: 'Text Input One', width: 150}),
        React.createElement(TextInput, {path: pathWith('t2'), maxLength: 5 + 5, label: 't2'}),
        React.createElement(TextInput, {path: pathWith('t3'), label: 't3'}),
    )
}
`)
})

test('generates Text elements with multiline content', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 'Text 1', {content: 'Hi there!\nHow are you?\nToday',
                    fontSize: 36, fontFamily: 'Cat', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200}),
            ]
        )])

    const gen = new Generator(app)
    expect(gen.output().files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1'), fontSize: 36, fontFamily: 'Cat', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200}, \`Hi there!
How are you?
Today\`),
    )
}
`)
})

test('generates NumberInput elements with initial value', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new NumberInput('id1', 't1', {initialValue: 44, label: "Number Input One"}),
            new NumberInput('id2', 't2', {initialValue: ex`22 + 33`}),
            new NumberInput('id2', 't3', {}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.output().files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, NumberInput} = Elemento.components
    const t1 = Elemento.useObjectState(pathWith('t1'), new NumberInput.State({value: 44, }))
    const t2 = Elemento.useObjectState(pathWith('t2'), new NumberInput.State({value: 22 + 33, }))
    const t3 = Elemento.useObjectState(pathWith('t3'), new NumberInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(NumberInput, {path: pathWith('t1'), label: 'Number Input One'}),
        React.createElement(NumberInput, {path: pathWith('t2'), label: 't2'}),
        React.createElement(NumberInput, {path: pathWith('t3'), label: 't3'}),
    )
}
`)
})

test('generates SelectInput elements with initial value', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new SelectInput('id1', 'Select1', {values: ['22', '33', '44'], initialValue: '44', label: "Select Input One"}),
            new SelectInput('id2', 'Select2', {values: ['22', '33', '44'], initialValue: ex`4+"4"`}),
            new SelectInput('id2', 'Select3', {values: []}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.output().files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, SelectInput} = Elemento.components
    const Select1 = Elemento.useObjectState(pathWith('Select1'), new SelectInput.State({value: '44', }))
    const Select2 = Elemento.useObjectState(pathWith('Select2'), new SelectInput.State({value: 4+"4", }))
    const Select3 = Elemento.useObjectState(pathWith('Select3'), new SelectInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(SelectInput, {path: pathWith('Select1'), values: ['22', '33', '44'], label: 'Select Input One'}),
        React.createElement(SelectInput, {path: pathWith('Select2'), values: ['22', '33', '44'], label: 'Select2'}),
        React.createElement(SelectInput, {path: pathWith('Select3'), values: [], label: 'Select3'}),
    )
}
`)
})

test('generates TrueFalseInput elements with initial value', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TrueFalseInput('id1', 't1', {initialValue: true, label: "True False Input One"}),
            new TrueFalseInput('id2', 't2', {initialValue: ex`true || false`}),
            new TrueFalseInput('id3', 't3', {}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.output().files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TrueFalseInput} = Elemento.components
    const t1 = Elemento.useObjectState(pathWith('t1'), new TrueFalseInput.State({value: true, }))
    const t2 = Elemento.useObjectState(pathWith('t2'), new TrueFalseInput.State({value: true || false, }))
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
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Button('id1', 'b1', {content: 'Click here!', action: actionExpr, filled: ex`22 || 33`, display: false}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.output().files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Button} = Elemento.components
    const {Log} = Elemento.globalFunctions

    return React.createElement(Page, {id: props.path},
        React.createElement(Button, {path: pathWith('b1'), content: 'Click here!', filled: 22 || 33, display: false, action: () => {const message = "You clicked me!"; Log(message)
    Log("Didn't you?")}}),
    )
}
`)
})

test('generates Data elements with initial value and no errors on object expressions', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Data('id1', 't1', {initialValue: 44}),
                new Data('id2', 't2', {initialValue: ex`{a:10, b: "Bee"}`, display: true}),
                new Data('id3', 't3', {}),
            ]
        )])

    const output = new Generator(app).output()
    expect(output.files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Data} = Elemento.components
    const t1 = Elemento.useObjectState(pathWith('t1'), new Data.State({value: 44, }))
    const t2 = Elemento.useObjectState(pathWith('t2'), new Data.State({value: {a:10, b: "Bee"}, }))
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
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Collection('id1', 't1', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
                new Collection('id2', 't2', {initialValue: ex`["red", "yellow"]`, display: true}),
                new Collection('id3', 't3', {}),
            ]
        ),
        new FileDataStore('fds1', 'Store1', {})
    ])

    const output = new Generator(app).output()
    expect(output.files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Collection} = Elemento.components
    const Store1 = Elemento.useGetObjectState('app.Store1')
    const t1 = Elemento.useObjectState(pathWith('t1'), new Collection.State({dataStore: Store1, collectionName: 'Widgets', }),)
    const t2 = Elemento.useObjectState(pathWith('t2'), new Collection.State({value: ["red", "yellow"], }),)
    const t3 = Elemento.useObjectState(pathWith('t3'), new Collection.State({}),)

    return React.createElement(Page, {id: props.path},
        React.createElement(Collection, {path: pathWith('t1'), display: false}),
        React.createElement(Collection, {path: pathWith('t2'), display: true}),
        React.createElement(Collection, {path: pathWith('t3'), display: false}),
    )
}
`)
    expect(output.errors).toStrictEqual({})
})

test('sorts state entries into dependency order', () => {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('ti1', 'Description', {initialValue: ex`TheWidget.Description`}),
            new Data('id3', 'The Widget', {initialValue: ex`WidgetId.value && Get(Widgets, WidgetId.value)`}),
            new Data('id2', 'Widget Id', {initialValue: ex`WidgetList.selectedItem && WidgetList.selectedItem.Id`}),
            new Collection('id1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
            new List('id4', 'Widget List', {items: ex`Widgets.Query({})`}, [new Text('lt1', 'Desc', {content: 'Hi!'})]),
            ]
        ),
        new FileDataStore('fds1', 'Store1', {})
    ])

    const output = new Generator(app).output()

    expect(output.files[0].content).toBe(`function Page1_WidgetListItem(props) {
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
    const Widgets = Elemento.useObjectState(pathWith('Widgets'), new Collection.State({dataStore: Store1, collectionName: 'Widgets', }),)
    const WidgetList = Elemento.useObjectState(pathWith('WidgetList'), new ListElement.State({}))
    const WidgetId = Elemento.useObjectState(pathWith('WidgetId'), new Data.State({value: WidgetList.selectedItem && WidgetList.selectedItem.Id, }))
    const TheWidget = Elemento.useObjectState(pathWith('TheWidget'), new Data.State({value: WidgetId.value && Get(Widgets, WidgetId.value), }))
    const Description = Elemento.useObjectState(pathWith('Description'), new TextInput.State({value: TheWidget.Description, }))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {path: pathWith('Description'), label: 'Description'}),
        React.createElement(Data, {path: pathWith('TheWidget'), display: false}),
        React.createElement(Data, {path: pathWith('WidgetId'), display: false}),
        React.createElement(Collection, {path: pathWith('Widgets'), display: false}),
        React.createElement(ListElement, {path: pathWith('WidgetList'), items: Widgets.Query({}), itemContentComponent: Page1_WidgetListItem}),
    )
}
`)
    expect(output.errors).toStrictEqual({})

})

test('generates elements under App used in Page', ()=> {
    const app = new App('t1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('t1', 'Text 1', {content: 'Update the widget'}),
                new NumberInput('n1', 'Widget Value', {initialValue: ex`Get(Widgets, 'x1').a`, label: 'New widget value'}),
            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
        new FileDataStore('fds1', 'Store 2', {}),
    ])

    const output = new Generator(app).output()
    expect(output.files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, NumberInput} = Elemento.components
    const {Get} = Elemento.appFunctions
    const Widgets = Elemento.useGetObjectState('app.Widgets')
    const WidgetValue = Elemento.useObjectState(pathWith('WidgetValue'), new NumberInput.State({value: Get(Widgets, 'x1').a, }))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Update the widget'),
        React.createElement(NumberInput, {path: pathWith('WidgetValue'), label: 'New widget value'}),
    )
}
`)

    expect(output.files[1].content).toBe(`export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App, Collection, MemoryDataStore, FileDataStore} = Elemento.components
    const pages = {Page1}
    const app = Elemento.useObjectState('app', new App.State({pages}))
    const [Store1] = React.useState(new MemoryDataStore({value: { Widgets: { x1: {a: 10}}}}))
    const Widgets = Elemento.useObjectState('app.Widgets', new Collection.State({dataStore: Store1, collectionName: 'Widgets', }),)
    const Store2 = Elemento.useObjectState('app.Store2', new FileDataStore.State())

    return React.createElement(App, {path: 'App1', },
        React.createElement(Collection, {path: pathWith('Widgets'), display: false})
    )
}
`)

    expect(output.errors).toStrictEqual({})
})

test('generates codeGenerationError for unknown names in elements under App used in Page', ()=> {
    const app = new App('t1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('t1', 'Text 1', {content: 'Update the widget'}),
                new NumberInput('n1', 'Widget Value', {initialValue: ex`Get(Widgets, 'x1').a`, label: 'New widget value'}),
            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`StoreX`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
    ])

    const output = new Generator(app).output()
    expect(output.files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, NumberInput} = Elemento.components
    const {Get} = Elemento.appFunctions
    const Widgets = Elemento.useGetObjectState('app.Widgets')
    const WidgetValue = Elemento.useObjectState(pathWith('WidgetValue'), new NumberInput.State({value: Get(Widgets, 'x1').a, }))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Update the widget'),
        React.createElement(NumberInput, {path: pathWith('WidgetValue'), label: 'New widget value'}),
    )
}
`)

    expect(output.files[1].content).toBe(`export default function App1(props) {
    const pathWith = name => 'App1' + '.' + name
    const {App, Collection, MemoryDataStore} = Elemento.components
    const pages = {Page1}
    const app = Elemento.useObjectState('app', new App.State({pages}))
    const [Store1] = React.useState(new MemoryDataStore({value: { Widgets: { x1: {a: 10}}}}))
    const Widgets = Elemento.useObjectState('app.Widgets', new Collection.State({dataStore: Elemento.codeGenerationError(\`StoreX\`, 'Unknown names: StoreX'), collectionName: 'Widgets', }),)

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

test('generates List element with separate child component and global functions', ()=> {
    const app = new App('t1', 'App 1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('id4', 'Text Input 1', {}),
            new Layout('la1', 'Layout 1', {}, [
                new List('l1', 'List 1', {items: [{a: 10}, {a: 20}], style: 'color: red', width: 200}, [
                    new Text('id1', 'Text 1', {content: ex`"Hi there " + TextInput2 + " in " + TextInput1`}),
                    new TextInput('id2', 'Text Input 2', {initialValue: ex`"from " + Left($item, 3)`}),
                    new Button('id3', 'Button Update', {content: 'Update', action: ex`Update('Things', '123', {done: true})`}),
                ])
            ])
            ]
        ),
    ])

    const gen = new Generator(app)

    expect(gen.output().files[0].content).toBe(`function Page1_List1Item(props) {
    const pathWith = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item} = props
    const {TextElement, TextInput, Button} = Elemento.components
    const {Left} = Elemento.globalFunctions
    const {Update} = Elemento.appFunctions
    const TextInput1 = Elemento.useGetObjectState(parentPathWith('TextInput1'))
    const TextInput2 = Elemento.useObjectState(pathWith('TextInput2'), new TextInput.State({value: "from " + Left($item, 3), }))

    return React.createElement(React.Fragment, null,
        React.createElement(TextElement, {path: pathWith('Text1')}, "Hi there " + TextInput2 + " in " + TextInput1),
        React.createElement(TextInput, {path: pathWith('TextInput2'), label: 'Text Input 2'}),
        React.createElement(Button, {path: pathWith('ButtonUpdate'), content: 'Update', action: () => {Update('Things', '123', {done: true})}}),
    )
}


function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextInput, Layout, ListElement} = Elemento.components
    const TextInput1 = Elemento.useObjectState(pathWith('TextInput1'), new TextInput.State({}))
    const List1 = Elemento.useObjectState(pathWith('List1'), new ListElement.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {path: pathWith('TextInput1'), label: 'Text Input 1'}),
        React.createElement(Layout, {path: pathWith('Layout1'), horizontal: false, wrap: false},
            React.createElement(ListElement, {path: pathWith('List1'), items: [{a: 10}, {a: 20}], itemContentComponent: Page1_List1Item, width: 200, style: 'color: red'}),
    ),
    )
}
`)
})

test('generates List element with empty items expression', ()=> {
    const app = new App('t1', 'App 1', {}, [
        new Page('p1', 'Page 2', {}, [
            // @ts-ignore
            new List('l1', 'List 1', {items: undefined}, [
                new Text('id1', 'Text 1', {content: 'Hi there!'}),
            ])
            ]
        ),
    ])

    const gen = new Generator(app)

    expect(gen.output().files[0].content).toBe(`function Page2_List1Item(props) {
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
        React.createElement(ListElement, {path: pathWith('List1'), items: [], itemContentComponent: Page2_List1Item}),
    )
}
`)

})

test('generates Layout element with properties and children', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new NumberInput('n1', 'Widget Count', {initialValue: ex`18`, label: 'New widget value'}),
            new Layout('lay1', 'Layout 1', {horizontal: true, width: 500, wrap: ex`100 < 200`}, [
                new Text('t1', 'T1', {content: ex`23 + 45`}),
                new TextInput('input1', 'Name Input', {}),
                new SelectInput('select1', 'Colour', {values: ['red', 'green']}),
                new Button('b1', 'B1', {content: 'Click here!'}),
            ])
            ]
        )])

    const gen = new Generator(app)
    expect(gen.output().files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, NumberInput, Layout, TextElement, TextInput, SelectInput, Button} = Elemento.components
    const WidgetCount = Elemento.useObjectState(pathWith('WidgetCount'), new NumberInput.State({value: 18, }))
    const NameInput = Elemento.useObjectState(pathWith('NameInput'), new TextInput.State({}))
    const Colour = Elemento.useObjectState(pathWith('Colour'), new SelectInput.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(NumberInput, {path: pathWith('WidgetCount'), label: 'New widget value'}),
        React.createElement(Layout, {path: pathWith('Layout1'), horizontal: true, width: 500, wrap: 100 < 200},
            React.createElement(TextElement, {path: pathWith('T1')}, 23 + 45),
            React.createElement(TextInput, {path: pathWith('NameInput'), label: 'Name Input'}),
            React.createElement(SelectInput, {path: pathWith('Colour'), values: ['red', 'green'], label: 'Colour'}),
            React.createElement(Button, {path: pathWith('B1'), content: 'Click here!'}),
    ),
    )
}
`)
})

test('transforms expressions to functions where needed', () => {
    const app = new App('t1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Data('d1', 'TallWidgets', {initialValue: ex`Select(Widgets.getAllData(), \$item.height > 10)`}),
                new Data('d2', 'TallerWidgets', {initialValue: ex`ForEach(Widgets.getAllData(), \$item.height + 10)`}),
            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
    ])

    const output = new Generator(app).output()
    expect(output.files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Data} = Elemento.components
    const {Select, ForEach} = Elemento.globalFunctions
    const Widgets = Elemento.useGetObjectState('app.Widgets')
    const TallWidgets = Elemento.useObjectState(pathWith('TallWidgets'), new Data.State({value: Select(Widgets.getAllData(), \$item => \$item.height > 10), }))
    const TallerWidgets = Elemento.useObjectState(pathWith('TallerWidgets'), new Data.State({value: ForEach(Widgets.getAllData(), \$item => \$item.height + 10), }))

    return React.createElement(Page, {id: props.path},
        React.createElement(Data, {path: pathWith('TallWidgets'), display: false}),
        React.createElement(Data, {path: pathWith('TallerWidgets'), display: false}),
    )
}
`)
})

test('generates local user defined functions in a page', () => {
    const app = new App('t1', 'App1', {}, [
        new Page('p1', 'Page 1', {}, [
            new FunctionDef('f1', 'IsTallWidget', {input1: 'widget', calculation: ex`let heightAllowed = MinHeight\nlet isShiny = widget.shiny\nOr(widget.height > heightAllowed, isShiny)`}),
            new Data('d1', 'TallWidgets', {initialValue: ex`Select(Widgets.getAllData(), IsTallWidget(\$item))`}),
            new NumberInput('n1', 'Min Height', {}),
            ]
        ),
        new Collection('coll1', 'Widgets', {dataStore: ex`Store1`, collectionName: 'Widgets'}),
        new MemoryDataStore('mds1', 'Store 1', {initialValue: ex`{ Widgets: { x1: {a: 10}}}`}),
    ])

    const output = new Generator(app).output()
    expect(output.files[0].content).toBe(`function Page1(props) {
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
    const TallWidgets = Elemento.useObjectState(pathWith('TallWidgets'), new Data.State({value: Select(Widgets.getAllData(), \$item => IsTallWidget(\$item)), }))

    return React.createElement(Page, {id: props.path},
        React.createElement(Data, {path: pathWith('TallWidgets'), display: false}),
        React.createElement(NumberInput, {path: pathWith('MinHeight'), label: 'Min Height'}),
    )
}
`)
})

test('generates local user defined functions in the app', () => {
    const app = new App('t1', 'Test1', {}, [
        new AppBar('ab1', 'App Bar 1', {title: 'My App'}, [
            new Text('id0', 'Text 0', {content: ex`AppBarText('Welcome to ')`})
        ]),
        new FunctionDef('f1', 'AppBarText', {input1: 'greeting', calculation: ex`greeting + 'our new app'`}),
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: 'Hi there!'}),
            ]
        )])

    const gen = new Generator(app)
    expect(gen.output().files[1].content).toBe(`export default function Test1(props) {
    const pathWith = name => 'Test1' + '.' + name
    const {App, AppBar, TextElement} = Elemento.components
    const pages = {Page1}
    const app = Elemento.useObjectState('app', new App.State({pages}))
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
    const app = new App('t1', 'App1', {}, [
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

    const output = new Generator(app).output()
    expect(output.files[0].content).toBe(`function Page1_WidgetListItem(props) {
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
    const TallWidgets = Elemento.useObjectState(pathWith('TallWidgets'), new Data.State({value: Select(Widgets.getAllData(), \$item => IsTallWidget(\$item)), }))
    const WidgetList = Elemento.useObjectState(pathWith('WidgetList'), new ListElement.State({}))

    return React.createElement(Page, {id: props.path},
        React.createElement(Data, {path: pathWith('TallWidgets'), display: false}),
        React.createElement(NumberInput, {path: pathWith('MinHeight'), label: 'Min Height'}),
        React.createElement(ListElement, {path: pathWith('WidgetList'), items: Widgets.Query({}), itemContentComponent: Page1_WidgetListItem}),
    )
}
`)
})

test('generates error on correct line for syntax error in multiline content expression', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`23\n +`}),
            ]
        )])

    const output = new Generator(app).output()
    expect(output.files[0].content).toBe(`function Page1(props) {
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
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`Sum(2, 3, 4)`}),
            ]
        )])

    const content = new Generator(app).output().files[0].content
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

test('app state functions and Page names available in expression', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('id1', 'b1', {content: 'Change Page', action: ex`ShowPage(Page2)`}),
            ]
        ),
        new Page('p2', 'Page 2', {}, [
                new Button('id1', 'b2', {content: 'Back to Page 1', action: ex`ShowPage(Page1)`}),
            ]
        )])

    const content = new Generator(app).output().files[0].content
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, Button} = Elemento.components
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app

    return React.createElement(Page, {id: props.path},
        React.createElement(Button, {path: pathWith('b1'), content: 'Change Page', action: () => {ShowPage(Page2)}}),
    )
}
`)
})

test('page elements available in content expression', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`ForenameInput.value + " " + SurnameInput.value`}),
                new TextInput('id2', 'Forename Input', {}),
                new TextInput('id3', 'Surname Input', {}),
            ]
        )])

    const content = new Generator(app).output().files[0].content
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
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`sumxx(2, 3, 4)`}),
            ]
        )])

    const output = new Generator(app).output()
    const content = output.files[0].content
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
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`return 42`}),
            ]
        )])

    const output = new Generator(app).output()
    const content = output.files[0].content
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
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new TextInput('id2', 'Name Input', {initialValue: ex`{a: 10,`}),
            ]
        )])

    const output = new Generator(app).output()
    const content = output.files[0].content
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextInput} = Elemento.components
    const NameInput = Elemento.useObjectState(pathWith('NameInput'), new TextInput.State({value: Elemento.codeGenerationError(\`{a: 10,\`, 'Error: Line 1: Unexpected token )'), }))

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
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`while (true) log(10)`}),
            ]
        )])

    const output = new Generator(app).output()
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Error: Invalid expression'
        }
    })
})

test('multiple statements in value expression generates error', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`while (true) log(10); return 42`}),
            ]
        )])

    const output = new Generator(app).output()
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Error: Must be a single expression'
        }
    })
})

test('multiple statements in action expression is ok', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('id1', 'b1', {action: ex`while (true) Log(10); let answer = 42
                Log(answer)`}),
            ]
        )])

    const output = new Generator(app).output()
    expect(output.errors).toStrictEqual({})
})

test('assignment at top level is treated as comparison', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`Sum = 1`}),
            ]
        )])

    const output = new Generator(app).output()
    const content = output.files[0].content
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
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new TextInput('id1', 'Input', {}),
                new Text('id2', 'Answer', {content: ex`If(Input.value = 42, 10, 20)`}),
            ]
        )])

    const output = new Generator(app).output()
    const content = output.files[0].content
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
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`If(true, 10, Sum(Log= 12, 3, 4))`}),
            ]
        )])

    const output = new Generator(app).output()
    const content = output.files[0].content
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

test('property shorthand to name of property reports error and generates an error in the code', () => {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`{a: 10, xxx}`}),
            ]
        )])

    const output = new Generator(app).output()
    const content = output.files[0].content
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
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`If(Sum(1)    1, Log(10), Log(20))`}),
            ]
        )])

    const output = new Generator(app).output()
    expect(output.errors).toStrictEqual({
        id1: {
            content: 'Error: Unexpected token 1'
        }
    })

})

