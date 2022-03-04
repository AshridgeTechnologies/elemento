import renderer from 'react-test-renderer'
import React, {FunctionComponent} from 'react'
import TextElement from '../../src/runtime/TextElement'
import Text from '../../src/model/Text'
import App from '../../src/model/App'
import Generator from '../../src/generator/Generator'
import Page from '../../src/model/Page'
import RuntimePage from '../../src/runtime/Page'
import {useObjectStateWithDefaults} from '../../src/runtime/appData'
import {ex} from '../../src/util/helpers'

let makeComponentFunction = function (functionCode: string) {
    const functionBody = functionCode.replace(/^function \w+.*/m, '').replace(/^}$/m, '').trim()
    return new Function('props', functionBody) as FunctionComponent
}

test('generated Page creates React element with correct structure', ()=> {

    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Text('id1', 't1', {content: ex`"Hi there!"`}),
            new Text('id1', 't2', {content: ex`2 + 2`}),
        ])])

    const gen = new Generator(app)
    expect(gen.output().files[0].name).toBe('Page1.js')
    const PageComponent = makeComponentFunction(gen.output().files[0].content)

    global.React = React
    // @ts-ignore
    global.TextElement = TextElement
    // @ts-ignore
    global.Page = RuntimePage
    // @ts-ignore
    global.useObjectStateWithDefaults = useObjectStateWithDefaults
    // @ts-ignore
    const component = renderer.create(React.createElement(PageComponent, {path: 'app.Page1'}))
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})

test('generated AppMain creates React elements with correct structure', ()=> {

    const app = new App('t1', 'test1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Text('id1', 't1', {content: ex`"Hi there!"`}),
            new Text('id1', 't2', {content: ex`2 + 2`}),
        ])])

    const gen = new Generator(app)
    expect(gen.output().files[1].name).toBe('appMain.js')

    const Page1 = makeComponentFunction(gen.output().files[0].content)
    const AppMain = makeComponentFunction(gen.output().files[1].content)

    global.React = React
    // @ts-ignore
    global.Page = RuntimePage
    // @ts-ignore
    global.TextElement = TextElement
    // @ts-ignore
    global.Page1 = Page1
    // @ts-ignore
    global.useObjectStateWithDefaults = useObjectStateWithDefaults
    const component = renderer.create(React.createElement(AppMain))
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})
