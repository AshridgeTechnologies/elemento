/**
 * @jest-environment jsdom
 */

import {TrueFalseInput} from '../../../src/runtime/components/index'
import {snapshot, testAppInterface, wrappedTestElement} from '../../testutil/testHelpers'
import userEvent from '@testing-library/user-event'
import {testContainer} from '../../testutil/rtlHelpers'
import {TrueFalseInputState} from '../../../src/runtime/components/TrueFalseInput'

const [trueFalseInput, appStoreHook] = wrappedTestElement(TrueFalseInput, TrueFalseInputState)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('TrueFalseInput element produces output with properties supplied',
    snapshot(trueFalseInput('app.page1.width', {value: true}, {label: 'Covered'}))
)

test('TrueFalseInput element produces output with default values where properties omitted',
    snapshot(trueFalseInput('app.page1.height', {}))
)

test('TrueFalseInput shows false if that value is in the state', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {value: false}))
    expect(el`app.page1.widget1`.checked).toBe(false)
})

test('TrueFalseInput shows true if that value is in the state', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {value: true}))
    expect(el`app.page1.widget1`.checked).toBe(true)
})

test('TrueFalseInput shows false if no value is in the state', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {}))
    expect(el`app.page1.widget1`.checked).toBe(false)
})

test('TrueFalseInput shows false if an undefined value is in the state', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {value: undefined}))
    expect(el`app.page1.widget1`.checked).toBe(false)
})

test('TrueFalseInput shows initial value when state value is set to undefined and initial value exists', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', new TrueFalseInputState({value: true})._withStateForTest({value: undefined})))
    expect(el`app.page1.widget1`.checked).toBe(true)
})

test('TrueFalseInput shows empty value when state value is set to null and initial value exists', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', new TrueFalseInputState({value: true})._withStateForTest({value: null})), 'testContainer2')
    expect(el`app.page1.widget1`.checked).toBe(false)
})

test('TrueFalseInput element produces output with other properties supplied as state objects', () => {
    const {el} = testContainer(trueFalseInput('app.page1.widget1', {value: true},
        {
            label: {
                valueOf() {
                    return 'Is it OK'
                }
            }
        }))
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
    expect(emptyState._controlValue).toBe(undefined)
    expect(emptyState.defaultValue).toBe(false)

    const state = new TrueFalseInput.State({value: true})
    const appInterface = testAppInterface(); state.init(appInterface)
    expect(state.value).toBe(true)

    state.Reset()
    const resetState = state._withStateForTest({value: undefined})
    expect(appInterface.updateVersion).toHaveBeenCalledWith(resetState)
    expect(resetState.value).toBe(true)
    expect(resetState._controlValue).toBe(true)
})
