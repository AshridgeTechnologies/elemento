import IdbDataStoreImpl from './IdbDataStoreImpl'
import DataStore, {CollectionName, Criteria, DataStoreObject, ErrorResult, Id} from '../DataStore'
import appFunctions from '../appFunctions'
import {BaseComponentState, ComponentState} from './ComponentState'

type Properties = {path: string}
type ExternalProperties = {databaseName: string, collectionNames: string[]}
type StateProperties = {dataStore?: IdbDataStoreImpl}

const {NotifyError} = appFunctions

export default function BrowserDataStore({path}: Properties) {
    return null
}

export class BrowserDataStoreState extends BaseComponentState<ExternalProperties, StateProperties>
    implements DataStore, ComponentState<BrowserDataStoreState> {

    constructor(props: ExternalProperties = {databaseName: 'AppDatabase', collectionNames: []}) {
        super(props)
    }

    private get dataStore() {
        if (!this.state.dataStore) {
            this.state.dataStore = new IdbDataStoreImpl(this.props)
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

BrowserDataStore.State = BrowserDataStoreState

