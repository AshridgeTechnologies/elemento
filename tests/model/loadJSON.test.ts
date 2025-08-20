import {expect, test} from "vitest"
import Page from '../../src/model/Page'
import App from '../../src/model/App'
import {loadJSON, loadJSONFromString} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'
import DateType from '../../src/model/types/DateType'
import Block from '../../src/model/Block'
import {newText, newTextInput} from '../testutil/modelHelpers'
import BaseElement from '../../src/model/BaseElement'

// tests for loadJSON are in the test for each model class

test('converts single element from JSON string', ()=> {
    const text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = newText('t3', 'Text 3', {content: ex`"Some text 3"`})
    const textInput4 = newTextInput('t4', 'Text 4', {initialValue: ex`"Some text"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, textInput4])

    const app = new App('a1', 'App 1', {author: ex`Jo`}, [page1, page2])
    const newApp = loadJSONFromString(JSON.stringify(app))
    expect(newApp).toStrictEqual<App>(app)
})

test('converts array of elements from JSON string', ()=> {
    const text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = newText('t3', 'Text 3', {content: ex`"Some text 3"`})
    const elements = [text1, page1, text3]
    const newElements = loadJSONFromString(JSON.stringify(elements))
    expect(newElements).toStrictEqual(elements)
})

test('converts ISO date string to Date', () => {
    const date1 = new Date('2020-04-05')
    const dateType1 = new DateType('id1', 'DateType 1', {description: 'Desc 1', max: date1})
    const newDateType = loadJSONFromString(JSON.stringify(dateType1))
    expect(newDateType).toStrictEqual<DateType>(dateType1)
})

test('does not convert numeric string to Date', () => {
    const textInput = newTextInput('t1', 'Text 1', {label: "32"})
    const reloadedTextInput = loadJSONFromString(JSON.stringify(textInput))
    expect(reloadedTextInput).toStrictEqual(textInput)
})

test('converts Layout to Block', () => {
    let text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = newText('t2', 'Text 2', {content: ex`"More text"`})
    const layout1 = {
        kind: 'Layout',
        id: 'lay1',
        name: 'Layout 1',
        properties: {horizontal: true, styles: {width: '50%', backgroundColor: 'green'}},
        elements: [asJSON(text1), asJSON(text2)]
    }
    const layout2 = {
        kind: 'Layout',
        id: 'lay2',
        name: 'Layout 2',
        properties: {horizontal: true, wrap: true},
    }
    const layout3 = {
        kind: 'Layout',
        id: 'lay3',
        name: 'Layout 3',
        properties: {},
    }

    const layout4 = {
        kind: 'Layout',
        id: 'lay4',
        name: 'Layout 4',
        properties: {horizontal: ex`1 == 2`},
    }

    expect(loadJSON(layout1)).toBeInstanceOf(Block)
    expect((loadJSON(layout1) as Block).layout).toBe('horizontal')
    expect((loadJSON(layout2) as Block).layout).toBe('horizontal wrapped')
    expect((loadJSON(layout3) as Block).layout).toBe('vertical')
    expect((loadJSON(layout4) as Block).layout).toBe('horizontal')
    expect((loadJSON(layout1) as Block).elementArray()[0]).toBeInstanceOf(BaseElement)
})
