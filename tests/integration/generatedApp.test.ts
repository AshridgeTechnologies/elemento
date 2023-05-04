/**
 * @jest-environment jsdom
 */

import Text from '../../src/model/Text'
import App from '../../src/model/App'
import {generate} from '../../src/generator/Generator'
import Page from '../../src/model/Page'
import {ex, wait} from '../testutil/testHelpers'
import {runAppFromWindowUrl} from '../../src/runner/AppMain'
import '@testing-library/jest-dom'
import {act} from '@testing-library/react'
import {containerFunctions} from '../testutil/rtlHelpers'
import Project from '../../src/model/Project'
import DateType from '../../src/model/types/DateType'
import DataTypes from '../../src/model/types/DataTypes'
import TextType from '../../src/model/types/TextType'
import TextInput from '../../src/model/TextInput'

afterEach(() => {
    // @ts-ignore
    global.fetch = undefined
})

test('generated app can be shown in runner page', async ()=> {

    const app = new App('t1', 'Test 1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Text('text1', 'Text 1', {content: ex`"Hi there!"`}),
            new Text('text2', 'Text 2', {content: ex`2 + 2`}),
        ])])

    const project = new Project('proj1', 'Project 1', {}, [app])
    const theAppCode = generate(app, project).code
    // @ts-ignore
    global.fetch = jest.fn(() => Promise.resolve( {text: () => wait(10).then( () => theAppCode )}))

    await act( () => runAppFromWindowUrl('/web/some.funky.app'))
    await act( () => wait(20) )

    const {expectEl} = containerFunctions(document.getElementById('main') as HTMLElement)
    expectEl('Text1').toHaveTextContent('Hi there!')
    expectEl('Text2').toHaveTextContent(/^4$/)
})

test('generated code includes types which can be referenced in the app', async ()=> {

    const app = new App('t1', 'Test 1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Text('text1', 'Text 1', {content: ex`"Enter up to " + MyTypes.Text1.maxLength + " characters"`}),
            new TextInput('textInput2', 'Text Input', {maxLength: ex`MyTypes.Text1.maxLength`}),
        ])])

    const textType1 = new TextType('tt1', 'Text 1', {description: 'The text', maxLength: 20}, )
    const dataTypes = new DataTypes('dt1', 'My Types', {}, [textType1])

    const project = new Project('proj1', 'Project 1', {}, [app, dataTypes])
    const theAppCode = generate(app, project).code
    // @ts-ignore
    global.fetch = jest.fn(() => Promise.resolve( {text: () => wait(10).then( () => theAppCode )}))

    await act( () => runAppFromWindowUrl('/web/some.funky.app'))
    await act( () => wait(20) )

    const {expectEl} = containerFunctions(document.getElementById('main') as HTMLElement)
    expectEl('Text1').toHaveTextContent('Enter up to 20 characters')
    expectEl('TextInput').toHaveAttribute('maxlength', '20')
})
