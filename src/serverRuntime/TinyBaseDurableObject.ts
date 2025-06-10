import {createMergeableStore, Id, IdAddedOrRemoved, MergeableStore} from 'tinybase'
import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage'
import {CollectionName, Id as DataStoreId} from '../shared/DataStore'
import {PerClientWsServerDurableObject} from './PerClientWsServerDurableObject'
import {User} from '../shared/subjects'
import {jwtDecode} from 'jwt-decode'
import {verifyToken} from './requestHandler'

const getClientId = (request: Request): Id | null =>
    request.headers.get('upgrade')?.toLowerCase() == 'websocket'
        ? request.headers.get('sec-websocket-key')
        : null;


export interface TinyBaseDurableObject {
    getJsonData(collectionName: CollectionName, id: DataStoreId): string | null

    getAllJsonData(collectionName: CollectionName): string[]

    setJsonData(collectionName: CollectionName, id: DataStoreId, data: string): void

    removeJsonData(collectionName: CollectionName, id: DataStoreId): void

    test_clear(collectionName: CollectionName): void
}

export class TinyBaseDurableObjectImpl implements TinyBaseDurableObject  {

    constructor(private store: MergeableStore, private storage: DurableObjectStorage) {}

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
