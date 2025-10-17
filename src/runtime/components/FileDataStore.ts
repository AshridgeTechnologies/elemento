import {createElement} from 'react'
import FileDataStoreImpl from './FileDataStoreImpl'
import DataStore, {CollectionName, Criteria, DataStoreObject, ErrorResult, Id} from '../../shared/DataStore'
import appFunctions from '../appFunctions'
import {BaseComponentState} from '../state/BaseComponentState'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = {path: string, display?: boolean}
type ExternalProperties = {}
type StateProperties = {dataStore?: FileDataStoreImpl}

const {NotifyError} = appFunctions

export const FileDataStoreSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Filedatastore",
    "description": "Description of FileDataStore",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "FileDataStore",
    "icon": "insert_drive_file",
    "elementType": "statefulUI",
    "parentType": "App",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {}
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}

export default function FileDataStore({path, display = false}: Properties) {
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', 'File Data Store ' + path)) : null
}

export class FileDataStoreState extends BaseComponentState<ExternalProperties, StateProperties>
    implements DataStore {

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

    addAll(collection: CollectionName, items: { [p: Id]: DataStoreObject }) {
        return this.dataStore.addAll(collection, items).catch( e => NotifyError('Could not add items to data store', e) )
    }

    update(collection: CollectionName, id: Id, changes: object) {
        return this.dataStore.update(collection, id, changes).catch( e => NotifyError('Could not update item in data store', e) )
    }

    remove(collection: CollectionName, id: Id) {
        return this.dataStore.remove(collection, id).catch( e => NotifyError('Could not remove item from data store', e) )
    }

    getById(collection: CollectionName, id: Id, nullIfNotFound: boolean) {
        return this.dataStore.getById(collection, id, nullIfNotFound).catch( e => {
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
FileDataStore.Schema = FileDataStoreSchema

