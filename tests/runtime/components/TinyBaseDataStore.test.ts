/**
 * @vitest-environment jsdom
 */
import {expect, test, vi} from 'vitest'
import {wrappedTestElement} from '../../testutil/testHelpers'
import {TinyBaseDataStore} from '../../../src/runtime/components'
import {testContainer} from '../../testutil/rtlHelpers'
import {type DataStoreProperties} from '../../../src/runtime/components/TinyBaseDataStore'

const [dataStore, appStoreHook] = wrappedTestElement(TinyBaseDataStore)

const stateAt = (path: string) => appStoreHook.stateAt(path)

test('sets up state properties supplied', () => {
    const props: DataStoreProperties = {collections: 'Widgets;Sprockets', databaseName: 'DB1',
        storeOnDevice: true, syncWithServer: true, serverUrl: 'http://example.com'}
    const {el} = testContainer(dataStore('app.page1.store1', props))
    expect(stateAt('app.page1.store1').props).toStrictEqual(props)
})

test('sets up data store with transformed names of properties supplied', () => {
    const props: DataStoreProperties = {collections: 'Widgets;Sprockets', databaseName: 'DB1',
        storeOnDevice: true, syncWithServer: true, serverUrl: 'http://example.com/', databaseType: 'Type 1'}
    const {el} = testContainer(dataStore('app.page1.store1', props))
    expect(stateAt('app.page1.store1').state.dataStore.props).toStrictEqual({
        collections: 'Widgets;Sprockets', databaseInstanceName: 'DB1', persist: true, sync: true, syncServer: 'http://example.com/', databaseTypeName: 'Type 1'
    })
})

test('closes store on unmount', () => {
    const props: DataStoreProperties = {collections: 'Widgets;Sprockets', databaseName: 'DB1'}
    const {unmount} = testContainer(dataStore('app.page1.store1', props))
    const dataStoreImpl = stateAt('app.page1.store1').state.dataStore
    vi.spyOn(dataStoreImpl, 'close')
    unmount()
    expect(dataStoreImpl.close).toHaveBeenCalled()
})
