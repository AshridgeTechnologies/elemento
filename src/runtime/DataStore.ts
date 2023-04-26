import Observable from 'zen-observable'
import lodash from 'lodash'; const {matches} = lodash;

export type Criteria = object

export type CollectionName = string
export type DataStoreObject = object
export type Id = string | number

export const InvalidateAll = 'InvalidateAll'
export const Add = 'Add'
export const Update = 'Update'
export const Remove = 'Remove'
export const MultipleChanges = 'MultipleChanges'
export type UpdateType = typeof InvalidateAll | typeof MultipleChanges | typeof Add | typeof Update | typeof Remove
export type UpdateNotification = {
    collection: CollectionName,
    type: UpdateType,
    id?: Id
    changes?: object
}
export class Pending {
    valueOf() { return null }
}

export class ErrorResult {
    constructor(public description: string, public errorMessage: string) {}
}

export function queryMatcher(criteria: Criteria) {
    return matches(criteria)
}

export interface BasicDataStore {
    getById(collection: CollectionName, id: Id): Promise<DataStoreObject | null>
    query(collection: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>>

    add(collection: CollectionName, id: Id, item: DataStoreObject): Promise<void>
    addAll(collection: CollectionName, items: {[id: Id]: DataStoreObject}): Promise<void>
    update(collection: CollectionName, id: Id, changes: object): Promise<void>
    remove(collection: CollectionName, id: Id): Promise<void>
}

export default interface DataStore extends BasicDataStore {
    observable(collection: CollectionName): Observable<UpdateNotification>
}