import {createElement} from 'react'
import FileDataStoreImpl from './FileDataStoreImpl'
import DataStore, {CollectionName, Criteria, DataStoreObject, ErrorResult, Id} from '../DataStore'
import { update } from '../stateProxy'
import appFunctions from '../appFunctions'

type Properties = {state: {_path: string}, display?: boolean}

const FileDataStore = function FileDataStore({state, display = false}: Properties) {
    const {_path: path} = state
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null)) : null
}

FileDataStore.State = class State implements DataStore {
    constructor(props: {dataStore?: FileDataStoreImpl}) {
        this.props = {dataStore: props.dataStore ?? new FileDataStoreImpl()}
    }

    private props: {dataStore: FileDataStoreImpl}
    private get dataStore() { return this.props.dataStore }

    mergeProps(newState: typeof this) {
        return this  // not expected to change collection name or data store at runtime AND comparing proxies for DataStore does not work
    }

    // init() {
    //     return update({dataStore: this.dataStore})
    // }

    Open() {
        this.dataStore.Open().catch( e => appFunctions().NotifyError('Could not open file', e) )
    }

    SaveAs() {
        this.dataStore.SaveAs().catch( e => appFunctions().NotifyError('Could not save to file', e) )
    }

    Save() {
        this.dataStore.Save().catch( e => appFunctions().NotifyError('Could not save to file', e) )
    }

    New() {
        this.dataStore.New().catch( e => appFunctions().NotifyError('Could not reset to new file', e) )
    }

    add(collection: CollectionName, id: Id, item: DataStoreObject) {
        return this.dataStore.add(collection, id, item).catch( e => appFunctions().NotifyError('Could not add item to data store', e) )
    }

    update(collection: CollectionName, id: Id, changes: object) {
        return this.dataStore.update(collection, id, changes).catch( e => appFunctions().NotifyError('Could not update item in data store', e) )
    }

    remove(collection: CollectionName, id: Id) {
        return this.dataStore.remove(collection, id).catch( e => appFunctions().NotifyError('Could not remove item from data store', e) )
    }

    getById(collection: CollectionName, id: Id) {
        return this.dataStore.getById(collection, id).catch( e => {
            appFunctions().NotifyError('Could not get item from data store', e)
            return new ErrorResult('Could not get item from data store', e.message)
        })
    }

    query(collection: CollectionName, criteria: Criteria) {
        return this.dataStore.query(collection, criteria).catch( e => {
            appFunctions().NotifyError('Could not query items in data store', e)
            return []
        })
    }

    observable(collection: CollectionName) {
        return this.dataStore.observable(collection)
    }
}

export default FileDataStore
