import {MergeableStore} from 'tinybase'
import {CollectionName, Id as DataStoreId} from '../shared/DataStore'

export interface TinyBaseDurableObject extends Rpc.DurableObjectBranded {
    getJsonData(collectionName: CollectionName, id: DataStoreId): string | null

    getAllJsonData(collectionName: CollectionName): string[]

    setJsonData(collectionName: CollectionName, id: DataStoreId, data: string): void

    removeJsonData(collectionName: CollectionName, id: DataStoreId): void

    test_clear(collectionName: CollectionName): void
}

export class TinyBaseDurableObjectImpl  {

    constructor(private store: MergeableStore) {}

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
