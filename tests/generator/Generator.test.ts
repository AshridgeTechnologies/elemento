import Generator from '../../src/generator/Generator'
import App from '../../src/model/App';
import Text from '../../src/model/Text';
import Button from '../../src/model/Button';
import Page from '../../src/model/Page'
import TextInput from '../../src/model/TextInput'
import {ex} from '../../src/util/helpers'
import NumberInput from '../../src/model/NumberInput'
import TrueFalseInput from '../../src/model/TrueFalseInput'
import SelectInput from '../../src/model/SelectInput'

test('generates app and all page output files', ()=> {
    const app = new App('t1', 'test1', {}, [
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

    expect(gen.outputFiles()[0].name).toBe('Page1.js')
    expect(gen.outputFiles()[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {})

    return React.createElement('div', {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Hi there!'),
        React.createElement(TextElement, {path: pathWith('t2')}, 23 + 45),
    )
}
`)
    expect(gen.outputFiles()[1].name).toBe('Page2.js')
    expect(gen.outputFiles()[1].content).toBe(`function Page2(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {})

    return React.createElement('div', {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text2')}, 'Green!'),
        React.createElement(TextElement, {path: pathWith('t3')}, 'Red!'),
    )
}
`)
    expect(gen.outputFiles()[2].name).toBe('appMain.js')
    expect(gen.outputFiles()[2].content).toBe(`function AppMain(props) {

    const appPages = {Page1, Page2}
    const appState = useObjectStateWithDefaults('app._data', {currentPage: Object.keys(appPages)[0]})
    const {currentPage} = appState
    return React.createElement('div', {id: 'app'},
        React.createElement(appPages[currentPage], {path: \`app.\${currentPage}\`})
    )
}
`)

})

test('generates TextInput elements with initial value', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('id1', 't1', {initialValue: 'Hi there!', maxLength: 10, multiline: true, label: "Text Input One"}),
            new TextInput('id2', 't2', {initialValue: ex`"Some" + " things"`, maxLength: ex`5 + 5`}),
            new TextInput('id2', 't3', {}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.outputFiles()[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {
        t1: {value: 'Hi there!'},
        t2: {value: "Some" + " things"},
        t3: {value: ""},
    })

    return React.createElement('div', {id: props.path},
        React.createElement(TextInput, {path: pathWith('t1'), initialValue: 'Hi there!', maxLength: 10, multiline: true, label: 'Text Input One'}),
        React.createElement(TextInput, {path: pathWith('t2'), initialValue: "Some" + " things", maxLength: 5 + 5}),
        React.createElement(TextInput, {path: pathWith('t3')}),
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
    expect(gen.outputFiles()[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {})

    return React.createElement('div', {id: props.path},
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
    expect(gen.outputFiles()[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {
        t1: {value: 44},
        t2: {value: 22 + 33},
        t3: {value: 0},
    })

    return React.createElement('div', {id: props.path},
        React.createElement(NumberInput, {path: pathWith('t1'), initialValue: 44, label: 'Number Input One'}),
        React.createElement(NumberInput, {path: pathWith('t2'), initialValue: 22 + 33}),
        React.createElement(NumberInput, {path: pathWith('t3')}),
    )
}
`)
})

test('generates SelectInput elements with initial value', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new SelectInput('id1', 't1', {values: ['22', '33', '44'], initialValue: '44', label: "Select Input One"}),
            new SelectInput('id2', 't2', {values: ['22', '33', '44'], initialValue: ex`4+"4"`}),
            new SelectInput('id2', 't3', {values: []}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.outputFiles()[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {
        t1: {value: '44'},
        t2: {value: 4+"4"},
        t3: {value: undefined},
    })

    return React.createElement('div', {id: props.path},
        React.createElement(SelectInput, {path: pathWith('t1'), values: ['22', '33', '44'], initialValue: '44', label: 'Select Input One'}),
        React.createElement(SelectInput, {path: pathWith('t2'), values: ['22', '33', '44'], initialValue: 4+"4"}),
        React.createElement(SelectInput, {path: pathWith('t3'), values: []}),
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
    expect(gen.outputFiles()[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {
        t1: {value: true},
        t2: {value: true || false},
        t3: {value: false},
    })

    return React.createElement('div', {id: props.path},
        React.createElement(TrueFalseInput, {path: pathWith('t1'), initialValue: true, label: 'True False Input One'}),
        React.createElement(TrueFalseInput, {path: pathWith('t2'), initialValue: true || false}),
        React.createElement(TrueFalseInput, {path: pathWith('t3')}),
    )
}
`)
})

test('generates Button elements with properties', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Button('id1', 'b1', {content: 'Click here!', action: ex`Log("You clicked me!")`}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.outputFiles()[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {})
    const {Log} = window.globalFunctions
    return React.createElement('div', {id: props.path},
        React.createElement(Button, {path: pathWith('b1'), content: 'Click here!', action: () => {Log("You clicked me!")}}),
    )
}
`)
})

test('generates error marker for syntax error in content expression', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`23 +`}),
            ]
        )])

    const gen = new Generator(app)
    expect(gen.outputFiles()[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {})

    return React.createElement('div', {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, React.createElement('span', {title: "Error: Line 1: Unexpected end of input"}, '#ERROR')),
    )
}
`)

})

test('global functions available in content expression', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`Sum(2, 3, 4)`}),
            ]
        )])

    const content = new Generator(app).outputFiles()[0].content
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {})
    const {Sum} = window.globalFunctions
    return React.createElement('div', {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, Sum(2, 3, 4)),
    )
}
`)
})

test('app functions and Page names available in expression', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Button('id1', 'b1', {content: 'Change Page', action: ex`ShowPage(Page2)`}),
            ]
        ),
        new Page('p2', 'Page 2', {}, [
                new Button('id1', 'b2', {content: 'Back to Page 1', action: ex`ShowPage(Page1)`}),
            ]
        )])

    const content = new Generator(app).outputFiles()[0].content
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {})
    const {ShowPage} = window.appFunctions
    const Page2 = 'Page2'
    return React.createElement('div', {id: props.path},
        React.createElement(Button, {path: pathWith('b1'), content: 'Change Page', action: () => {ShowPage(Page2)}}),
    )
}
`)
})

test('unknown global functions show error marker', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: ex`sumxx(2, 3, 4)`}),
            ]
        )])

    const content = new Generator(app).outputFiles()[0].content
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {})

    return React.createElement('div', {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, React.createElement('span', {title: "Unknown names: sumxx"}, '#ERROR')),
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

    const content = new Generator(app).outputFiles()[0].content
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {
        ForenameInput: {value: ""},
        SurnameInput: {value: ""},
    })
    const {ForenameInput, SurnameInput} = state
    return React.createElement('div', {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, ForenameInput.value + " " + SurnameInput.value),
        React.createElement(TextInput, {path: pathWith('ForenameInput')}),
        React.createElement(TextInput, {path: pathWith('SurnameInput')}),
    )
}
`)
})



