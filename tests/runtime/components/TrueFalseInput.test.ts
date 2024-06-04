/**
 * @jest-environment jsdom
 */

import {TrueFalseInput} from '../../../src/runtime/components/index'
import {snapshot, testAppInterface, valueObj, wrappedTestElement} from '../../testutil/testHelpers'
import {testContainer} from '../../testutil/rtlHelpers'
import {TrueFalseInputState} from '../../../src/runtime/components/TrueFalseInput'

const [trueFalseInput, appStoreHook] = wrappedTestElement(TrueFalseInput, TrueFalseInputState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('TrueFalseInput element produces output with properties supplied',
    snapshot(trueFalseInput('app.page1.width', {value: true}, {label: 'Covered', styles: {color: 'red'}}))
)

test('TrueFalseInput element produces output with default values where properties omitted',
    snapshot(trueFalseInput('app.page1.height', {}))
)

test('TrueFalseInput shows false if that value is in the state', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {value: false}))
    expect(el`app.page1.widget1`.checked).toBe(false)
})

test('TrueFalseInput shows true if that value is in the state', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {value: true}), 'container2')
    expect(el`app.page1.widget1`.checked).toBe(true)
})

test('TrueFalseInput shows false if no value is in the state', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1x', {}))
    expect(el`app.page1.widget1x`.checked).toBe(false)
})

test('TrueFalseInput shows false if an undefined value is in the state', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget11', {value: undefined}), 'container4')
    expect(el`app.page1.widget11`.checked).toBe(false)
})

test('TrueFalseInput shows initial value when state value is set to undefined and initial value exists', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', new TrueFalseInputState({value: true})._withStateForTest({value: undefined})), 'container3')
    expect(el`app.page1.widget1`.checked).toBe(true)
})

test('TrueFalseInput shows empty value when state value is set to null and initial value exists', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', new TrueFalseInputState({value: true})._withStateForTest({value: null})), 'testContainer2')
    expect(el`app.page1.widget1`.checked).toBe(false)
})

test('TrueFalseInput element produces output with other properties supplied as state objects', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {value: true},
        {
            label: valueObj('Is it OK')
        }), 'container5')
    expect(el`label`.textContent).toBe('Is it OK')
})

test('TrueFalseInput stores updated values in the app store section for its path', async () => {
    const {el, user} = testContainer(trueFalseInput('app.page1.sprocket', {value: false}))
    const inputEl = el`app.page1.sprocket`
    await user.click(inputEl)
    expect(stateAt('app.page1.sprocket').value).toBe(true)
} )

test('State class has correct properties', () => {
    const emptyState = new TrueFalseInput.State({})
    expect(emptyState.value).toBe(false)
    expect(emptyState.toString()).toBe('false')
    expect(emptyState.dataValue).toBe(null)
    expect(emptyState.defaultValue).toBe(false)

    const state = new TrueFalseInput.State({value: true})
    const appInterface = testAppInterface('testPath', state)
    expect(state.value).toBe(true)
    expect(state.toString()).toBe('true')

    state.Reset()
    const resetState = state._withStateForTest({value: undefined, errorsShown: false})
    expect(appInterface.updateVersion).toHaveBeenCalledWith({value: undefined, errorsShown: false})
    expect(resetState.value).toBe(true)
    expect(resetState.dataValue).toBe(true)
})

test('State is modified only when its value is not null and different to its empty initial value', () => {
    const state = new TrueFalseInput.State({})
    expect(state.modified).toBe(false)
    const updatedState = state._withStateForTest({value: true})
    expect(updatedState.modified).toBe(true)
    const resetState = updatedState._withStateForTest({value: undefined})
    expect(resetState.modified).toBe(false)
    const updatedToNullState = updatedState._withStateForTest({value: null})
    expect(updatedToNullState.modified).toBe(false)
    const updatedToFalseState = updatedState._withStateForTest({value: false})
    expect(updatedToFalseState.modified).toBe(false)
})

test('State is modified only when its value is not null and different to its true initial value', () => {
    const state = new TrueFalseInput.State({value: true})
    expect(state.modified).toBe(false)
    const updatedState = state._withStateForTest({value: false})
    expect(updatedState.modified).toBe(true)
    const resetState = updatedState._withStateForTest({value: undefined})
    expect(resetState.modified).toBe(false)
    const updatedToNullState = updatedState._withStateForTest({value: null})
    expect(updatedToNullState.modified).toBe(true)
})

test('State is modified only when its value is different to its false value', () => {
    const state = new TrueFalseInput.State({value: false})
    expect(state.modified).toBe(false)
    const updatedState = state._withStateForTest({value: true})
    expect(updatedState.modified).toBe(true)
    const resetState = updatedState._withStateForTest({value: undefined})
    expect(resetState.modified).toBe(false)
    const updatedToNullState = updatedState._withStateForTest({value: null})
    expect(updatedToNullState.modified).toBe(false)
})
