import {createElement} from 'react'
import FileDataStoreImpl from './FileDataStoreImpl'
import DataStore, {CollectionName, Criteria, DataStoreObject, ErrorResult, Id} from '../DataStore'
import appFunctions from '../appFunctions'
import {BaseComponentState, ComponentState} from './ComponentState'

type Properties = {path: string, display?: boolean}
type ExternalProperties = {}
type StateProperties = {dataStore?: FileDataStoreImpl}

const {NotifyError} = appFunctions

export default function FileDataStore({path, display = false}: Properties) {
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', 'File Data Store ' + path)) : null
}

export class FileDataStoreState extends BaseComponentState<ExternalProperties, StateProperties>
    implements DataStore, ComponentState<FileDataStoreState> {

    constructor(props: ExternalProperties = {}) {
        super(props)
    }

    private get dataStore() {
        if (!this.state.dataStore) {
            this.state.dataStore = new FileDataStoreImpl()
        }

        return this.state.dataStore!
    }

    Open() {
        this.dataStore.Open().catch( e => NotifyError('Could not open file', e) )
    }

    SaveAs() {
        this.dataStore.SaveAs().catch( e => NotifyError('Could not save to file', e) )
    }

    Save() {
        this.dataStore.Save().catch( e => NotifyError('Could not save to file', e) )
    }

    New() {
        this.dataStore.New().catch( e => NotifyError('Could not reset to new file', e) )
    }

    add(collection: CollectionName, id: Id, item: DataStoreObject) {
        return this.dataStore.add(collection, id, item).catch( e => NotifyError('Could not add item to data store', e) )
    }

    update(collection: CollectionName, id: Id, changes: object) {
        return this.dataStore.update(collection, id, changes).catch( e => NotifyError('Could not update item in data store', e) )
    }

    remove(collection: CollectionName, id: Id) {
        return this.dataStore.remove(collection, id).catch( e => NotifyError('Could not remove item from data store', e) )
    }

    getById(collection: CollectionName, id: Id) {
        return this.dataStore.getById(collection, id).catch( e => {
            NotifyError('Could not get item from data store', e)
            return new ErrorResult('Could not get item from data store', e.message)
        })
    }

    query(collection: CollectionName, criteria: Criteria) {
        return this.dataStore.query(collection, criteria).catch( e => {
            NotifyError('Could not query items in data store', e)
            return []
        })
    }

    observable(collection: CollectionName) {
        return this.dataStore.observable(collection)
    }
}

FileDataStore.State = FileDataStoreState

