import DataStore, {CollectionName, Criteria, DataStoreObject, ErrorResult, Id} from '../../shared/DataStore'
import appFunctions from '../appFunctions'
import {BaseComponentState, ComponentState} from './ComponentState'

type StateProperties = {dataStore?: DataStore}

const {NotifyError} = appFunctions

export abstract class DataStoreState<PropsType extends object> extends BaseComponentState<PropsType, StateProperties>
    implements DataStore, ComponentState<DataStoreState<PropsType>> {

    constructor(props: PropsType) {
        super(props)
    }

    protected get dataStore() {
        return this.state.dataStore ??= this.createDataStore()
    }

    protected abstract createDataStore(): DataStore

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


