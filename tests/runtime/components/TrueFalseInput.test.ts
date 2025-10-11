/**
 * @vitest-environment jsdom
 */

import {expect, test} from 'vitest'
import {TrueFalseInput} from '../../../src/runtime/components/index'
import {DEBUG_TIMEOUT, snapshot, testAppInterface, valueObj, wait, wrappedTestElement} from '../../testutil/testHelpers'
import {testContainer} from '../../testutil/rtlHelpers'

const [trueFalseInput, appStoreHook] = wrappedTestElement(TrueFalseInput)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('TrueFalseInput element produces output with properties supplied',
    snapshot(trueFalseInput('app.page1.width', {initialValue: true, label: 'Covered', styles: {color: 'red'}}))
)

test('TrueFalseInput element produces output with default values where properties omitted',
    snapshot(trueFalseInput('app.page1.height', {}))
)

test('TrueFalseInput shows false if that value is in the state', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {initialValue: false}))
    expect(el`app.page1.widget1`.checked).toBe(false)
})

test('TrueFalseInput shows true if that value is in the state', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {initialValue: true}), 'container2')
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
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {initialValue: true}), 'container3')
    expect(el`app.page1.widget1`.checked).toBe(true)
})

// TODO check reason for this test
test.skip('TrueFalseInput shows empty value when state value is set to null and initial value exists', async () => {
    const {el, user} = testContainer(trueFalseInput('app.page1.widget1', {initialValue: true}), 'testContainer2')
    expect(el`app.page1.widget1`.checked).toBe(true)
    stateAt('app.page1.widget1')._setValue(null)
    await wait()
    expect(el`app.page1.widget1`.checked).toBe(false)

})

test('TrueFalseInput shows true value when state value is set to true and initial value exists', async () => {
    const {el, user} = testContainer(trueFalseInput('app.page1.widget22', {initialValue: false}), 'testContainer3')
    expect(el`app.page1.widget22`.checked).toBe(false)
    stateAt('app.page1.widget22')._setValue(true)
    await wait(20)
    expect(el`app.page1.widget22`.checked).toBe(true)
})

test('TrueFalseInput shows false value when state value is set to false and initial value exists', async () => {
    const {el, user} = testContainer(trueFalseInput('app.page1.widget77', {initialValue: true}), 'testContainer4')
    expect(el`app.page1.widget77`.checked).toBe(true)
    stateAt('app.page1.widget77')._setValue(false)
    await wait(20)
    expect(el`app.page1.widget77`.checked).toBe(false)

})

test('TrueFalseInput element produces output with other properties supplied as state objects', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {initialValue: true, label: valueObj('Is it OK')}), 'container5')
    expect(el`label`.textContent).toBe('Is it OK')
})

test('TrueFalseInput stores updated values in the app store section for its path', async () => {
    const {el, user} = testContainer(trueFalseInput('app.page1.sprocket', {initialValue: false}))
    const inputEl = el`app.page1.sprocket`
    await user.click(inputEl)
    expect(stateAt('app.page1.sprocket').value).toBe(true)
} )

test('TrueFalseInput does not change if readonly', async () => {
    const {el, user} = testContainer(trueFalseInput('app.page1.sprocket', {initialValue: false, readOnly: true}))
    const inputEl = el`app.page1.sprocket`
    await expect(user.click(inputEl)).rejects.toThrow(/Unable to perform pointer interaction/)
    expect(stateAt('app.page1.sprocket').value).toBe(false)
} )

test('State class has correct properties', () => {
    const emptyState = new TrueFalseInput.State({})
    expect(emptyState.value).toBe(false)
    expect(emptyState.toString()).toBe('false')
    expect(emptyState.dataValue).toBe(null)
    expect(emptyState.defaultValue).toBe(false)

    const state = new TrueFalseInput.State({initialValue: true})
    const appInterface = testAppInterface('testPath', state)
    expect(state.value).toBe(true)
    expect(state.toString()).toBe('true')

    state.Reset()
    const resetState = state._withStateForTest({value: undefined, errorsShown: false})
    expect(appInterface.updateVersion).toHaveBeenCalledWith(state.withMergedState({value: undefined, errorsShown: false}))
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
    const state = new TrueFalseInput.State({initialValue: true})
    expect(state.modified).toBe(false)
    const updatedState = state._withStateForTest({value: false})
    expect(updatedState.modified).toBe(true)
    const resetState = updatedState._withStateForTest({value: undefined})
    expect(resetState.modified).toBe(false)
    const updatedToNullState = updatedState._withStateForTest({value: null})
    expect(updatedToNullState.modified).toBe(true)
})

test('State is modified only when its value is different to its false value', () => {
    const state = new TrueFalseInput.State({initialValue: false})
    expect(state.modified).toBe(false)
    const updatedState = state._withStateForTest({value: true})
    expect(updatedState.modified).toBe(true)
    const resetState = updatedState._withStateForTest({value: undefined})
    expect(resetState.modified).toBe(false)
    const updatedToNullState = updatedState._withStateForTest({value: null})
    expect(updatedToNullState.modified).toBe(false)
})
