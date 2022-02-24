import {act} from 'react-test-renderer'
import {updateState} from '../../src/runtime/appData'

import appFunctions from '../../src/runtime/appFunctions'
import {stateFor} from '../util/testHelpers'

const {Reset, ShowPage} = appFunctions

test('ShowPage updates current page app state', () => {
    act(() => {
        updateState('app._data', {currentPage: 'Main'})
    })
    expect(stateFor('app._data')).toStrictEqual({currentPage: 'Main'})
    act(() => ShowPage('Other'))
    expect(stateFor('app._data')).toStrictEqual({currentPage: 'Other'})
})

test('Reset sets value to undefined', () => {
    const update = jest.fn()
    const elementState = {value: 42, update}
    Reset(elementState)
    expect(update).toBeCalledWith({value: undefined})
})
