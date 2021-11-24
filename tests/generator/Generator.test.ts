import Generator from '../../src/generator/Generator'
import App from '../../src/model/App';
import Text from '../../src/model/Text';
import Page from '../../src/model/Page'
import Element from '../../src/model/Element'
import BaseElement from '../../src/model/BaseElement'
import {ElementType} from '../../src/model/Types'

test('generates multiple text elements on a page', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Text('id1', 't1', {contentExpr: '"Hi there!"'}),
            new Text('id1', 't2', {contentExpr: '23 + 45'}),
    ]
        )])

    const gen = new Generator(app)
    expect(gen.outputFiles()[0].name).toBe('appMain.js')
    expect(gen.outputFiles()[0].content).toBe(`function AppMain(props) {

    return React.createElement('div', null,
    React.createElement('div', null,
        React.createElement(TextElement, null, "Hi there!"),
        React.createElement(TextElement, null, 23 + 45),
    )
    )
}
`
    )

})

test('generates error marker for syntax error in content expression', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {contentExpr: '23 +'}),
            ]
        )])

    const gen = new Generator(app)
    expect(gen.outputFiles()[0].content).toBe(`function AppMain(props) {

    return React.createElement('div', null,
    React.createElement('div', null,
        React.createElement(TextElement, null, React.createElement('span', {title: "Error: Line 1: Unexpected end of input"}, '#ERROR')),
    )
    )
}
`)

})

test('global functions available in content expression', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {contentExpr: 'sum(2, 3, 4)'}),
            ]
        )])

    const content = new Generator(app).outputFiles()[0].content
    expect(content).toBe(`function AppMain(props) {
    const {sum} = window.globalFunctions
    return React.createElement('div', null,
    React.createElement('div', null,
        React.createElement(TextElement, null, sum(2, 3, 4)),
    )
    )
}
`)
})

test('unknown global functions show error marker', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
                new Text('id1', 't1', {contentExpr: 'sumxx(2, 3, 4)'}),
            ]
        )])

    const content = new Generator(app).outputFiles()[0].content
    expect(content).toBe(`function AppMain(props) {

    return React.createElement('div', null,
    React.createElement('div', null,
        React.createElement(TextElement, null, React.createElement('span', {title: "Unknown names: sumxx"}, '#ERROR')),
    )
    )
}
`)

})

class Funny extends BaseElement<object> implements Element {
    id = 'x'
    kind: ElementType = 'Page'
    name = 'f'
    properties = {}

}

test.skip('outputs warning marker for unexpected element type', ()=> {
    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Funny('x', 'n', {}),
        ])])

    const gen = new Generator(app)
    expect(gen.outputFiles()[0].content).toBe(`function AppMain(props) {
    return React.createElement('div', null,
    React.createElement('div', null,
        React.createElement(div, null, '???'),
    )
    )
}
`
    )
})


