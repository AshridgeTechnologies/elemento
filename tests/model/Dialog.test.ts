import {expect, test} from "vitest"
import Dialog from '../../src/model/Dialog'
import {asJSON, ex} from '../testutil/testHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import Page from '../../src/model/Page'
import {newText, newTextInput} from '../testutil/modelHelpers'

test('Dialog has correct defaults', ()=> {
    let text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = newText('t2', 'Text 2', {content: ex`"More text"`})
    const dialog = new Dialog('dlg1', 'Dialog the First', {}, [text1, text2])

    expect(dialog.id).toBe('dlg1')
    expect(dialog.name).toBe('Dialog the First')
    expect(dialog.codeName).toBe('DialogtheFirst')
    expect(dialog.initiallyOpen).toBe(undefined)
    expect(dialog.showCloseButton).toBe(undefined)
    expect(dialog.styles).toBe(undefined)
    expect(dialog.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
    expect(dialog.type()).toBe('statefulUI')
})

test('Dialog has correct properties', ()=> {
    let text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = newText('t2', 'Text 2', {content: ex`"More text"`})
    const dialog = new Dialog('dlg1', 'Dialog the First', {layout: 'horizontal', initiallyOpen: true, showCloseButton: true, styles: {width: 500, backgroundColor: 'blue'}}, [text1, text2])

    expect(dialog.id).toBe('dlg1')
    expect(dialog.name).toBe('Dialog the First')
    expect(dialog.codeName).toBe('DialogtheFirst')
    expect(dialog.layout).toBe('horizontal')
    expect(dialog.initiallyOpen).toBe(true)
    expect(dialog.showCloseButton).toBe(true)
    expect(dialog.styles).toStrictEqual({width: 500, backgroundColor: 'blue'})
    expect(dialog.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
})

test('tests if an object is this type', ()=> {
    const dialog = new Dialog('l1', 'Dialog 1', {}, [])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Dialog.is(dialog)).toBe(true)
    expect(Dialog.is(page)).toBe(false)
})

test('has correct property defs', () => {
    const dialog = new Dialog('l1', 'Dialog 1', {}, [])
    expect(dialog.propertyDefs.map( d => d.name)).toStrictEqual(['layout', 'initiallyOpen', 'showCloseButton', 'styles'])
})

test('creates an updated object with a property set to a new value', ()=> {
    const text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = newText('t2', 'Text 2', {content: ex`"Some text"`})
    const dialog = new Dialog('dlg1', 'Dialog 1', {initiallyOpen: true}, [text1])
    const updatedDialog1 = dialog.set('dlg1', 'name', 'Dialog 1A')
    expect(updatedDialog1.name).toBe('Dialog 1A')
    expect(updatedDialog1.initiallyOpen).toBe(true)
    expect(updatedDialog1.elements).toBe(dialog.elements)
    expect(dialog.name).toBe('Dialog 1')

    const updatedDialog2 = updatedDialog1.set('dlg1', 'elements', [text1, text2])
    expect(updatedDialog2.name).toBe('Dialog 1A')
    expect(updatedDialog2.elements).toStrictEqual([text1, text2])
    expect(updatedDialog1.name).toBe('Dialog 1A')
    expect(updatedDialog1.elements).toStrictEqual([text1])
})

test('can contain correct types', () => {
    const dialog = new Dialog('dlg1', 'Dialog 1', {}, [])
    expect(dialog.canContain('Project')).toBe(false)
    expect(dialog.canContain('App')).toBe(false)
    expect(dialog.canContain('Page')).toBe(false)
    expect(dialog.canContain('Block')).toBe(true)
    expect(dialog.canContain('Dialog')).toBe(false)
    expect(dialog.canContain('MemoryDataStore')).toBe(false)
    expect(dialog.canContain('FileDataStore')).toBe(false)
    expect(dialog.canContain('Text')).toBe(true)
    expect(dialog.canContain('Button')).toBe(true)
    expect(dialog.canContain('DataTypes')).toBe(false)
    expect(dialog.canContain('TrueFalseType')).toBe(false)})


test('finds itself but not children in a page', () => {
    const text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    const dialog = new Dialog('dlg1', 'Dialog 1', {}, [text1])
    const page = new Page('p1', 'Page 1', {}, [dialog])

    expect(page.findElementByPath('Page1.Dialog1')).toBe(dialog)
    expect(page.findElementByPath('Page1.Text1')).toBe(null)
})

test('converts to JSON', ()=> {
    let text1 = newText('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = newText('t2', 'Text 2', {content: ex`"More text"`})
    const dialog = new Dialog('dlg1', 'Dialog 1', {layout: 'vertical', initiallyOpen: true, styles: {width: '50%', backgroundColor: 'green'}}, [text1, text2])

    expect(asJSON(dialog)).toStrictEqual({
        kind: 'Dialog',
        id: 'dlg1',
        name: 'Dialog 1',
        properties: dialog.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

    const dialog2 = new Dialog('dlg2', 'Dialog 2', {}, [text1, text2])

    expect(asJSON(dialog2)).toStrictEqual({
        kind: 'Dialog',
        id: 'dlg2',
        name: 'Dialog 2',
        properties: dialog2.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })
})

test('converts from plain object with correct types for elements', ()=> {
    let text = newText('t1', 'Text 1', {content: ex`"Some text"`})
    let textInput = newTextInput('t2', 'Text Input 2', {initialValue: ex`"Input text"`, styles: {width: ex`7`}})
    const dialog = new Dialog('dlg1', 'Dialog 1', {initiallyOpen: true}, [text, textInput])
    const newDialog = loadJSON(asJSON(dialog))
    expect(newDialog).toStrictEqual<Dialog>(dialog)
})
