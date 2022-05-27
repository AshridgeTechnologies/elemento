import Observable from 'zen-observable'

export type Criteria = object

export type CollectionName = string
export type DataStoreObject = object
export type Id = string | number

export const InvalidateAll = 'InvalidateAll'
export const InvalidateAllQueries = 'InvalidateAllQueries'
export type UpdateNotification = {
    collection: CollectionName,
    type: 'Change' | typeof InvalidateAll | typeof InvalidateAllQueries,
    changes?: object
}
export class Pending {
}

export class ErrorResult {
    constructor(public description: string, public errorMessage: string) {}
}

export default interface DataStore {
    getById(collection: CollectionName, id: Id): Promise<DataStoreObject | void>
    query(collection: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>>

    add(collection: CollectionName, id: Id, item: DataStoreObject): Promise<void>
    update(collection: CollectionName, id: Id, changes: object): Promise<void>
    remove(collection: CollectionName, id: Id): Promise<void>

    observable(collection: CollectionName): Observable<UpdateNotification>
}