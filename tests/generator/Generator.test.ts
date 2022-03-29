import Generator, {generate} from '../../src/generator/Generator'
import App from '../../src/model/App';
import Text from '../../src/model/Text';
import Button from '../../src/model/Button';
import Page from '../../src/model/Page'
import TextInput from '../../src/model/TextInput'
import NumberInput from '../../src/model/NumberInput'
import TrueFalseInput from '../../src/model/TrueFalseInput'
import SelectInput from '../../src/model/SelectInput'
import Data from '../../src/model/Data'
import {ex} from '../testutil/testHelpers'

test('generates app and all page output files', ()=> {
    const app = new App('t1', 'App 1', {}, [
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
    const {Page, TextElement} = Elemento.components
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text2')}, 'Green!'),
        React.createElement(TextElement, {path: pathWith('t3')}, 'Red!'),
    )
}
`)
    expect(gen.output().files[2].name).toBe('appMain.js')
    expect(gen.output().files[2].content).toBe(`export default function AppMain(props) {

    const appPages = {Page1, Page2}
    const appState = Elemento.useObjectStateWithDefaults('app._data', {currentPage: Object.keys(appPages)[0]})
    const {currentPage} = appState
    return React.createElement('div', {id: 'App1'},
        React.createElement(appPages[currentPage], {path: \`App1.\${currentPage}\`})
    )
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
    const {Page, TextElement} = Elemento.components
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text1')}, 'Hi there!'),
    )
}

// Page2.js
function Page2(props) {
    const pathWith = name => props.path + '.' + name
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
    const {Page, TextElement} = Elemento.components
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Text2')}, 'Green!'),
    )
}

// appMain.js
export default function AppMain(props) {

    const appPages = {Page1, Page2}
    const appState = Elemento.useObjectStateWithDefaults('app._data', {currentPage: Object.keys(appPages)[0]})
    const {currentPage} = appState
    return React.createElement('div', {id: 'App1'},
        React.createElement(appPages[currentPage], {path: \`App1.\${currentPage}\`})
    )
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {
        t1: {value: 'Hi there!', defaultValue: ''},
        t2: {value: "Some" + " things", defaultValue: ''},
        t3: {defaultValue: ''},
    })
    const {Page, TextInput} = Elemento.components
    const {t1, t2, t3} = state
    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {state: t1, maxLength: 10, multiline: true, label: 'Text Input One', width: 150}),
        React.createElement(TextInput, {state: t2, maxLength: 5 + 5, label: 't2'}),
        React.createElement(TextInput, {state: t3, label: 't3'}),
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {
        t1: {value: 44, defaultValue: 0},
        t2: {value: 22 + 33, defaultValue: 0},
        t3: {defaultValue: 0},
    })
    const {Page, NumberInput} = Elemento.components
    const {t1, t2, t3} = state
    return React.createElement(Page, {id: props.path},
        React.createElement(NumberInput, {state: t1, label: 'Number Input One'}),
        React.createElement(NumberInput, {state: t2, label: 't2'}),
        React.createElement(NumberInput, {state: t3, label: 't3'}),
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {
        Select1: {value: '44', defaultValue: ''},
        Select2: {value: 4+"4", defaultValue: ''},
        Select3: {defaultValue: ''},
    })
    const {Page, SelectInput} = Elemento.components
    const {Select1, Select2, Select3} = state
    return React.createElement(Page, {id: props.path},
        React.createElement(SelectInput, {state: Select1, values: ['22', '33', '44'], label: 'Select Input One'}),
        React.createElement(SelectInput, {state: Select2, values: ['22', '33', '44'], label: 'Select2'}),
        React.createElement(SelectInput, {state: Select3, values: [], label: 'Select3'}),
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {
        t1: {value: true, defaultValue: false},
        t2: {value: true || false, defaultValue: false},
        t3: {defaultValue: false},
    })
    const {Page, TrueFalseInput} = Elemento.components
    const {t1, t2, t3} = state
    return React.createElement(Page, {id: props.path},
        React.createElement(TrueFalseInput, {state: t1, label: 'True False Input One'}),
        React.createElement(TrueFalseInput, {state: t2, label: 't2'}),
        React.createElement(TrueFalseInput, {state: t3, label: 't3'}),
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
    expect(gen.output().files[0].content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
    const {Page, Button} = Elemento.components
    const {Log} = Elemento.globalFunctions
    return React.createElement(Page, {id: props.path},
        React.createElement(Button, {path: pathWith('b1'), content: 'Click here!', action: () => {Log("You clicked me!")}}),
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {
        t1: {value: 44},
        t2: {value: {a:10, b: "Bee"}},
        t3: {},
    })
    const {Page, Data} = Elemento.components
    const {t1, t2, t3} = state
    return React.createElement(Page, {id: props.path},
        React.createElement(Data, {state: t1, display: false}),
        React.createElement(Data, {state: t2, display: true}),
        React.createElement(Data, {state: t3, display: false}),
    )
}
`)
    expect(output.errors).toStrictEqual({})
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
    const {Page, TextElement} = Elemento.components
    const {Sum} = Elemento.globalFunctions
    return React.createElement(Page, {id: props.path},
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

    const content = new Generator(app).output().files[0].content
    expect(content).toBe(`function Page1(props) {
    const pathWith = name => props.path + '.' + name
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
    const {Page, Button} = Elemento.components
    const {ShowPage} = Elemento.appFunctions(state)
    const Page2 = 'Page2'
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {
        ForenameInput: {defaultValue: ''},
        SurnameInput: {defaultValue: ''},
    })
    const {Page, TextElement, TextInput} = Elemento.components
    const {ForenameInput, SurnameInput} = state
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('t1')}, ForenameInput.value + " " + SurnameInput.value),
        React.createElement(TextInput, {state: ForenameInput, label: 'Forename Input'}),
        React.createElement(TextInput, {state: SurnameInput, label: 'Surname Input'}),
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {
        NameInput: {value: Elemento.codeGenerationError(\`{a: 10,\`, 'Error: Line 1: Unexpected token )'), defaultValue: ''},
    })
    const {Page, TextInput} = Elemento.components
    const {NameInput} = state
    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {state: NameInput, label: 'Name Input'}),
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

test('multiple statements in expression generates error', ()=> {
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {
        Input: {defaultValue: ''},
    })
    const {Page, TextInput, TextElement} = Elemento.components
    const {If} = Elemento.globalFunctions
    const {Input} = state
    return React.createElement(Page, {id: props.path},
        React.createElement(TextInput, {state: Input, label: 'Input'}),
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
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
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
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

