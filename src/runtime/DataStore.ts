import Observable from 'zen-observable'
import lodash from 'lodash'; const {matches} = lodash

const pendingFlag = Symbol('pending')
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
export const pending = (p: Promise<any>) => {
    (p as any).valueOf = () => null;
    (p as any)[pendingFlag] = true;
    return p
}
export const isPending = (val: any) => Boolean(val?.[pendingFlag])
export class ErrorResult {
    constructor(public description: string, public errorMessage: string) {}
    toString() {
        return `Error: ${(this.description)} - ${this.errorMessage}`
    }
}

export function queryMatcher(criteria: Criteria) {
    return matches(criteria)
}

export interface BasicDataStore {
    getById(collection: CollectionName, id: Id, nullIfNotFound: boolean): Promise<DataStoreObject | null>
    query(collection: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>>

    add(collection: CollectionName, id: Id, item: DataStoreObject): Promise<void>
    addAll(collection: CollectionName, items: {[id: Id]: DataStoreObject}): Promise<void>
    update(collection: CollectionName, id: Id, changes: object): Promise<void>
    remove(collection: CollectionName, id: Id): Promise<void>
}

export default interface DataStore extends BasicDataStore {
    observable(collection: CollectionName): Observable<UpdateNotification>
}
