/**
 * @vitest-environment jsdom
 */
import {expect, test, vi} from 'vitest'
import React, {KeyboardEventHandler} from 'react'
import {componentJSON, componentJSONAsync, getCallArg, testAppInterface, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {BaseFormState, Form, NumberInput, TextElement, TextInput} from '../../../src/runtime/components'
import renderer from 'react-test-renderer'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {NumberType, RecordType, Rule, TextType} from '../../../src/runtime/types'
import {ErrorResult} from '../../../src/shared/DataStore'
import {use$state} from '../../../src/runtime/state/appStateHooks'
import AppStateStore from '../../../src/runtime/state/AppStateStore'

const descriptionType = new TextType('Description', {minLength: 2, maxLength: 10})
const sizeType = new NumberType('BoxSize', {min: 1, max: 20})
const recordType = new RecordType('rt1', {}, [
    new Rule('r1', ($item: any) => {
            return $item.Description.length < $item.BoxSize
        }, {description: 'Description must be shorter than Size'},
    )
], [
    descriptionType, sizeType
])

type OneElementFormContents = {
    Description: string
}
type FormContents = OneElementFormContents & { BoxSize: number }
type NestedFormContents = FormContents & {Extra: OneElementFormContents}

class TestFormState extends BaseFormState<FormContents> {
    protected readonly ownFieldNames = ['Description', 'BoxSize']
}

function TestForm(props: {path: string, initialValue: FormContents, dataType: RecordType, keyAction: KeyboardEventHandler} & FormContents) {
    const pathTo = (name: string) => props.path + '.' + name

    const {initialValue, dataType} = props
    const _state = use$state(props.path, TestFormState, {initialValue, dataType})
    const {BoxSize} = _state as any

    return React.createElement(Form, props,
        React.createElement(TextInput, {path: pathTo('Description'), initialValue: _state.originalValue?.Description, dataType: descriptionType, label: 'Description', styles: {width: '100%'}}),
        React.createElement(NumberInput, {path: pathTo('BoxSize'), initialValue: _state.originalValue?.BoxSize, dataType: sizeType, label: 'Size'}),
        // @ts-ignore
        React.createElement(TextElement, {path: pathTo('Feedback'), content: 'Size is ' + BoxSize} )
    )
}

class TestOneElementFormState extends BaseFormState<{Description: string}> {
    protected readonly ownFieldNames = ['Description']
}

function TestOneElementForm(props: {path: string, initialValue: {Description: string}}) {
    const pathTo = (name: string) => props.path + '.' + name

    const {initialValue} = props
    const _state = use$state(props.path, TestOneElementFormState, {initialValue})

    return React.createElement(Form, {path: props.path},
        React.createElement(TextInput, {path: pathTo('Description'), initialValue: _state.originalValue?.Description, dataType: descriptionType, label: 'Description', styles: {width: '100%'}})
    )
}

class TestNestedFormState extends BaseFormState<NestedFormContents> {
    protected readonly ownFieldNames = ['Description', 'BoxSize', 'Extra']
}

function TestNestedForm(props: {path: string, initialValue: NestedFormContents, keyAction: KeyboardEventHandler}) {
    const pathTo = (name: string) => props.path + '.' + name

    const {initialValue} = props
    const _state = use$state(props.path, TestNestedFormState, {initialValue})
    const {BoxSize} = _state as any

    return React.createElement(Form, props,
        React.createElement(TextInput, {path: pathTo('Description'), initialValue: _state.originalValue?.Description, dataType: descriptionType, label: 'Description', styles: {width: '100%'}}),
        React.createElement(NumberInput, {path: pathTo('BoxSize'), initialValue: _state.originalValue?.BoxSize, dataType: sizeType, label: 'Size'}),
        React.createElement(TestOneElementForm, {path: pathTo('Extra'), initialValue: _state.originalValue?.Extra}),
        // @ts-ignore
        React.createElement(TextElement, {path: pathTo('Feedback'), content: 'Size is ' + BoxSize} )
    )
}

class TestEmptyFormState extends BaseFormState {
    protected readonly ownFieldNames = []
}

function TestEmptyForm(props: {path: string}) {
    const _state = use$state(props.path, TestEmptyFormState, {})
    return React.createElement(Form, {path: props.path})
}

const [form, appStoreHook] = wrappedTestElement(TestForm)
const [emptyForm] = wrappedTestElement(TestEmptyForm)
const [oneElementForm] = wrappedTestElement(TestOneElementForm)
const [nestedForm, appStoreHook2] = wrappedTestElement(TestNestedForm)

const stateAt = (path: string) => appStoreHook.stateAt(path)
const stateAt2 = (path: string) => appStoreHook2.stateAt(path)

test('Form element produces output containing children', async () => {
    const component = form('app.page1.form1', {
        initialValue: {
            Description: 'Big',
            BoxSize: 17
        },
        label: 'Test Form 1'
    })
    // TO DO snapshot is incorrect - label shrink should be true
    const json = await componentJSONAsync(component)
    expect(json).toMatchSnapshot()
})

test('Form element produces output with no children', () => {
    const component = emptyForm('app.page1.formEmpty', {
        initialValue: {},
        label: 'Test Form Empty'
    })
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output with one child', () => {
    const component = oneElementForm('app.page1.formSingle', {
        initialValue: {},
        label: 'Test Form One Element'
    })
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Form element produces output containing nested form', async () => {
    const component = nestedForm('app.page1.formNested', {
        initialValue: {
            Description: 'Big',
            BoxSize: 17,
            Extra: {
                Description: 'Extra Big'
            }
        },
        label: 'Test Form 1'
    })
    // TO DO snapshot is incorrect - label shrink should be true
    expect(await componentJSONAsync(component)).toMatchSnapshot()
})

test('State class has correct properties and functions on new instance', () => {
    const submitAction = vi.fn()
    const store = new AppStateStore()
    const state = store.getOrCreate('id1', TestFormState, {initialValue: {Description: 'Big', BoxSize: 17}, submitAction })
    expect(state.value).toStrictEqual({Description: 'Big', BoxSize: 17})
    expect(state.defaultValue).toStrictEqual({})

    state.Reset()
    state.ShowErrors(true)
})

test('State class has empty object original value if props value is null', () => {
    const state = new TestFormState({initialValue: null })
    expect(state.originalValue).toStrictEqual({})
    expect(state.value).toStrictEqual({BoxSize: null, Description: null})
    expect(state.defaultValue).toStrictEqual({})
})

test.skip('State class uses states of child objects where present', () => {
    const state = new TestFormState({initialValue: {Description: 'Big', BoxSize: 17}})
    const appInterface = testAppInterface('formPath', state, {Description: 'Extra Large'});
    (state as any)._updateValue()
    expect(appInterface.update).toHaveBeenCalledWith(state.withMergedState({value: {Description: 'Extra Large', BoxSize: 17}}))
})

test('State has expected values', async () => {
    const component = form('form1', {
        initialValue: {
            Description: 'Big',
            BoxSize: 17
        }
    }, {label: 'Test Form 1'})
    renderer.create(component)
    await actWait()
    expect(stateAt('form1').value).toStrictEqual({Description: 'Big', BoxSize: 17})
    expect(stateAt('form1.Description').value).toBe('Big')
    expect(stateAt('form1.BoxSize').value).toBe(17)
})

test('State has null values where fields are empty or missing', async () => {
    const component = form('form1', {
        initialValue: {
            Description: null,
            //no BoxSize
        }
    }, {label: 'Test Form 1'})
    renderer.create(component)
    await actWait()
    expect(stateAt('form1').value).toStrictEqual({Description: null, BoxSize: null})
    expect(stateAt('form1.Description').dataValue).toBe(null)
    expect(stateAt('form1.BoxSize').dataValue).toBe(null)
    expect(stateAt('form1.Description').value).toBe('')
    expect(stateAt('form1.BoxSize').value).toBe(0)
})

test('State has expected values after update', async () => {
    const {domContainer, enter}  = testContainer(form('app.page1.form1', {
        initialValue: {Description: 'Big', BoxSize: 17}
    }))
    await actWait()
    expect(stateAt('app.page1.form1').value).toStrictEqual({Description: 'Big', BoxSize: 17})
    expect(stateAt('app.page1.form1').updates).toStrictEqual({})

    await enter('BoxSize', '33')
    await actWait()
    expect(stateAt('app.page1.form1').value).toStrictEqual({Description: 'Big', BoxSize: 33})
    expect(stateAt('app.page1.form1.BoxSize').value).toBe(33)
    expect(domContainer.querySelector('[id="app.page1.form1.Feedback"]')?.textContent).toBe('Size is 33')
    expect(stateAt('app.page1.form1').updates).toStrictEqual({BoxSize: 33})

    await enter('Description', 'Medium')
    await wait()
    expect(stateAt('app.page1.form1').updates).toStrictEqual({'Description': 'Medium', BoxSize: 33})
})

test('State of nested form has expected values', async () => {
    const {domContainer, enter}  = testContainer(nestedForm('app.page1.nestedForm1', {
        initialValue: {Description: 'Big', BoxSize: 17, Extra: {Description: 'Extra Big'}}
    }))
    await wait(50)
    expect(stateAt2('app.page1.nestedForm1').updates).toStrictEqual({})
    expect(stateAt2('app.page1.nestedForm1').value).toStrictEqual({Description: 'Big', BoxSize: 17, Extra: {Description: 'Extra Big'}})
    expect(stateAt2('app.page1.nestedForm1.Extra.Description').value).toBe('Extra Big')
    expect(stateAt2('app.page1.nestedForm1.Extra').value).toStrictEqual({Description: 'Extra Big'})

    await enter('Extra.Description', 'Really Big')
    await wait()
    expect(stateAt2('app.page1.nestedForm1').value).toStrictEqual({Description: 'Big', BoxSize: 17, Extra: {Description: 'Really Big'}})
    expect(stateAt2('app.page1.nestedForm1.Extra.Description').value).toBe('Really Big')
    expect(stateAt2('app.page1.nestedForm1.Extra').value).toStrictEqual({Description: 'Really Big'})
    expect(stateAt2('app.page1.nestedForm1').updates).toStrictEqual({Extra: {Description: 'Really Big'}})
})

test('keyAction function is called with key', async () => {
    const keyAction = vi.fn()
    const {keyDown} = testContainer(form('app.page1.form1', {
        initialValue: {Description: 'Big', BoxSize: 17}, keyAction}))
    await wait()
    await keyDown('app.page1.form1', 'Enter')
    expect(keyAction).toHaveBeenCalled()
    expect(getCallArg(keyAction, 0).key).toBe('Enter')
})

test('State Resets all its component states and modified', async () => {
    const {enter}  = testContainer(form('app.page2.form1', {
        initialValue: {Description: 'Big', BoxSize: 17}
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

    expect(stateAt('app.page2.form1').value).toStrictEqual({Description: 'Big', BoxSize: 17})
    expect(stateAt('app.page2.form1.Description').value).toBe('Big')
    expect(stateAt('app.page2.form1.BoxSize').value).toBe(17)

    expect(stateAt('app.page2.form1').modified).toBe(false)
    expect(stateAt('app.page2.form1.Description').modified).toBe(false)
    expect(stateAt('app.page2.form1.BoxSize').modified).toBe(false)
})

test('State has correct errors and valid from component states', async () => {
    const {enter}  = testContainer(form('app.page3.form1', {
        initialValue: {Description: 'Big', BoxSize: 17}
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

test('State has correct errors and valid from empty component states', async () => {
    const {enter}  = testContainer(form('app.page3.form1', {
        initialValue: {Description: null, }
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

    await enter('app.page3.form1.BoxSize', '0')
    expect(stateAt('app.page3.form1').errors).toStrictEqual({
        Description: ['Maximum length 10'],
        BoxSize: ['Minimum 1']
    })

    stateAt('app.page3.form1').Reset()
    await wait()

    expect(stateAt('app.page3.form1').valid).toBe(true)
    expect(stateAt('app.page3.form1.Description').valid).toBe(true)
    expect(stateAt('app.page3.form1.BoxSize').valid).toBe(true)
})

test('State has own errors', async () => {
    const {enter}  = testContainer(form('app.page5.form1', {
        initialValue: {Description: 'Big', BoxSize: 5}, dataType: recordType
    }), 'testContainer4')
    await wait()
    expect(stateAt('app.page5.form1').valid).toBe(true)
    expect(stateAt('app.page5.form1').errors).toBe(null)

    await enter('app.page5.form1.Description', 'Medium')
    await enter('app.page5.form1.BoxSize', '5')
    await wait()

    expect(stateAt('app.page5.form1').value).toStrictEqual({Description: 'Medium', BoxSize: 5})
    expect(stateAt('app.page5.form1').errors).toStrictEqual({
        _self: ['Description must be shorter than Size']
    })
    expect(stateAt('app.page5.form1').valid).toBe(false)


    await enter('app.page5.form1.BoxSize', '21')
    await enter('app.page5.form1.Description', 'Description more than 21 chars')
    await wait()
    expect(stateAt('app.page5.form1').errors).toStrictEqual({
        _self: ['Description must be shorter than Size'],
        Description: ['Maximum length 10'],
        BoxSize: ['Maximum 20']
    })
})

test('State calls ShowErrors on all its component states', async () => {
    testContainer(form('app.page4.form1', {
        initialValue: {Description: 'Big', BoxSize: 17}
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

test('State Submit calls submit action if present and calls Reset after if succeeds', async () => {
    const submitAction = vi.fn()
    const state = new TestFormState({initialValue: {Description: 'Big', BoxSize: 17}, submitAction })
    const stateNoAction = new TestFormState({initialValue: {Description: 'Big', BoxSize: 17} })
    state.Reset = vi.fn()
    stateNoAction.Reset = vi.fn()
    const appInterface = testAppInterface('formPath', state, {})

    const data = {a: 10}
    await stateNoAction.Submit(data)
    expect(submitAction).not.toHaveBeenCalled()
    expect(stateNoAction.Reset).toHaveBeenCalled()

    const submitResult = state.Submit(data)
    expect(submitResult).toBeInstanceOf(Promise)
    await submitResult
    expect(submitAction).toHaveBeenCalledWith(state, data)
    expect(state.Reset).toHaveBeenCalled()
})

test('State Submit calls submit action and adds Error Result to errors and does not call Reset', async () => {
    const submitAction = vi.fn().mockResolvedValue(new ErrorResult('Submit Function', 'This has all gone wrong'))
    const state = new TestFormState({initialValue: {Description: 'Big', BoxSize: 17}, submitAction })
    state.Reset = vi.fn()
    const appInterface = testAppInterface('formPath', state)

    await state.Submit(null)
    expect(state.Reset).not.toHaveBeenCalled()
    expect(state.latest().errors?._self).toStrictEqual(['This has all gone wrong'])
})
