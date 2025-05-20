import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object'
import {createMergeableStore, Id, IdAddedOrRemoved} from 'tinybase'
import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage'
import {CollectionName, Id as DataStoreId} from '../runtime/DataStore'
import {mapValues} from 'radash'
import {convertFromDbData} from '../shared/convertData'

export class TinyBaseDurableObject extends WsServerDurableObject {

    private store = createMergeableStore()

    onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved ? 'Added' : 'Removed') + ` path ${pathId}`)
    }

    onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved ? 'Added' : 'Removed') + ` client ${clientId} on path ${pathId}`)
    }

    createPersister() {
        return createDurableObjectStoragePersister(this.store, this.ctx.storage)
    }

    getJsonData(collectionName: CollectionName, id: DataStoreId): string | null {
        return this.store.getCell(collectionName, id.toString(), 'json_data') as string ?? null
    }

    getAllJsonData(collectionName: CollectionName): string[] {
        return Object.values(this.store.getTable(collectionName)).map( row => row.json_data as string)
    }

    setJsonData(collectionName: CollectionName, id: DataStoreId, data: string): void {
        this.store.setCell(collectionName, id.toString(), 'json_data', data)
    }

    removeJsonData(collectionName: CollectionName, id: DataStoreId) {
        this.store.delRow(collectionName, id.toString())
    }

    test_clear(collectionName: CollectionName) {
        this.store.delTable(collectionName)
    }
}
