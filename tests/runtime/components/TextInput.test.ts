import {expect, MockedFunction, test, vi} from "vitest"
/**
 * @vitest-environment jsdom
 */
import {TextInput} from '../../../src/runtime/components/index'
import {componentJSON, snapshot, valueObj, wait, wrappedTestElementNew} from '../../testutil/testHelpers'
import {act, render} from '@testing-library/react'
import {actWait, testContainer} from '../../testutil/rtlHelpers'
import {TextInputState} from '../../../src/runtime/components/TextInput'
import {TrueFalseInputState} from '../../../src/runtime/components/TrueFalseInput'
import {TextType} from '../../../src/runtime/types'
import AppStateStore from '../../../src/runtime/state/AppStateStore'

const [textInput, appStoreHook] = wrappedTestElementNew(TextInput)

const stateAt = (path: string) => appStoreHook.stateAt(path)

const DEBUG_TIMEOUT = 1000000

test('TextInput element produces output with properties supplied', () => {
        const component = textInput('app.page1.width', {
            initialValue: 'Hi there!',
            maxLength: 11,
            width: 23,
            readOnly: true,
            label: 'Item Description',
            styles: {border: '1px solid green'}
        })
        expect(componentJSON(component)).toMatchSnapshot()
})

test('TextInput element produces output with properties supplied as state objects', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {
        initialValue: 'Hello!',
        label: new TextInputState({initialValue: 'Item Description'}),
        readOnly: new TrueFalseInputState({value: true})
    }))
    expect(el`app.page1.widget1`.readOnly).toBe(true)
    expect(el`label[for="app.page1.widget1"]`.innerHTML).toBe('Item Description')
})

test('TextInput element produces output with multiline', () => {
    const {container} = render(textInput('app.page1.description', {initialValue: 'Hi there!', multiline: true, label: 'Item Description'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('TextInput element produces output with description info', () => {
    const textType = new TextType('tt1', {description: 'A text input for entering text'})
    const {container} = render(textInput('app.page1.description', {initialValue: 'Hi there!', dataType: textType, multiline: true, label: 'Item Description'}))
    expect(container.innerHTML).toMatchSnapshot()
})

test('keyAction function is called with key event', async () => {
    const keyAction = vi.fn()
    const {keyDown} = testContainer(textInput('app.page1.widget1', {initialValue: 'Hello!',
        label: 'Item Description',
        readOnly: false,
        keyAction
    }))
    await actWait( () => keyDown('app.page1.widget1', 'Enter'))
    expect(keyAction).toHaveBeenCalled()
    const callFirstArg: any = (keyAction as MockedFunction<any>).mock.calls[0][0]
    expect(callFirstArg.key).toBe('Enter')
})

test('TextInput element produces output with default values where properties omitted',
    snapshot(textInput('app.page1.height', {initialValue: undefined}))
)

test('TextInput shows value from the state supplied', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {initialValue: 'Hello!'}))
    expect(el`app.page1.widget1`.value).toBe('Hello!')
})

test('TextInput shows empty value when state value is absent', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {}))
    expect(el`app.page1.widget1`.value).toBe('')
})

test('TextInput shows empty value when state value is set to undefined', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {initialValue: undefined}))
    expect(el`app.page1.widget1`.value).toBe('')
})

test('TextInput shows initial value when state value is set to undefined and initial value exists', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {initialValue: 'Axe'}))
    expect(el`app.page1.widget1`.value).toBe('Axe')
})

test('TextInput shows initial value when state value is set to undefined and initial value is a value object', () => {
    const {el} = testContainer(textInput('app.page1.widget1', {initialValue: valueObj('Axe')}))
    expect(el`app.page1.widget1`.value).toBe('Axe')
})

test('TextInput shows empty value when state value is set to null and initial value exists', () => {
    const {el} = testContainer(textInput('app.page1.widget1', new TextInput.State({initialValue: 'Axe'})._withStateForTest({value: null})))
    expect(el`app.page1.widget1`.value).toBe('')
})

test('TextInput stores updated values in the app store section for its path', async () => {
    const {el, user} = testContainer(textInput('app.page1.sprocket', {initialValue: 'Hi'}))
    const inputEl = el`app.page1.sprocket`
    await user.type(inputEl, '!')
    await wait(10)
    expect(stateAt('app.page1.sprocket').value).toBe('Hi!')
})

test('TextInput stores null value in the app store when cleared', async () => {
    const {el, user} = testContainer(textInput('app.page1.sprocket2', {initialValue: 'Hi'}))

    const inputEl = el`app.page1.sprocket2`
    await user.clear(inputEl)
    await wait(10)
    expect(stateAt('app.page1.sprocket2').dataValue).toBe(null)
})

test('TextInput stores errors shown when blurred and ShowErrors or Reset called', async () => {
    const {el, user, domContainer} = testContainer(textInput('app.page1.sprocket2', {initialValue: 'Hi'}))

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
    const minLength3 = new TextType('tt1', {minLength: 3})
    const {el} = testContainer(textInput('app.page1.sprocket2', {initialValue: 'Hi', label: 'The Input', dataType: minLength3}))

    await actWait( () => stateAt('app.page1.sprocket2').ShowErrors(false) )
    expect(el`p.MuiFormHelperText-root.Mui-error`).toBe(null)
    expect(el`label`).not.toHaveClass('Mui-error')

    await actWait( () => stateAt('app.page1.sprocket2').ShowErrors(true) )
    // expect(el`p.MuiFormHelperText-root.Mui-error`.innerHTML).toBe('Minimum length 3')
    expect(el`label`).toHaveClass('Mui-error')
})

test('TextInput shows required', async () => {
    const requiredType = new TextType('tt1', {required: true})

    const {el} = testContainer(textInput('app.page1.sprocket2', {initialValue: 'Hi', label: 'The Input', dataType: requiredType}))
    expect(el`label`.textContent).toBe('The Input *')
})

test('TextInput uses properties from dataType', async () => {
    const textType = new TextType('tt1', {minLength: 2, maxLength: 10, format: 'url'})
    const {el} = testContainer(textInput('app.page1.sprocket2', {initialValue: 'Hi', label: 'The Input', dataType: textType}))

    expect(el`input`.minLength).toBe(2)
    expect(el`input`.maxLength).toBe(10)
    expect(el`input`.type).toBe('url')
})

test('TextInput uses multiline from dataType', async () => {
    const textType = new TextType('tt1', {format: 'multiline'})
    const {el} = testContainer(textInput('app.page1.sprocket2', {initialValue: 'Hi', label: 'The Input', dataType: textType}))
    expect(el`textarea`.textContent).toBe('Hi')
})

test('TextInput overrides properties from dataType', async () => {
    const {el} = testContainer(textInput('app.page1.sprocket2', {initialValue: 'Hi', label: 'The Input', multiline: true}))

    const textType = new TextType('tt1', {minLength: 2, maxLength: 10})
    await actWait(10)
    await actWait( () => stateAt('app.page1.sprocket2').props.dataType = textType )

    await actWait( () => stateAt('app.page1.sprocket2').Reset() )
    expect(el`textarea`.textContent).toBe('Hi')
})

test('TextInput can be focused', async () => {
    const elementId = 'app.page1.sprocket2'
    const {el} = testContainer(textInput(elementId, {initialValue: 'Hi', label: 'The Input'}))
    await actWait(10)
    expect(document.activeElement).not.toBe(el`app.page1.sprocket2`)
    await actWait( () => stateAt(elementId).Focus() )
    expect(document.activeElement).toBe(el`app.page1.sprocket2`)
    expect(stateAt(elementId).domElement).toBe(el`app.page1.sprocket2`)
})

test('State class has correct properties and functions with defaults', () => {
    const state = new TextInput.State({})
    expect(state.value).toBe('')
    expect(state.toString()).toBe('')
    expect(state.defaultValue).toBe('')
})

test('State class has correct properties and functions', async () => {
    const store = new AppStateStore()
    const state: TextInputState = store.getOrCreate('id1', TextInputState, {initialValue: 'car'})
    expect(state.value).toBe('car')
    expect(state.toString()).toBe('car')
    expect(state.defaultValue).toBe('')

    state.ShowErrors(true)
    await wait()
    expect(store.get('id1').errorsShown).toBe(true)
})

test('State class gives correct value when its value is a value object', () => {
    const state = new TextInput.State({initialValue: valueObj('car')})
    expect(state.value).toBe('car')
    expect(state.originalValue).toBe('car')
})

test('State class gives correct value when its value is another value whose value is a value object', () => {
    const state1 = new TextInput.State({initialValue: valueObj('car')})
    const state2 = new TextInput.State({initialValue: state1})
    expect(state2.value).toBe('car')
})

test('valueOf returns the value', () => {
    const state = new TextInput.State({initialValue: 'car'})
    expect(state.valueOf()).toBe('car')
})

test('string conversion uses the value', () => {
    const state = new TextInput.State({initialValue: 'car'})
    expect('x' + state).toBe('xcar')
})

test('Can use state object proxy in simple expressions', () => {
    const store = new AppStateStore()
    const state = store.getOrCreate('id1', TextInputState, {initialValue: 'car'})
    expect(state + 'park').toBe('carpark')
})

test('State is valid and has no errors when it has no data type', () => {
    const state = new TextInput.State({initialValue: 'car'})
    expect(state.valid).toBe(true)
    expect(state.errors).toBe(null)
})

test('State is valid when its value is valid for the data type', () => {
    const textType = new TextType('tt1', {minLength: 3})
    const stateValid = new TextInput.State({initialValue: 'car', dataType: textType})
    const stateInvalid = new TextInput.State({initialValue: 'ca', dataType: textType})
    expect(stateValid.dataType).toBe(textType)
    expect(stateValid.valid).toBe(true)
    expect(stateValid.errors).toBe(null)
    expect(stateInvalid.valid).toBe(false)
    expect(stateInvalid.errors).toStrictEqual(['Minimum length 3'])
})

test('State uses props or state value for validation and not default value', () => {
    const textType = new TextType('tt1', {required: true})
    const stateValid = new TextInput.State({initialValue: 'car', dataType: textType})
    const stateInvalidProps = new TextInput.State({initialValue: null, dataType: textType})
    const stateInvalidState = new TextInput.State({initialValue: 'car', dataType: textType})._withStateForTest({value: null})
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
    const state = new TextInput.State({initialValue: null})
    expect(state.modified).toBe(false)
    const updatedState = state._withStateForTest({value: 'new car'})
    expect(updatedState.modified).toBe(true)
    const updatedAgainState = updatedState._withStateForTest({value: undefined})
    expect(updatedAgainState.modified).toBe(false)
    const updatedToNullState = updatedState._withStateForTest({value: null})
    expect(updatedToNullState.modified).toBe(false)
})

test('State is modified only when its value is different to its initial value', () => {
    const state = new TextInput.State({initialValue: 'car'})
    expect(state.modified).toBe(false)
    const updatedState = state._withStateForTest({value: 'new car'})
    expect(updatedState.modified).toBe(true)
    const updatedAgainState = updatedState._withStateForTest({value: 'car'})
    expect(updatedAgainState.modified).toBe(false)
    const updatedToNullState = updatedState._withStateForTest({value: null})
    expect(updatedToNullState.modified).toBe(true)
})

test('State stores errorsShown', () => {
    const state = new TextInput.State({initialValue: 'car'})
    expect(state.errorsShown).toBe(false)
    const updatedState = state._withStateForTest({errorsShown: true})
    expect(updatedState.errorsShown).toBe(true)
})

