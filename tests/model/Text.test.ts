import {expect, test} from "vitest"
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asAny, asJSON, ex} from '../testutil/testHelpers'
import {newText, textClass} from '../testutil/modelHelpers'
import BaseElement from '../../src/model/BaseElement'
import BaseInputElement from '../../src/model/BaseInputElement'

test('extends correct class', () => {
    const text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    expect(text1).toBeInstanceOf(BaseElement)
    expect(text1).not.toBeInstanceOf(BaseInputElement)
})

test('Text has correct properties with default values', ()=> {
    const text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    const text1_ = asAny(text1)
    expect(text1.id).toBe('t1')
    expect(text1.name).toBe('Text 1')
    expect(text1.kind).toBe('Text')
    expect(text1.notes).toBe(undefined)
    expect(text1_.content).toStrictEqual(ex`"Some text"`)
    expect(text1_.allowHtml).toBe(undefined)
    expect(text1_.styles).toBe(undefined)
    expect(text1_.show).toBe(undefined)
    expect(text1.isLayoutOnly()).toBe(true)
})

test('Text has correct properties with specified values', ()=> {
    const styles = {fontSize: 32, fontFamily: 'Courier', color: 'red', backgroundColor: 'blue', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 20}
    const text1 = newText('t1', 'Text 1', {notes:'This is some text', content: ex`"Some text"`, allowHtml: true, show: false,
        styles: styles})
    const text1_ = asAny(text1)

    expect(text1.id).toBe('t1')
    expect(text1.name).toBe('Text 1')
    expect(text1.notes).toBe('This is some text')
    expect(text1_.content).toStrictEqual(ex`"Some text"`)
    expect(text1_.allowHtml).toBe(true)
    expect(text1_.show).toBe(false)
    expect(text1_.styles).toStrictEqual(styles)
})

test('has initial properties', () => {
    expect(asAny(textClass).initialProperties).toEqual({content: 'Your text here'})
})

test('has fixedOnly for allowHtml propert', () => {
    const text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    const allowHtmlPropDef = text1.propertyDefs.find( pd => pd.name === 'allowHtml')
    expect(allowHtmlPropDef?.fixedOnly).toBe(true)
})

test('tests if an object is this type', ()=> {
    const text = newText('t1', 'Text 1', {content: ex`"Some text"`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(textClass.is(text)).toBe(true)
    expect(textClass.is(page)).toBe(false)
})

test('can contain expected types', () => {
    const text = newText('t1', 'Text 1', {}, [])
    expect(text.canContain('Project')).toBe(false)
    expect(text.canContain('App')).toBe(false)
    expect(text.canContain('Page')).toBe(false)
    expect(text.canContain('Block')).toBe(true)
    expect(text.canContain('MemoryDataStore')).toBe(false)
    expect(text.canContain('FileDataStore')).toBe(false)
    expect(text.canContain('Text')).toBe(true)
    expect(text.canContain('Button')).toBe(true)
    expect(text.canContain('DataTypes')).toBe(false)
    expect(text.canContain('TrueFalseType')).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const text = newText('t1', 'Text 1', {content: ex`"Some text"`})
    const updatedText1 = text.set('t1', 'name', 'Text 1A')
    expect(updatedText1.name).toBe('Text 1A')
    expect(asAny(updatedText1).content).toStrictEqual(ex`"Some text"`)
    expect(text.name).toBe('Text 1')
    expect(asAny(text).content).toStrictEqual(ex`"Some text"`)

    const updatedText2 = updatedText1.set('t1', 'content', ex`shazam`)
    expect(updatedText2.name).toBe('Text 1A')
    expect(asAny(updatedText2).content).toStrictEqual(ex`shazam`)
    expect(updatedText1.name).toBe('Text 1A')
    expect(asAny(updatedText1).content).toStrictEqual(ex`"Some text"`)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text = newText('t1', 'Text 1', {content: ex`"Some text"`})
    const updatedText = text.set('x1', 'name', ex`Text 1A`)
    expect(updatedText).toStrictEqual(text)
})

test('converts to JSON without optional properties', ()=> {
    const text = newText('t1', 'Text 1', {content: ex`"Some text"`})
    expect(asJSON(text)).toStrictEqual({
        kind: 'Text',
        id: 't1',
        name: 'Text 1',
        properties: text.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const styles = {fontSize: 44, fontFamily: 'Dog', color: 'red', backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 40}
    const text = newText('t1', 'Text 1', {content: ex`"Some text"`, styles: styles, show: ex`false`})
    expect(asJSON(text)).toStrictEqual({
        kind: 'Text',
        id: 't1',
        name: 'Text 1',
        properties: text.properties
    })
})

test('converts from plain object', ()=> {
    const styles = {fontSize: ex`44`, fontFamily: 'Dog', color: ex`'red'`, backgroundColor: 'green', border: 10, borderColor: 'black', width: 100, height: 200, marginBottom: 40}
    const text = newText('t1', 'Text 1', {content: ex`"Some text"`, styles: styles})
    const plainObj = asJSON(text)
    const loadedText = loadJSON(plainObj)
    expect(loadedText).toStrictEqual(text)

    const text2 = newText('t1', 'Text 2', {content: `Some text`, styles: styles, show: false})
    const plainObj2 = asJSON(text2)
    const loadedText2 = loadJSON(plainObj2)
    expect(loadedText2).toStrictEqual(text2)
})

