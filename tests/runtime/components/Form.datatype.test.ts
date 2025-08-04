/**
 * @vitest-environment jsdom
 */

import {expect, MockedFunction, test, vi} from "vitest"
import {componentJSON, getCallArg, testAppInterface, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {Form, NumberInput, TextElement, TextInput} from '../../../src/runtime/components'
import renderer from 'react-test-renderer'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {ChoiceType, DateType, NumberType, RecordType, Rule, TextType, TrueFalseType} from '../../../src/runtime/types'
import {DataTypeFormState} from '../../../src/runtime/components/FormState'
import React, {KeyboardEventHandler} from 'react'
import {useObject} from '../../../src/runtime'
import BigNumber from 'bignumber.js'
import DecimalType from '../../../src/runtime/types/DecimalType'
import {render} from '@testing-library/react'

const descriptionType = new TextType('Description', {maxLength: 10})
const sizeType = new NumberType('Box Size', {max: 20})
const recordType = new RecordType('rt1', {}, [
    new Rule('r1', ($item: any) => {
            return $item.Description.length < $item.BoxSize
        }, {description: 'Description shorter than Size'},
    )
], [
    descriptionType, sizeType
])

const recordType2 = new RecordType('rt222', {description: 'The record type with them all'}, [], [
    new DateType('Start Date', {min: new Date('2010-06-05'), max: new Date('2020-03-04')}),
    new DecimalType('Income', {min: 0, max: 100000, decimalPlaces: 2}),
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
            return $item.Description.length < $item.BoxSize
        }, {description: 'Description shorter than Size'},
    )
], [
    descriptionType, sizeType, extraType
])

class TestFormState extends DataTypeFormState {
    protected readonly ownFieldNames = ['Count']
    childNames = ['Description', 'BoxSize', 'Count']

    createChildStates() {
        const Count = this.getOrCreateChildState('Count', new NumberInput.State({value: (this.originalValue as any)?.Count, dataType: sizeType}))
        return {Count}
    }

    get BoxSize() { return this.childStates.BoxSize }
    get Count() { return this.childStates.Count }
}

function TestForm(props: {path: string, keyAction: KeyboardEventHandler}) {
    const pathWith = (name: string) => props.path + '.' + name

    const _state: TestFormState = useObject(props.path)
    const {BoxSize} = _state

    return React.createElement(Form, props,
        React.createElement(TextInput, {path: pathWith('Description'), label: 'Description of the thing', styles: {width: '50%'}}),
        React.createElement(NumberInput, {path: pathWith('Count'), label: 'Count'}),
        // @ts-ignore
        React.createElement(TextElement, {path: pathWith('Feedback'), content: 'BoxSize is ' + BoxSize } )
    )
}

const [form, appStoreHook] = wrappedTestElement(Form, TestFormState)
const [testForm] = wrappedTestElement(TestForm, TestFormState)
const stateAt = (path: string) => appStoreHook.stateAt(path)

test('Form element produces output containing children', () => {
    const component = form('app.page1.form1', {
        dataType: recordType,
        value: {
            Description: 'Big',
            BoxSize: 17
        }
    }, {label: 'Test Form 1'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output with all types of children and description', () => {
    const component = form('app.page1.form1', {
        dataType: recordType2,
        value: {
            StartDate: new Date('2015-02-13'),
            Income: new BigNumber('223344.55'),
            Region: 'Central',
            Internal: true,
            Things: [
                {Description: 'Big', BoxSize: 17},
                {Description: 'Small', BoxSize: 3},
            ]
        }
    }, {label: 'Test Form 1'})
    const {container} = render(component)
    expect(container.innerHTML).toMatchSnapshot()
})

test('Form element produces output from data type with extra and override children', () => {
    const component = testForm('app.page1.form1', {
            dataType: recordType,
            value: {
                Description: 'Big',
                BoxSize: 17
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
            BoxSize: 17,
            Extra: {
                Description: 'Extra Big'
            }
        }
    }, {label: 'Test Form 1'})
    expect(componentJSON(component)).toMatchSnapshot()
})

test('State class has correct properties and functions', () => {
    const submitAction = vi.fn()
    const state = new DataTypeFormState({dataType: recordType, value: {Description: 'Big', BoxSize: 17}, submitAction })
    const appInterface = testAppInterface('formPath', state)
    expect(state.value).toStrictEqual({Description: 'Big', BoxSize: 17})
    expect(state.defaultValue).toStrictEqual({})

    state.Reset()
    expect(appInterface.updateVersion).toHaveBeenCalledWith({value: undefined, errorsShown: false})
})

test('State class compares values as objects', () => {
    const state1 = new DataTypeFormState({value: {Description: 'Big', BoxSize: 17}})
    const state2 = new DataTypeFormState({value: {Description: 'Big', BoxSize: 17}})
    const state3 = new DataTypeFormState({value: {Description: 'Small', BoxSize: 17}})

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

test.skip('State class uses states of child objects where present', () => {
    const state = new DataTypeFormState({dataType: recordType, value: {Description: 'Big', BoxSize: 17}})
    const appInterface = testAppInterface('formPath', state, {Description: 'Extra Large'})
    expect(appInterface.updateVersion).toHaveBeenCalledWith({value: {Description: 'Extra Large', BoxSize: 17}})
})

test('State has expected values', async () => {
    const component = form('form1', {
        dataType: recordType,
        value: {
            Description: 'Big',
            BoxSize: 17
        }
    }, {label: 'Test Form 1'})
    renderer.create(component)
    await actWait()
    expect(stateAt('form1').value).toStrictEqual({Description: 'Big', BoxSize: 17, Count: null})
    expect(stateAt('form1.Description').value).toBe('Big')
    expect(stateAt('form1.BoxSize').value).toBe(17)
})

test('State has expected values after update', async () => {
    const {domContainer, enter}  = testContainer(form('app.page1.form1', {
        dataType: recordType,
        value: {Description: 'Big', BoxSize: 17}
    }))
    await wait()
    expect(stateAt('app.page1.form1').updates).toStrictEqual({})

    await enter('BoxSize', '33')
    await wait()
    expect(stateAt('app.page1.form1').value).toStrictEqual({Description: 'Big', BoxSize: 33, Count: null})
    expect(stateAt('app.page1.form1.BoxSize').value).toBe(33)
    expect(stateAt('app.page1.form1').updates).toStrictEqual({BoxSize: 33})

    await enter('Description', 'Medium')
    await wait()
    expect(stateAt('app.page1.form1').updates).toStrictEqual({'Description': 'Medium', BoxSize: 33})
})

test('State of nested form has expected values', async () => {
    const {domContainer, enter}  = testContainer(form('app.page1.nestedForm1', {
        dataType: nestedType,
        value: {Description: 'Big', BoxSize: 17, Extra: {Description: 'Extra Big'}}
    }))
    await wait(50)
    expect(stateAt('app.page1.nestedForm1').updates).toStrictEqual({})
    expect(stateAt('app.page1.nestedForm1').value).toStrictEqual({Description: 'Big', BoxSize: 17, Count: null, Extra: {Description: 'Extra Big'}})
    expect(stateAt('app.page1.nestedForm1.Extra.Description').value).toBe('Extra Big')
    expect(stateAt('app.page1.nestedForm1.Extra').value).toStrictEqual({Description: 'Extra Big'})

    await enter('Extra.Description', 'Really Big')
    await wait(20)
    expect(stateAt('app.page1.nestedForm1').value).toStrictEqual({Description: 'Big', BoxSize: 17, Count: null, Extra: {Description: 'Really Big'}})
    expect(stateAt('app.page1.nestedForm1.Extra.Description').value).toBe('Really Big')
    expect(stateAt('app.page1.nestedForm1.Extra').value).toStrictEqual({Description: 'Really Big'})
    expect(stateAt('app.page1.nestedForm1').updates).toStrictEqual({Extra: {Description: 'Really Big'}})
})

test('keyAction function is called with key', async () => {
    const keyAction = vi.fn()
    const {keyDown} = testContainer(form('app.page1.form1', {
        dataType: recordType,
        value: {Description: 'Big', BoxSize: 17}
    }, {keyAction}))
    await wait()
    await keyDown('app.page1.form1', 'Enter')
    expect(keyAction).toHaveBeenCalled()
    expect(getCallArg(keyAction, 0).key).toBe('Enter')
})

test('State Resets all its component states and modified', async () => {
    const {enter}  = testContainer(form('app.page2.form1', {
        dataType: recordType,
        value: {Description: 'Big', BoxSize: 17}
    }), 'testContainer2')
    await wait()
    expect(stateAt('app.page2.form1').modified).toBe(false)

    await enter('app.page2.form1.Description', 'Medium')
    expect(stateAt('app.page2.form1').modified).toBe(true)
    expect(stateAt('app.page2.form1.Description').modified).toBe(true)
    expect(stateAt('app.page2.form1.BoxSize').modified).toBe(false)
    await enter('app.page2.form1.BoxSize', '33')
    stateAt('app.page2.form1').Reset()
    await wait()

    expect(stateAt('app.page2.form1').value).toStrictEqual({Description: 'Big', BoxSize: 17, Count: null})
    expect(stateAt('app.page2.form1.Description').value).toBe('Big')
    expect(stateAt('app.page2.form1.BoxSize').value).toBe(17)

    expect(stateAt('app.page2.form1').modified).toBe(false)
    expect(stateAt('app.page2.form1.Description').modified).toBe(false)
    expect(stateAt('app.page2.form1.BoxSize').modified).toBe(false)
})

test('State has correct errors and valid from component states', async () => {
    const {enter}  = testContainer(form('app.page3.form1', {
        dataType: recordType,
        value: {Description: 'Big', BoxSize: 17}
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

    await enter('app.page3.form1.BoxSize', '21')
    expect(stateAt('app.page3.form1').errors).toStrictEqual({
        Description: ['Maximum length 10'],
        BoxSize: ['Maximum 20']
    })

    stateAt('app.page3.form1').Reset()
    await wait()

    expect(stateAt('app.page3.form1').valid).toBe(true)
    expect(stateAt('app.page3.form1.Description').valid).toBe(true)
    expect(stateAt('app.page3.form1.BoxSize').valid).toBe(true)
})

test('State has own errors', async () => {
    const {enter}  = testContainer(form('app.page5.form1', {
        dataType: recordType,
        value: {Description: 'Big', BoxSize: 5}
    }), 'testContainer4')
    await wait()
    expect(stateAt('app.page5.form1').valid).toBe(true)
    expect(stateAt('app.page5.form1').errors).toBe(null)

    await enter('app.page5.form1.Description', 'Medium')
    await enter('app.page5.form1.BoxSize', '5')
    await wait()

    expect(stateAt('app.page5.form1').errors).toStrictEqual({
        _self: ['Description shorter than Size']
    })
    expect(stateAt('app.page5.form1').valid).toBe(false)


    await enter('app.page5.form1.BoxSize', '21')
    await enter('app.page5.form1.Description', 'Description more than 21 chars')
    await wait()
    expect(stateAt('app.page5.form1').errors).toStrictEqual({
        _self: ['Description shorter than Size'],
        Description: ['Maximum length 10'],
        BoxSize: ['Maximum 20']
    })
})

test('State calls ShowErrors on all its component states', async () => {
    testContainer(form('app.page4.form1', {
        dataType: recordType,
        value: {Description: 'Big', BoxSize: 17}
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

test('State Submit calls submit action if present', async () => {
    const submitAction = vi.fn()
    const state = new DataTypeFormState({dataType: recordType, value: {Description: 'Big', BoxSize: 17}, submitAction })
    const appInterface = testAppInterface('formPath', state, {})

    const data = {a: 10}
    await state.Submit(data)
    expect(submitAction).toHaveBeenCalledWith(state, data)
})

