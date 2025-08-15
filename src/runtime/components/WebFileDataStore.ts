import DataStore, {CollectionName, Criteria, DataStoreObject, ErrorResult, Id} from '../../shared/DataStore'
import appFunctions from '../appFunctions'
import {BaseComponentState, ComponentState} from './ComponentState'
import WebFileDataStoreImpl from './WebFileDataStoreImpl'
import {Definitions} from '../../model/schema'
import {ElementSchema} from '../../model/ModelElement'

type Properties = {path: string}
type ExternalProperties = {url: string}
type StateProperties = {dataStore?: WebFileDataStoreImpl}

const {NotifyError} = appFunctions

export const WebFileDataStoreSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Webfiledatastore",
    "description": "Description of WebFileDataStore",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "WebFileDataStore",
    "icon": "archive",
    "elementType": "background",
    "parentType": "App",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "url": {
                    "description": "The ",
                    "type": "string"
                }
            }
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}

export const WebFileDataStoreMetadata = {
    stateProps: ['url']
}

export default function WebFileDataStore({path}: Properties) {
    return null
}

export class WebFileDataStoreState extends BaseComponentState<ExternalProperties, StateProperties>
    implements DataStore, ComponentState<WebFileDataStoreState> {

    constructor(props: ExternalProperties) {
        super(props)
    }

    private get dataStore() {
        if (!this.state.dataStore) {
            this.state.dataStore = new WebFileDataStoreImpl({url: this.props.url})
        }

        return this.state.dataStore!
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

WebFileDataStore.State = WebFileDataStoreState
WebFileDataStore.Schema = WebFileDataStoreSchema
WebFileDataStore.Metadata = WebFileDataStoreMetadata

