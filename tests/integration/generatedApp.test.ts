/**
 * @vitest-environment jsdom
 */

import App from '../../src/model/App'
import {generate} from '../../src/generator/Generator'
import Page from '../../src/model/Page'
import {ex, wait} from '../testutil/testHelpers'
import {runAppFromWindowUrl} from '../../src/runner/AppMain'

import {act} from '@testing-library/react'
import {containerFunctions} from '../testutil/rtlHelpers'
import Project1 from '../../src/model/Project'
import Project2 from '../../src/model/Project'
import DataTypes from '../../src/model/types/DataTypes'
import TextType from '../../src/model/types/TextType'
import {Text, TextInput} from '../testutil/modelHelpers'

afterEach(() => {
    // @ts-ignore
    global.fetch = undefined
})

// needs needs better way of mocking load from a http URL
test.skip('generated app can be shown in runner page', async ()=> {

    const app = new App('t1', 'Test 1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Text('text1', 'Text 1', {content: ex`"Hi there!"`}),
            new Text('text2', 'Text 2', {content: ex`2 + 2`}),
        ])])

    const project = Project2.new([app], 'Project 1', 'proj1', {})
    const theAppCode = generate(app, project).code
    // @ts-ignore
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve( {text: () => wait(10).then( () => theAppCode )}))

    await act( () => runAppFromWindowUrl({origin: 'http://example.com', pathname: '/web/some.funky.app'}, 'main1'))
    await act( () => wait(20) )

    const {expectEl} = containerFunctions(document.getElementById('main1') as HTMLElement)
    expectEl('Text1').toHaveTextContent('Hi there!')
    expectEl('Text2').toHaveTextContent(/^4$/)
})

// needs better way of mocking load from a http URL
test.skip('generated code includes types which can be referenced in the app', async ()=> {

    const app = new App('t1', 'Test 1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Text('text1', 'Text 1', {content: ex`"Enter up to " + MyTypes.Text1.maxLength + " characters"`}),
            new TextInput('textInput2', 'Text Input', {styles: {width: ex`MyTypes.Text1.maxLength`}}),
        ])])

    const textType1 = new TextType('tt1', 'Text 1', {description: 'The text', maxLength: 20}, )
    const dataTypes = new DataTypes('dt1', 'My Types', {}, [textType1])

    const project = Project1.new([app, dataTypes], 'Project 1', 'proj1', {})
    const theAppCode = generate(app, project).code
    // @ts-ignore
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve( {text: () => wait(10).then( () => theAppCode )}))

    await act( () => runAppFromWindowUrl({origin: 'http://example.com', pathname: '/web/some.funky.app'}, 'main2'))
    await act( () => wait(20) )

    const {expectEl} = containerFunctions(document.getElementById('main2') as HTMLElement)
    expectEl('Text1').toHaveTextContent('Enter up to 20 characters')
    expectEl('TextInput_textInput2').toHaveAttribute('maxlength', '20')
})
