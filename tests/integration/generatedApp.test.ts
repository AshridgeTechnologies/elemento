import renderer from 'react-test-renderer'
import React, {FunctionComponent} from 'react'
import TextElement from '../../src/runtime/TextElement'
import Text from '../../src/model/Text'
import App from '../../src/model/App'
import Generator from '../../src/generator/Generator'
import Page from '../../src/model/Page'

test('generated AppMain has correct contentExpr', ()=> {

    const app = new App('t1', 'test1', [
        new Page('p1', 'Page 1', [
            new Text('id1', 't1', '"Hi there!"'),
            new Text('id1', 't2', '2 + 2'),
        ])])

    const gen = new Generator(app)
    expect(gen.outputFiles()[0].name).toBe('appMain.js')
    const appMainCode = gen.outputFiles()[0].content
    const appMainBody = appMainCode.replace(/^function AppMain.*/m, '').replace(/^}$/m, '').trim()

    const AppMain = new Function(appMainBody) as FunctionComponent

    global.React = React
    // @ts-ignore
    global.TextElement = TextElement
    const component = renderer.create(React.createElement(AppMain))
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})