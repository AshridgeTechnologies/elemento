import {act} from 'react-test-renderer'
import {updateState} from '../../src/runtime/appData'

import appFunctions from '../../src/runtime/appFunctions'
import {stateFor} from '../util/testHelpers'
const {ShowPage} = appFunctions

test('ShowPage updates current page app state', () => {
    act( () => {updateState('app._data', {currentPage: 'Main'}) } )
    expect(stateFor('app._data')).toStrictEqual({currentPage: 'Main'})
    act( () => ShowPage('Other') )
    expect(stateFor('app._data')).toStrictEqual({currentPage: 'Other'})
})