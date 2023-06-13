/**
 * @jest-environment jsdom
 */

import React, {KeyboardEventHandler} from 'react'
import {componentJSON, testAppInterface, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {BaseFormState, Form, NumberInput, TextElement, TextInput} from '../../../src/runtime/components'
import renderer from 'react-test-renderer'
import {useGetObjectState, useObjectState, useObjectStates} from '../../../src/runtime/appData'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {NumberType, RecordType, Rule, TextType} from '../../../src/shared/types'
import MockedFunction = jest.MockedFunction

const descriptionType = new TextType('tt1', {maxLength: 10})
const sizeType = new NumberType('nt1', {max: 20})
const recordType = new RecordType('rt1', {}, [
    new Rule('r1', ($item: any) => {
            return $item.Description.length < $item.Size
        }, {description: 'Description shorter than Size'},
    )
], [
    descriptionType, sizeType
])

class TestFormState extends BaseFormState {
    protected readonly fieldNames = ['Description', 'Size']
}

function TestForm(props: {path: string, keyAction: KeyboardEventHandler}) {
    const pathWith = (name: string) => props.path + '.' + name

    const $form = useGetObjectState<BaseFormState>(props.path)
    const {Description, Size} = useObjectStates( {
        // @ts-ignore
        Description: new TextInput.State({value: $form.originalValue?.Description, dataType: descriptionType}),
        // @ts-ignore
        Size: new NumberInput.State({value: $form.originalValue?.Size, dataType: sizeType}),
    }, props.path)
    $form._updateValue()

    return React.createElement(Form, props,
        React.createElement(TextInput, {path: pathWith('Description'), label: 'Description', width: '100%'}),
        React.createElement(NumberInput, {path: pathWith('Size'), label: 'Size'}),
        // @ts-ignore
        React.createElement(TextElement, {path: pathWith('Feedback'), }, 'Size is ' + $form.value.Size)
    )
}

class TestOneElementFormState extends BaseFormState {
    protected readonly fieldNames = ['Description']
}

function TestOneElementForm(props: {path: string}) {
    const pathWith = (name: string) => props.path + '.' + name

    const $form = useGetObjectState<BaseFormState>(props.path)
    // @ts-ignore
    const Description = useObjectState(pathWith('Description'), new TextInput.State({value: $form.originalValue?.Description, dataType: descriptionType}))
    $form._updateValue()

    return React.createElement(Form, {path: props.path},
        React.createElement(TextInput, {path: pathWith('Description'), label: 'Description', width: '100%'})
    )
}

class TestNestedFormState extends BaseFormState {
    protected readonly fieldNames = ['Description', 'Size', 'Extra']
}

function TestNestedForm(props: {path: string, keyAction: KeyboardEventHandler}) {
    const pathWith = (name: string) => props.path + '.' + name

    const $form = useGetObjectState<BaseFormState>(props.path)
    // @ts-ignore
    const Description = useObjectState(pathWith('Description'), new TextInput.State({value: $form.originalValue?.Description, dataType: descriptionType}))
    // @ts-ignore
    const Size = useObjectState(pathWith('Size'), new NumberInput.State({value: $form.originalValue?.Size, dataType: sizeType}))
    // @ts-ignore
    const Extra = useObjectState(pathWith('Extra'), new TestOneElementFormState({value: $form.originalValue?.Extra}))
    $form._updateValue()

    return React.createElement(Form, props,
        React.createElement(TextInput, {path: pathWith('Description'), label: 'Description', width: '100%'}),
        React.createElement(NumberInput, {path: pathWith('Size'), label: 'Size'}),
        React.createElement(TestOneElementForm, {path: pathWith('Extra')}),
        // @ts-ignore
        React.createElement(TextElement, {path: pathWith('Feedback'), }, 'Size is ' + $form.value.Size)
    )
}

class TestEmptyFormState extends BaseFormState {
    protected readonly fieldNames = []
}

function TestEmptyForm(props: {path: string}) {
    const pathWith = (name: string) => props.path + '.' + name

    const formState = useGetObjectState<BaseFormState>(props.path)

    return React.createElement(Form, {path: props.path})
}

const [form, appStoreHook] = wrappedTestElement(TestForm, TestFormState)
const [emptyForm] = wrappedTestElement(TestEmptyForm, TestEmptyFormState)
const [oneElementForm] = wrappedTestElement(TestOneElementForm, TestOneElementFormState)
const [nestedForm, appStoreHook2] = wrappedTestElement(TestNestedForm, TestNestedFormState)

const stateAt = (path: string) => appStoreHook.stateAt(path)
const stateAt2 = (path: string) => appStoreHook2.stateAt(path)

test('Form element produces output containing children', () => {
    const component = form('app.page1.form1', {
        value: {
            Description: 'Big',
            Size: 17
        }
    }, {label: 'Test Form 1'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output with no children', () => {
    const component = emptyForm('app.page1.formEmpty', {
        value: {}
    }, {label: 'Test Form Empty'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output with one child', () => {
    const component = oneElementForm('app.page1.formSingle', {
        value: {}
    }, {label: 'Test Form One Element'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output containing nested form', () => {
    const component = nestedForm('app.page1.formNested', {
        value: {
            Description: 'Big',
            Size: 17,
            Extra: {
                Description: 'Extra Big'
            }
        }
    }, {label: 'Test Form 1'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('State class has correct properties and functions', () => {
    const submitAction = jest.fn()
    const state = new TestFormState({value: {Description: 'Big', Size: 17}, submitAction })
    const appInterface = testAppInterface(null, {})
    state.init(appInterface, 'formPath')
    expect(state.value).toStrictEqual({Description: 'Big', Size: 17})
    expect(state.defaultValue).toStrictEqual({})

    state.Reset()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({value: undefined, errorsShown: false}))
})

test('State class compares values as objects', () => {
    const state1 = new TestFormState({value: {Description: 'Big', Size: 17}})
    const state2 = new TestFormState({value: {Description: 'Big', Size: 17}})
    const state3 = new TestFormState({value: {Description: 'Small', Size: 17}})

    expect(state1.updateFrom(state2)).toBe(state1)
    expect(state1.updateFrom(state3)).toStrictEqual(state3)
})

test('State class compares data types as objects', () => {
    const state1 = new TestFormState({dataType: new RecordType('rt1', {description: 'Desc 1'}, [], [])})
    const state2 = new TestFormState({dataType: new RecordType('rt1', {description: 'Desc 1'}, [], [])})
    const state3 = new TestFormState({dataType: new RecordType('rt1', {description: 'Desc 2'}, [], [])})

    expect(state1.updateFrom(state2)).toBe(state1)
    expect(state1.updateFrom(state3)).toStrictEqual(state3)
})

test('State class uses states of child objects where present', () => {
    const state = new TestFormState({value: {Description: 'Big', Size: 17}})
    const appInterface = testAppInterface(null, {Description: 'Extra Large'})
    state.init(appInterface, 'formPath')
    state._updateValue()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({value: {Description: 'Extra Large', Size: 17}}))
})

test('State has expected values', async () => {
    const component = form('form1', {
        value: {
            Description: 'Big',
            Size: 17
        }
    }, {label: 'Test Form 1'})
    renderer.create(component)
    await actWait()
    expect(stateAt('app').value).toStrictEqual({Description: 'Big', Size: 17})
    expect(stateAt('app.Description').value).toBe('Big')
    expect(stateAt('app.Size').value).toBe(17)
})

test('State has expected values after update', async () => {
    const {domContainer, enter}  = testContainer(form('app.page1.form1', {
        value: {Description: 'Big', Size: 17}
    }))
    await wait()
    expect(stateAt('app.page1.form1').updates).toStrictEqual({})

    await enter('Size', '33')
    await wait()
    expect(stateAt('app.page1.form1').value).toStrictEqual({Description: 'Big', Size: 33})
    expect(stateAt('app.page1.form1.Size').value).toBe(33)
    expect(domContainer.querySelector('[id="app.page1.form1.Feedback"]')?.textContent).toBe('Size is 33')
    expect(stateAt('app.page1.form1').updates).toStrictEqual({Size: 33})

    await enter('Description', 'Medium')
    await wait()
    expect(stateAt('app.page1.form1').updates).toStrictEqual({'Description': 'Medium', Size: 33})
})

test('State of nested form has expected values', async () => {
    const {domContainer, enter}  = testContainer(nestedForm('app.page1.nestedForm1', {
        value: {Description: 'Big', Size: 17, Extra: {Description: 'Extra Big'}}
    }))
    await wait(50)
    expect(stateAt2('app.page1.nestedForm1').updates).toStrictEqual({})
    expect(stateAt2('app.page1.nestedForm1').value).toStrictEqual({Description: 'Big', Size: 17, Extra: {Description: 'Extra Big'}})
    expect(stateAt2('app.page1.nestedForm1.Extra.Description').value).toBe('Extra Big')
    expect(stateAt2('app.page1.nestedForm1.Extra').value).toStrictEqual({Description: 'Extra Big'})

    await enter('Extra.Description', 'Really Big')
    await wait()
    expect(stateAt2('app.page1.nestedForm1').value).toStrictEqual({Description: 'Big', Size: 17, Extra: {Description: 'Really Big'}})
    expect(stateAt2('app.page1.nestedForm1.Extra.Description').value).toBe('Really Big')
    expect(stateAt2('app.page1.nestedForm1.Extra').value).toStrictEqual({Description: 'Really Big'})
    expect(stateAt2('app.page1.nestedForm1').updates).toStrictEqual({Extra: {Description: 'Really Big'}})
})

test('keyAction function is called with key', async () => {
    const keyAction = jest.fn()
    const {keyDown} = testContainer(form('app.page1.form1', {
        value: {Description: 'Big', Size: 17}
    }, {keyAction}))
    await wait()
    await keyDown('app.page1.form1', 'Enter')
    expect(keyAction).toHaveBeenCalled()
    expect((keyAction as MockedFunction<any>).mock.calls[0][0].key).toBe('Enter')
})

test('State Resets all its component states and modified', async () => {
    const {enter}  = testContainer(form('app.page2.form1', {
        value: {Description: 'Big', Size: 17}
    }), 'testContainer2')
    await wait()
    expect(stateAt('app.page2.form1').modified).toBe(false)

    await enter('app.page2.form1.Description', 'Medium')
    expect(stateAt('app.page2.form1').modified).toBe(true)
    expect(stateAt('app.page2.form1.Description').modified).toBe(true)
    expect(stateAt('app.page2.form1.Size').modified).toBe(false)
    await enter('app.page2.form1.Size', '33')
    stateAt('app.page2.form1').Reset()
    await wait()

    expect(stateAt('app.page2.form1').value).toStrictEqual({Description: 'Big', Size: 17})
    expect(stateAt('app.page2.form1.Description').value).toBe('Big')
    expect(stateAt('app.page2.form1.Size').value).toBe(17)

    expect(stateAt('app.page2.form1').modified).toBe(false)
    expect(stateAt('app.page2.form1.Description').modified).toBe(false)
    expect(stateAt('app.page2.form1.Size').modified).toBe(false)
})

test('State has correct errors and valid from component states', async () => {
    const {enter}  = testContainer(form('app.page3.form1', {
        value: {Description: 'Big', Size: 17}
    }), 'testContainer3')
    await wait(10)
    expect(stateAt('app.page3.form1').valid).toBe(true)
    expect(stateAt('app.page3.form1').errors).toBe(null)

    await enter('app.page3.form1.Description', 'A Long Description')
    expect(stateAt('app.page3.form1').valid).toBe(false)
    expect(stateAt('app.page3.form1').errors).toStrictEqual({
        Description: ['Maximum length 10']
    })
    expect(stateAt('app.page3.form1.Description').errors).toStrictEqual(['Maximum length 10'])

    await enter('app.page3.form1.Size', '21')
    expect(stateAt('app.page3.form1').errors).toStrictEqual({
        Description: ['Maximum length 10'],
        Size: ['Maximum 20']
    })

    stateAt('app.page3.form1').Reset()
    await wait()

    expect(stateAt('app.page3.form1').valid).toBe(true)
    expect(stateAt('app.page3.form1.Description').valid).toBe(true)
    expect(stateAt('app.page3.form1.Size').valid).toBe(true)
})

test('State has own errors', async () => {
    const {enter}  = testContainer(form('app.page5.form1', {
        value: {Description: 'Big', Size: 5}, dataType: recordType
    }), 'testContainer4')
    await wait()
    expect(stateAt('app.page5.form1').valid).toBe(true)
    expect(stateAt('app.page5.form1').errors).toBe(null)

    await enter('app.page5.form1.Description', 'Medium')
    await enter('app.page5.form1.Size', '5')
    await wait()

    expect(stateAt('app.page5.form1').errors).toStrictEqual({
        _self: ['Description shorter than Size']
    })
    expect(stateAt('app.page5.form1').valid).toBe(false)


    await enter('app.page5.form1.Size', '21')
    await enter('app.page5.form1.Description', 'Description more than 21 chars')
    await wait()
    expect(stateAt('app.page5.form1').errors).toStrictEqual({
        _self: ['Description shorter than Size'],
        Description: ['Maximum length 10'],
        Size: ['Maximum 20']
    })
})

test('State calls ShowErrors on all its component states', async () => {
    testContainer(form('app.page4.form1', {
        value: {Description: 'Big', Size: 17}
    }))
    await wait()

    expect(stateAt('app.page4.form1').errorsShown).toBe(false)
    expect(stateAt('app.page4.form1.Description').errorsShown).toBe(false)
    stateAt('app.page4.form1').ShowErrors(true)
    await wait()
    expect(stateAt('app.page4.form1').errorsShown).toBe(true)
    expect(stateAt('app.page4.form1.Description').errorsShown).toBe(true)

    stateAt('app.page4.form1').Reset()
    await wait()
    expect(stateAt('app.page4.form1').errorsShown).toBe(false)
    expect(stateAt('app.page4.form1.Description').errorsShown).toBe(false)
})

test('State Submit calls submit action if present', () => {
    const submitAction = jest.fn()
    const state = new TestFormState({value: {Description: 'Big', Size: 17}, submitAction })
    const stateNoAction = new TestFormState({value: {Description: 'Big', Size: 17} })
    const appInterface = testAppInterface(null, {})
    state.init(appInterface, 'formPath')

    const data = {a: 10}
    stateNoAction.Submit(data)
    expect(submitAction).not.toHaveBeenCalled()

    state.Submit(data)
    expect(submitAction).toHaveBeenCalledWith(state, data)
})

