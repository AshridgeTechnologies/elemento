import {expect, test} from "vitest"
import {asJSON, ex} from '../testutil/testHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import {Page, Text, TextInput, AppBar} from '../testutil/modelHelpers'

test('AppBar has correct properties', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const appBar: any = new AppBar('ab1', 'AppBar the First', {title: 'My App', show: ex`1 && 1`, styles: {color: 'red'}}, [text1, text2])

    expect(appBar.id).toBe('ab1')
    expect(appBar.name).toBe('AppBar the First')
    expect(appBar.codeName).toBe('AppBartheFirst')
    expect(appBar.title).toBe('My App')
    expect(appBar.show).toStrictEqual(ex`1 && 1`)
    expect(appBar.styles).toStrictEqual({color: 'red'})
    expect(appBar.elementArray().map( (el: Element) => el.id )).toStrictEqual(['t1', 't2'])
})

test('has correct property names', () => {
    expect(new AppBar('ab1', 'Bar 1', {}).propertyDefs.map( (def: any) => def.name )).toStrictEqual(['title', 'show', 'styles'])
})

test('tests if an object is this type', ()=> {
    const appBar = new AppBar('ab1', 'AppBar 1', {}, [])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(AppBar.is(appBar)).toBe(true)
    expect(AppBar.is(page)).toBe(false)
})

test('is layout only', () => {
    const appBar = new AppBar('ab1', 'AppBar 1', {}, [])
    expect(appBar.isLayoutOnly()).toBe(true)
})

test('can contain types apart from Project, App, Page, DataStore, Collection', () => {
    const appBar = new AppBar('ab1', 'AppBar 1', {}, [])
    expect(appBar.canContain('Project')).toBe(false)
    expect(appBar.canContain('App')).toBe(false)
    expect(appBar.canContain('AppBar')).toBe(false)
    expect(appBar.canContain('MenuItem')).toBe(false)
    expect(appBar.canContain('Page')).toBe(false)
    expect(appBar.canContain('MemoryDataStore')).toBe(false)
    expect(appBar.canContain('Text')).toBe(true)
    expect(appBar.canContain('Button')).toBe(true)
    expect(appBar.canContain('DataTypes')).toBe(false)
    expect(appBar.canContain('RecordType')).toBe(false)})

test('converts to JSON', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const appBar = new AppBar('ab1', 'AppBar 1', {title: 'The App', styles: {color: 'red'}}, [text1, text2])

    expect(asJSON(appBar)).toStrictEqual({
        kind: 'AppBar',
        id: 'ab1',
        name: 'AppBar 1',
        properties: appBar.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })
})

test('converts from plain object with correct types for elements', ()=> {
    let text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let textInput = new TextInput('t2', 'Text Input 2', {initialValue: ex`"Input text"`, styles: {width: ex`70`}})
    const appBar = new AppBar('p1', 'AppBar 1', {title: 'An App', styles: {color: 'red'}}, [text, textInput])
    const newAppBar = loadJSON(asJSON(appBar))
    expect(newAppBar).toStrictEqual(appBar)
})

