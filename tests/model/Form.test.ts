import {expect, test} from "vitest"
import App from '../../src/model/App'
import {asJSON, ex} from '../testutil/testHelpers'
import {loadJSON} from '../../src/model/loadJSON'
import {Page, Block, Text, TextInput, Form} from '../testutil/modelHelpers'

test('Form has correct defaults', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const form = new Form('form1', 'Form the First', {}, [text1, text2])

    expect(form.id).toBe('form1')
    expect(form.name).toBe('Form the First')
    expect(form.codeName).toBe('FormtheFirst')
    expect(form.horizontal).toBe(false)
    expect(form.styles).toBe(undefined)
    expect(form.wrap).toBe(false)
    expect(form.keyAction).toBe(undefined)
    expect(form.submitAction).toBe(undefined)
    expect(form.elementArray().map( (el: any) => el.id )).toStrictEqual(['t1', 't2'])
})

test('Form has correct properties', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const form = new Form('form1', 'Form the First', {initialValue: ex`{a: 'foo', b: 42}`, horizontal: ex`1 === 2`, styles: {width: 500},
        wrap: true, label: ex`Text One`, readOnly: true, dataType: ex`recordType1`,
    keyAction: ex`Log('You pressed ' + \$key)`, submitAction: ex`Log('You submitted ' + \$data)`}, [text1, text2])

    expect(form.id).toBe('form1')
    expect(form.name).toBe('Form the First')
    expect(form.codeName).toBe('FormtheFirst')
    expect(form.initialValue).toStrictEqual(ex`{a: 'foo', b: 42}`)
    expect(form.readOnly).toBe(true)
    expect(form.label).toStrictEqual(ex`Text One`)
    expect(form.dataType).toStrictEqual(ex`recordType1`)
    expect(form.horizontal).toStrictEqual(ex`1 === 2`)
    expect(form.styles).toStrictEqual({width: 500})
    expect(form.wrap).toBe(true)
    expect(form.keyAction).toStrictEqual(ex`Log('You pressed ' + \$key)`)
    expect(form.submitAction).toStrictEqual(ex`Log('You submitted ' + \$data)`)
    expect(form.elementArray().map( (el: any) => el.id )).toStrictEqual(['t1', 't2'])
})

test('tests if an object is this type', ()=> {
    const form = new Form('l1', 'Form 1', {}, [])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Form.is(form)).toBe(true)
    expect(Form.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"Some text"`})
    const form = new Form('form1', 'Form 1', {horizontal: true}, [text1])
    const updatedForm1 = form.set('form1', 'name', 'Form 1A')
    expect(updatedForm1.name).toBe('Form 1A')
    expect(updatedForm1.elements).toBe(form.elements)
    expect(updatedForm1.horizontal).toBe(true)
    expect(form.name).toBe('Form 1')

    const updatedForm2 = updatedForm1.set('form1', 'elements', [text1, text2])
    expect(updatedForm2.name).toBe('Form 1A')
    expect(updatedForm2.elements).toStrictEqual([text1, text2])
    expect(updatedForm1.name).toBe('Form 1A')
    expect(updatedForm1.elements).toStrictEqual([text1])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const form1 = new Form('form1', 'Form 1', {}, [text1])
    const updatedForm = form1.set('x1', 'name', 'Form 1A')
    expect(updatedForm).toBe(form1)
})

test('can contain types apart from Project, App, Page', () => {
    const form = new Form('form1', 'Form 1', {}, [])
    expect(form.canContain('Project')).toBe(false)
    expect(form.canContain('App')).toBe(false)
    expect(form.canContain('Page')).toBe(false)
    expect(form.canContain('Form')).toBe(true)
    expect(form.canContain('Block')).toBe(true)
    expect(form.canContain('MemoryDataStore')).toBe(false)
    expect(form.canContain('FileDataStore')).toBe(false)
    expect(form.canContain('Text')).toBe(true)
    expect(form.canContain('Button')).toBe(true)
    expect(form.canContain('DataTypes')).toBe(false)
    expect(form.canContain('TrueFalseType')).toBe(false)
})

test('can be contained by Form, Block and Page', () => {
    const form = new Form('form1', 'Form 1', {}, [])
    const app = new App('app1', 'App1', {}, [])
    const page = new Page('page1', 'Page 1', {}, [])
    const block = new Block('lay1', 'Layout 1', {}, [])
    const text = new Text('text1', 'Text 1', {}, [])
    expect(form.canContain('Form')).toBe(true)
    expect(app.canContain('Form')).toBe(false)
    expect(page.canContain('Form')).toBe(true)
    expect(block.canContain('Form')).toBe(true)
    expect(text.canContain('Form')).toBe(false)
})


test('finds itself and children in a page', () => {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const innerForm = new Form('form2', 'Form 2', {}, [text2])
    const form = new Form('form1', 'Form 1', {}, [text1, innerForm])
    const page = new Page('p1', 'Page 1', {}, [form])

    expect(page.findElementByPath('Page1.Form1')).toBe(form)
    expect(page.findElementByPath('Page1.Form1.Text1')).toBe(text1)
    expect(page.findElementByPath('Page1.Form1.Form2.Text2')).toBe(text2)
})

test('converts to JSON', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const form = new Form('form1', 'Form 1', {horizontal: ex`1 == 2`, styles: {width: '50%'}}, [text1, text2])

    expect(asJSON(form)).toStrictEqual({
        kind: 'Form',
        id: 'form1',
        name: 'Form 1',
        properties: form.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

    const form2 = new Form('form1', 'Form 2', {horizontal: true}, [text1, text2])

    expect(asJSON(form2)).toStrictEqual({
        kind: 'Form',
        id: 'form1',
        name: 'Form 2',
        properties: form2.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

})

test('converts from plain object with correct types for elements', ()=> {
    let text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let textInput = new TextInput('t2', 'Text Input 2', {initialValue: ex`"Input text"`, styles: {width: ex`7`}})
    const form = new Form('form1', 'Form 1', {horizontal: ex`false`}, [text, textInput])
    const newForm = loadJSON(asJSON(form))
    expect(newForm).toStrictEqual<typeof Form>(form)
    const form2 = new Form('form1', 'Form 2', {horizontal: true}, [text, textInput])
    const newForm2 = loadJSON(asJSON(form2))
    expect(newForm2).toStrictEqual<typeof Form>(form2)
})

test('has correct property defs', () => {
    const form = new Form('f1', 'Form 1', {})
    const {propertyDefs} = form
    expect(propertyDefs.map( (def: any) => def.name ))
        .toStrictEqual(['initialValue', 'label', 'readOnly', 'dataType', 'show', 'horizontal', 'wrap', 'keyAction', 'submitAction', 'styles'])
    const initialValueDef = form.propertyDefs.find( (pd: any) => pd.name === 'initialValue')
    expect(initialValueDef?.type).toBe('expr')
})
