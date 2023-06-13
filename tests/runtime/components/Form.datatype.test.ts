/**
 * @jest-environment jsdom
 */

import {componentJSON, testAppInterface, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {BaseFormState, Form, NumberInput, TextElement, TextInput} from '../../../src/runtime/components'
import renderer from 'react-test-renderer'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {
    ChoiceType,
    DateType,
    ListType,
    NumberType,
    RecordType,
    Rule,
    TextType,
    TrueFalseType
} from '../../../src/shared/types'
import {DataTypeFormState} from '../../../src/runtime/components/FormState'
import MockedFunction = jest.MockedFunction
import React, {KeyboardEventHandler} from 'react'
import {withDots} from '../../../src/util/helpers'
import {useGetObjectState} from '../../../src/runtime'
import {useObjectStates} from '../../../src/runtime/appData'

const descriptionType = new TextType('Description', {maxLength: 10})
const sizeType = new NumberType('Size', {max: 20})
const recordType = new RecordType('rt1', {}, [
    new Rule('r1', ($item: any) => {
            return $item.Description.length < $item.Size
        }, {description: 'Description shorter than Size'},
    )
], [
    descriptionType, sizeType
])

const recordType2 = new RecordType('rt222', {description: 'The record type with them all'}, [], [
    new DateType('Start Date', {min: new Date('2010-06-05'), max: new Date('2020-03-04')}),
    new ChoiceType('Region', {values: ['North', 'Central', 'South']}),
    new TrueFalseType('Internal', {description: 'Internal sign up'}),
    // new ListType('Things', {}, [], recordType),
])

const singleElementType = new RecordType('rt2', {}, [], [
    descriptionType
])

const emptyType = new RecordType('rt3', {}, [], [])

const extraType = new RecordType('Extra', {}, [], [
    descriptionType
])

const nestedType = new RecordType('rt4', {}, [
    new Rule('r1', ($item: any) => {
            return $item.Description.length < $item.Size
        }, {description: 'Description shorter than Size'},
    )
], [
    descriptionType, sizeType, extraType
])

function TestForm(props: {path: string, keyAction: KeyboardEventHandler}) {
    const pathWith = (name: string) => props.path + '.' + name

    const $form = useGetObjectState<BaseFormState>(props.path)
    const {Description, Size, Count} = useObjectStates( {
        // @ts-ignore
        Count: new NumberInput.State({value: $form.originalValue?.Count, dataType: sizeType}),
    }, props.path)
    $form._updateValue()

    return React.createElement(Form, props,
        React.createElement(TextInput, {path: pathWith('Description'), label: 'Description of the thing', width: '50%'}),
        React.createElement(NumberInput, {path: pathWith('Count'), label: 'Count'}),
        // @ts-ignore
        React.createElement(TextElement, {path: pathWith('Feedback'), }, 'Size is ' + $form.value.Size)
    )
}


const [form, appStoreHook] = wrappedTestElement(Form, DataTypeFormState)
const [testForm] = wrappedTestElement(TestForm, DataTypeFormState)
const stateAt = (path: string) => appStoreHook.stateAt(path)

test('Form element produces output containing children', () => {
    const component = form('app.page1.form1', {
        dataType: recordType,
        value: {
            Description: 'Big',
            Size: 17
        }
    }, {label: 'Test Form 1'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output with all types of children and description', () => {
    const component = form('app.page1.form1', {
        dataType: recordType2,
        value: {
            StartDate: new Date('2015-02-13'),
            Region: 'Central',
            Internal: true,
            Things: [
                {Description: 'Big', Size: 17},
                {Description: 'Small', Size: 3},
            ]
        }
    }, {label: 'Test Form 1'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output from data type with extra and override children', () => {
    const component = testForm('app.page1.form1', {
            dataType: recordType,
            value: {
                Description: 'Big',
                Size: 17
            }
    }, {label: 'Test Form 1'},
    )
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output with no children', () => {
    const component = form('app.page1.formEmpty', {
        dataType: emptyType,
        value: {}
    }, {label: 'Test Form Empty'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output with one child', () => {
    const component = form('app.page1.formSingle', {
        dataType: singleElementType,
        value: {}
    }, {label: 'Test Form One Element'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output containing nested form', () => {
    const component = form('app.page1.formNested', {
        dataType: nestedType,
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
    const state = new DataTypeFormState({dataType: recordType, value: {Description: 'Big', Size: 17}, submitAction })
    const appInterface = testAppInterface(null, {})
    state.init(appInterface, 'formPath')
    expect(state.value).toStrictEqual({Description: 'Big', Size: 17})
    expect(state.defaultValue).toStrictEqual({})

    state.Reset()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({value: undefined, errorsShown: false}))
})

test('State class compares values as objects', () => {
    const state1 = new DataTypeFormState({value: {Description: 'Big', Size: 17}})
    const state2 = new DataTypeFormState({value: {Description: 'Big', Size: 17}})
    const state3 = new DataTypeFormState({value: {Description: 'Small', Size: 17}})

    expect(state1.updateFrom(state2)).toBe(state1)
    expect(state1.updateFrom(state3)).toStrictEqual(state3)
})

test('State class compares data types as objects', () => {
    const state1 = new DataTypeFormState({dataType: new RecordType('rt1', {description: 'Desc 1'}, [], [])})
    const state2 = new DataTypeFormState({dataType: new RecordType('rt1', {description: 'Desc 1'}, [], [])})
    const state3 = new DataTypeFormState({dataType: new RecordType('rt1', {description: 'Desc 2'}, [], [])})

    expect(state1.updateFrom(state2)).toBe(state1)
    expect(state1.updateFrom(state3)).toStrictEqual(state3)
})

test('State class uses states of child objects where present', () => {
    const state = new DataTypeFormState({dataType: recordType, value: {Description: 'Big', Size: 17}})
    const appInterface = testAppInterface(null, {Description: 'Extra Large'})
    state.init(appInterface, 'formPath')
    state._updateValue()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({value: {Description: 'Extra Large', Size: 17}}))
})

test('State has expected values', async () => {
    const component = form('form1', {
        dataType: recordType,
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
        dataType: recordType,
        value: {Description: 'Big', Size: 17}
    }))
    await wait()
    expect(stateAt('app.page1.form1').updates).toStrictEqual({})

    await enter('Size', '33')
    await wait()
    expect(stateAt('app.page1.form1').value).toStrictEqual({Description: 'Big', Size: 33})
    expect(stateAt('app.page1.form1.Size').value).toBe(33)
    expect(stateAt('app.page1.form1').updates).toStrictEqual({Size: 33})

    await enter('Description', 'Medium')
    await wait()
    expect(stateAt('app.page1.form1').updates).toStrictEqual({'Description': 'Medium', Size: 33})
})

test('State of nested form has expected values', async () => {
    const {domContainer, enter}  = testContainer(form('app.page1.nestedForm1', {
        dataType: nestedType,
        value: {Description: 'Big', Size: 17, Extra: {Description: 'Extra Big'}}
    }))
    await wait(50)
    expect(stateAt('app.page1.nestedForm1').updates).toStrictEqual({})
    expect(stateAt('app.page1.nestedForm1').value).toStrictEqual({Description: 'Big', Size: 17, Extra: {Description: 'Extra Big'}})
    expect(stateAt('app.page1.nestedForm1.Extra.Description').value).toBe('Extra Big')
    expect(stateAt('app.page1.nestedForm1.Extra').value).toStrictEqual({Description: 'Extra Big'})

    await enter('Extra.Description', 'Really Big')
    await wait()
    expect(stateAt('app.page1.nestedForm1').value).toStrictEqual({Description: 'Big', Size: 17, Extra: {Description: 'Really Big'}})
    expect(stateAt('app.page1.nestedForm1.Extra.Description').value).toBe('Really Big')
    expect(stateAt('app.page1.nestedForm1.Extra').value).toStrictEqual({Description: 'Really Big'})
    expect(stateAt('app.page1.nestedForm1').updates).toStrictEqual({Extra: {Description: 'Really Big'}})
})

test('keyAction function is called with key', async () => {
    const keyAction = jest.fn()
    const {keyDown} = testContainer(form('app.page1.form1', {
        dataType: recordType,
        value: {Description: 'Big', Size: 17}
    }, {keyAction}))
    await wait()
    await keyDown('app.page1.form1', 'Enter')
    expect(keyAction).toHaveBeenCalled()
    expect((keyAction as MockedFunction<any>).mock.calls[0][0].key).toBe('Enter')
})

test('State Resets all its component states and modified', async () => {
    const {enter}  = testContainer(form('app.page2.form1', {
        dataType: recordType,
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
        dataType: recordType,
        value: {Description: 'Big', Size: 17}
    }), 'testContainer3')
    await wait(10)
    expect(stateAt('app.page3.form1').valid).toBe(true)
    expect(stateAt('app.page3.form1').errors).toBe(null)

    await enter('app.page3.form1.Description', 'Long Description')
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
        dataType: recordType,
        value: {Description: 'Big', Size: 5}
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
        dataType: recordType,
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
    const state = new DataTypeFormState({dataType: recordType, value: {Description: 'Big', Size: 17}, submitAction })
    const stateNoAction = new DataTypeFormState({dataType: recordType, value: {Description: 'Big', Size: 17} })
    const appInterface = testAppInterface(null, {})
    state.init(appInterface, 'formPath')

    const data = {a: 10}
    stateNoAction.Submit(data)
    expect(submitAction).not.toHaveBeenCalled()

    state.Submit(data)
    expect(submitAction).toHaveBeenCalledWith(state, data)
})

