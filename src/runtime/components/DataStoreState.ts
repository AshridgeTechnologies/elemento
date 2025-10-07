import DataStore, {CollectionName, Criteria, DataStoreObject, ErrorResult, Id} from '../../shared/DataStore'
import appFunctions from '../appFunctions'
import {AppStateForObject, BaseComponentState, ComponentState} from './ComponentState2'

type StateProperties = {dataStore?: DataStore, initialisedDataStore?: Promise<DataStore>}

const {NotifyError} = appFunctions

export abstract class DataStoreState<PropsType extends object> extends BaseComponentState<PropsType, StateProperties>
    implements DataStore, ComponentState<DataStoreState<PropsType>> {

    constructor(props: PropsType) {
        super(props)
    }

    init(asi: AppStateForObject) {
        super.init(asi)
        const dataStoreClosed = this.closeDataStore()
        this.state.dataStore = this.createDataStore()
        this.state.initialisedDataStore = dataStoreClosed.then( () => this.initDataStore() )
    }

    protected get initialisedDataStore() {
        return this.state.initialisedDataStore
    }

    protected abstract createDataStore(): DataStore
    protected abstract initDataStore(): Promise<DataStore>
    protected abstract closeDataStore(): Promise<void>

    add(collection: CollectionName, id: Id, item: DataStoreObject) {
        return this.initialisedDataStore!.then(ds => ds.add(collection, id, item)).catch(e => NotifyError('Could not add item to data store', e) )
    }

    addAll(collection: CollectionName, items: { [p: Id]: DataStoreObject }) {
        return this.initialisedDataStore!.then(ds => ds.addAll(collection, items)).catch(e => NotifyError('Could not add items to data store', e) )
    }

    update(collection: CollectionName, id: Id, changes: object) {
        return this.initialisedDataStore!.then(ds => ds.update(collection, id, changes)).catch(e => NotifyError('Could not update item in data store', e) )
    }

    remove(collection: CollectionName, id: Id) {
        return this.initialisedDataStore!.then(ds => ds.remove(collection, id)).catch(e => NotifyError('Could not remove item from data store', e) )
    }

    getById(collection: CollectionName, id: Id, nullIfNotFound: boolean) {
        return this.initialisedDataStore!.then(ds => ds.getById(collection, id, nullIfNotFound)).catch(e => {
            NotifyError('Could not get item from data store', e)
            return new ErrorResult('Could not get item from data store', e.message)
        })
    }

    query(collection: CollectionName, criteria: Criteria) {
        return this.initialisedDataStore!.then(ds => ds.query(collection, criteria)).catch(e => {
            NotifyError('Could not query items in data store', e)
            return []
        })
    }

    observable(collection: CollectionName) {
        return this.state.dataStore!.observable(collection)
    }
}


