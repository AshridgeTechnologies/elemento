/**
 * @jest-environment jsdom
 */

import {Data, DateInput, TextInput} from '../../../src/runtime/components/index'
import {componentJSON, snapshot, testAppInterface, valueObj, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {act, render} from '@testing-library/react'
import '@testing-library/jest-dom'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {TextInputState} from '../../../src/runtime/components/TextInput'
import {TrueFalseInputState} from '../../../src/runtime/components/TrueFalseInput'
import {TextType} from '../../../src/runtime/types'

const [textInput, appStoreHook] = wrappedTestElement(TextInput, TextInputState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('TextInput element produces output with properties supplied', () => {
        const component = textInput('app.page1.width', {value: 'Hi there!'}, {
            maxLength: 11,
            width: 23,
            readOnly: true,
            label: 'Item Description',
            styles: {border: '1px solid green'}
        })
        expect(componentJSON(component)).toMatchSnapshot()
})

test('TextInput element produces output with properties supplied as state objects', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {value: 'Hello!'}, {
        label: new TextInputState({value: 'Item Description'}),
        readOnly: new TrueFalseInputState({value: true})
    }))
    expect(el`app.page1.widget1`.readOnly).toBe(true)
    expect(el`label[for="app.page1.widget1"]`.innerHTML).toBe('Item Description')
})

test('TextInput element produces output with multiline', () => {
    const {container} = render(textInput('app.page1.description', {value: 'Hi there!'}, {multiline: true, label: 'Item Description'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('TextInput element produces output with description info', () => {
    const textType = new TextType('tt1', {description: 'A text input for entering text'})
    const {container} = render(textInput('app.page1.description', {value: 'Hi there!', dataType: textType}, {multiline: true, label: 'Item Description'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('TextInput element produces output with default values where properties omitted',
    snapshot(textInput('app.page1.height', {value: undefined}))
)

test('TextInput shows value from the state supplied', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {value: 'Hello!'}, {}))
    expect(el`app.page1.widget1`.value).toBe('Hello!')
})

test('TextInput shows empty value when state value is absent', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {}))
    expect(el`app.page1.widget1`.value).toBe('')
})

test('TextInput shows empty value when state value is set to undefined', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {value: undefined}))
    expect(el`app.page1.widget1`.value).toBe('')
})

test('TextInput shows initial value when state value is set to undefined and initial value exists', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {value: 'Axe'}))
    expect(el`app.page1.widget1`.value).toBe('Axe')
})

test('TextInput shows initial value when state value is set to undefined and initial value is a value object', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {value: valueObj('Axe')}))
    expect(el`app.page1.widget1`.value).toBe('Axe')
})

test('TextInput shows empty value when state value is set to null and initial value exists', () => {
    const {el} = testContainer(textInput('app.page1.widget1', new TextInput.State({value: 'Axe'})._withStateForTest({value: null})))
    expect(el`app.page1.widget1`.value).toBe('')
})

test('TextInput stores updated values in the app store section for its path', async () => {
    const {el, user} = testContainer(textInput('app.page1.sprocket', {value: 'Hi'}))
    const inputEl = el`app.page1.sprocket`
    await user.type(inputEl, '!')
    await wait(10)
    expect(stateAt('app.page1.sprocket').value).toBe('Hi!')
})

test('TextInput stores null value in the app store when cleared', async () => {
    const {el, user} = testContainer(textInput('app.page1.sprocket2', {value: 'Hi'}))

    const inputEl = el`app.page1.sprocket2`
    await user.clear(inputEl)
    await wait(10)
    expect(stateAt('app.page1.sprocket2').dataValue).toBe(null)
})

test('TextInput stores errors shown when blurred and ShowErrors or Reset called', async () => {
    const {el, user, domContainer} = testContainer(textInput('app.page1.sprocket2', {value: 'Hi'}))

    // expect(stateAt('app.page1.sprocket2').errorsShown).toBe(false)
    const inputEl = el`app.page1.sprocket2`
    await user.click(inputEl)
    await wait(10)
    expect(stateAt('app.page1.sprocket2').errorsShown).toBe(false)

    await user.click(domContainer.ownerDocument.body)
    await wait(10)
    expect(stateAt('app.page1.sprocket2').errorsShown).toBe(true)

    await act( () => stateAt('app.page1.sprocket2').ShowErrors(false) )
    expect(stateAt('app.page1.sprocket2').errorsShown).toBe(false)

    await act( () => stateAt('app.page1.sprocket2').ShowErrors(true) )
    expect(stateAt('app.page1.sprocket2').errorsShown).toBe(true)

    await act( () => stateAt('app.page1.sprocket2').Reset() )
    expect(stateAt('app.page1.sprocket2').errorsShown).toBe(false)
})

test('TextInput shows errors if errorShown is true', async () => {
    const {el} = testContainer(textInput('app.page1.sprocket2', {value: 'Hi'}, {label: 'The Input'}))

    const minLength3 = new TextType('tt1', {minLength: 3})
    await actWait(10)
    await actWait( () => stateAt('app.page1.sprocket2').props.dataType = minLength3 )

    await actWait( () => stateAt('app.page1.sprocket2').ShowErrors(false) )
    expect(el`p.MuiFormHelperText-root.Mui-error`).toBe(null)
    expect(el`label`).not.toHaveClass('Mui-error')

    await actWait( () => stateAt('app.page1.sprocket2').ShowErrors(true) )
    expect(el`p.MuiFormHelperText-root.Mui-error`.innerHTML).toBe('Minimum length 3')
    expect(el`label`).toHaveClass('Mui-error')
})

test('TextInput shows required', async () => {
    const {el} = testContainer(textInput('app.page1.sprocket2', {value: 'Hi'}, {label: 'The Input'}))

    const requiredType = new TextType('tt1', {required: true})
    await actWait(10)
    await actWait( () => stateAt('app.page1.sprocket2').props.dataType = requiredType )

    await actWait( () => stateAt('app.page1.sprocket2').Reset() )
    expect(el`label`.textContent).toBe('The Input *')
})

test('TextInput uses properties from dataType', async () => {
    const {el} = testContainer(textInput('app.page1.sprocket2', {value: 'Hi'}, {label: 'The Input'}))

    const textType = new TextType('tt1', {minLength: 2, maxLength: 10, format: 'url'})
    await actWait(10)
    await actWait( () => stateAt('app.page1.sprocket2').props.dataType = textType )

    await actWait( () => stateAt('app.page1.sprocket2').Reset() )
    expect(el`input`.minLength).toBe(2)
    expect(el`input`.maxLength).toBe(10)
    expect(el`input`.type).toBe('url')
})

test('TextInput uses multiline from dataType', async () => {
    const {el} = testContainer(textInput('app.page1.sprocket2', {value: 'Hi'}, {label: 'The Input'}))

    const textType = new TextType('tt1', {format: 'multiline'})
    await actWait(10)
    await actWait( () => stateAt('app.page1.sprocket2').props.dataType = textType )

    await actWait( () => stateAt('app.page1.sprocket2').Reset() )
    expect(el`textarea`.textContent).toBe('Hi')
})

test('TextInput overrides properties from dataType', async () => {
    const {el} = testContainer(textInput('app.page1.sprocket2', {value: 'Hi'}, {label: 'The Input', multiline: true}))

    const textType = new TextType('tt1', {minLength: 2, maxLength: 10})
    await actWait(10)
    await actWait( () => stateAt('app.page1.sprocket2').props.dataType = textType )

    await actWait( () => stateAt('app.page1.sprocket2').Reset() )
    expect(el`textarea`.textContent).toBe('Hi')
})

test('State class has correct properties and functions', () => {
    const state = new TextInput.State({value: 'car'})
    const appInterface = testAppInterface('testPath', state)
    expect(state.value).toBe('car')
    expect(state.defaultValue).toBe('')

    state.Reset()
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state._withStateForTest({value: undefined, errorsShown: false}))
})

test('State class gives correct value when its value is a value object', () => {
    const state = new TextInput.State({value: valueObj('car')})
    expect(state.value).toBe('car')
    expect(state.originalValue).toBe('car')
})

test('State class gives correct value when its value is another value whose value is a value object', () => {
    const state1 = new TextInput.State({value: valueObj('car')})
    const state2 = new TextInput.State({value: state1})
    expect(state2.value).toBe('car')
})

test('valueOf returns the value', () => {
    const state = new TextInput.State({value: 'car'})
    expect(state.valueOf()).toBe('car')
})

test('string conversion uses the value', () => {
    const state = new TextInput.State({value: 'car'})
    expect('x' + state).toBe('xcar')
})

test('State is valid and has no errors when it has no data type', () => {
    const state = new TextInput.State({value: 'car'})
    expect(state.valid).toBe(true)
    expect(state.errors).toBe(null)
})

test('State is valid when its value is valid for the data type', () => {
    const textType = new TextType('tt1', {minLength: 3})
    const stateValid = new TextInput.State({value: 'car', dataType: textType})
    const stateInvalid = new TextInput.State({value: 'ca', dataType: textType})
    expect(stateValid.dataType).toBe(textType)
    expect(stateValid.valid).toBe(true)
    expect(stateValid.errors).toBe(null)
    expect(stateInvalid.valid).toBe(false)
    expect(stateInvalid.errors).toStrictEqual(['Minimum length 3'])
})

test('State uses props or state value for validation and not default value', () => {
    const textType = new TextType('tt1', {required: true})
    const stateValid = new TextInput.State({value: 'car', dataType: textType})
    const stateInvalidProps = new TextInput.State({value: null, dataType: textType})
    const stateInvalidState = new TextInput.State({value: 'car', dataType: textType})._withStateForTest({value: null})
    expect(stateValid.errors).toBe(null)
    expect(stateInvalidProps.errors).toStrictEqual(['Required'])
    expect(stateInvalidState.errors).toStrictEqual(['Required'])

})

test('State is modified only when its value is not null and different to its empty initial value', () => {
    const state = new TextInput.State({})
    expect(state.modified).toBe(false)
    const updatedState = state._withStateForTest({value: 'new car'})
    expect(updatedState.modified).toBe(true)
    const updatedAgainState = updatedState._withStateForTest({value: undefined})
    expect(updatedAgainState.modified).toBe(false)
    const updatedToNullState = updatedState._withStateForTest({value: null})
    expect(updatedToNullState.modified).toBe(false)
})

test('State is modified only when its value is not null and different to its null initial value', () => {
    const state = new TextInput.State({value: null})
    expect(state.modified).toBe(false)
    const updatedState = state._withStateForTest({value: 'new car'})
    expect(updatedState.modified).toBe(true)
    const updatedAgainState = updatedState._withStateForTest({value: undefined})
    expect(updatedAgainState.modified).toBe(false)
    const updatedToNullState = updatedState._withStateForTest({value: null})
    expect(updatedToNullState.modified).toBe(false)
})

test('State is modified only when its value is different to its initial value', () => {
    const state = new TextInput.State({value: 'car'})
    expect(state.modified).toBe(false)
    const updatedState = state._withStateForTest({value: 'new car'})
    expect(updatedState.modified).toBe(true)
    const updatedAgainState = updatedState._withStateForTest({value: 'car'})
    expect(updatedAgainState.modified).toBe(false)
    const updatedToNullState = updatedState._withStateForTest({value: null})
    expect(updatedToNullState.modified).toBe(true)
})

test('State stores errorsShown', () => {
    const state = new TextInput.State({value: 'car'})
    expect(state.errorsShown).toBe(false)
    const updatedState = state._withStateForTest({errorsShown: true})
    expect(updatedState.errorsShown).toBe(true)
})

