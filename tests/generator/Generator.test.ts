import Generator from '../../src/generator/Generator'
import App from '../../src/model/App';
import Text from '../../src/model/Text';
import Page from '../../src/model/Page'
import TextInput from '../../src/model/TextInput'

test('generates app and page 0 output files', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Text('id1', 'Text Input 1', {content: '"Hi there!"'}),
            new Text('id1', 't2', {content: '23 + 45'}),
    ]
        )])

    const gen = new Generator(app)

    expect(gen.outputFiles()[0].name).toBe('Page1.js')
    expect(gen.outputFiles()[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {})

    return React.createElement('div', {id: props.path},
        React.createElement(TextElement, {path: pathWith('TextInput1')}, "Hi there!"),
        React.createElement(TextElement, {path: pathWith('t2')}, 23 + 45),
    )
}
`)
    expect(gen.outputFiles()[1].name).toBe('appMain.js')
    expect(gen.outputFiles()[1].content).toBe(`function AppMain(props) {

    return React.createElement('div', {id: 'app'},
        React.createElement(Page1, {path: 'app.Page1'})
    )
}
`)

})

test('generates TextInput elements with initial value', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new TextInput('id1', 't1', {initialValue: '"Hi there!"', maxLength: '10', label: '"Text Input One"'}),
            new TextInput('id2', 't2', {initialValue: '"Some" + " things"', maxLength: '5 + 5'}),
            new TextInput('id2', 't3', {}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.outputFiles()[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {
        t1: {value: "Hi there!"},
        t2: {value: "Some" + " things"},
        t3: {value: ""},
    })

    return React.createElement('div', {id: props.path},
        React.createElement(TextInput, {path: pathWith('t1'), initialValue: "Hi there!", maxLength: 10, label: "Text Input One"}),
        React.createElement(TextInput, {path: pathWith('t2'), initialValue: "Some" + " things", maxLength: 5 + 5}),
        React.createElement(TextInput, {path: pathWith('t3')}),
    )
}
`)
})

test('generates error marker for syntax error in content expression', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: '23 +'}),
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
                new Text('id1', 't1', {content: 'sum(2, 3, 4)'}),
            ]
        )])

    const content = new Generator(app).outputFiles()[0].content
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = useObjectStateWithDefaults(props.path, {})
    const {sum} = window.globalFunctions
    return React.createElement('div', {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, sum(2, 3, 4)),
    )
}
`)
})

test('unknown global functions show error marker', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {content: 'sumxx(2, 3, 4)'}),
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
                new Text('id1', 't1', {content: 'ForenameInput.value + " " + SurnameInput.value'}),
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



