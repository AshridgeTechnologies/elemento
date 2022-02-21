import {act} from 'react-test-renderer'
import {updateState} from '../../src/runtime/appData'

import appFunctions from '../../src/runtime/appFunctions'
import {stateFor} from '../util/testHelpers'
const {Reset, ShowPage} = appFunctions

test('ShowPage updates current page app state', () => {
    act( () => {updateState('app._data', {currentPage: 'Main'}) } )
    expect(stateFor('app._data')).toStrictEqual({currentPage: 'Main'})
    act( () => ShowPage('Other') )
    expect(stateFor('app._data')).toStrictEqual({currentPage: 'Other'})
})

test('Reset sets value to null without changing other values in the app state for a control', () => {
    const path = 'app.MainPage.LastName'
    act( () => {updateState(path, {value: 'Fairlie', color: 'green'}) } )
    expect(stateFor(path)).toStrictEqual({value: 'Fairlie', color: 'green'})
    act( () => Reset(path) )
    expect(stateFor(path)).toStrictEqual({value: null, color: 'green'})
})