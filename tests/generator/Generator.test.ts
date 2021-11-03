import Generator from '../../src/generator/Generator'
import App from '../../src/model/App';
import Text from '../../src/model/Text';
import Page from '../../src/model/Page'
import Element, {ElementType} from '../../src/model/Element'


test('generates multiple text elements on a page', ()=> {
    const app = new App('t1', 'test1', [
        new Page('p1', 'Page 1', [
            new Text('id1', 't1', '"Hi there!"'),
            new Text('id1', 't2', 'someExpr'),
    ])])

    const gen = new Generator(app)
    expect(gen.outputFiles()[0].name).toBe('appMain.js')
    expect(gen.outputFiles()[0].content).toBe(`function AppMain(props) {
    return React.createElement('div', null,
    React.createElement('div', null,
        React.createElement(TextElement, null, "Hi there!"),
        React.createElement(TextElement, null, someExpr),
    )
    )
}
`
    )

})

test('outputs warning marker for unexpected element type', ()=> {
    class Funny implements Element {
        id = 'x'
        kind: ElementType = 'Page'
        name = 'f'
    }
    const app = new App('t1', 'test1', [
        new Page('p1', 'Page 1', [
            new Funny(),
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


