import Observable from 'zen-observable'
import {isPlainObject} from 'lodash';

const pendingFlag = Symbol('pending')
export type SimpleCriteria = object
export type Operator = '=' | '==' | '>' | '>=' | '<' | '<=' | '!='
export type CriteriaCondition = [fieldName: string, operator: Operator, value: any]
export type ComplexCriteria = CriteriaCondition[]
export type Criteria = SimpleCriteria | ComplexCriteria

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
    readonly isError = true
    constructor(public description: string, public errorMessage: string) {}
    toString() {
        return `Error: ${(this.description)} - ${this.errorMessage}`
    }
    valueOf() { return null }
}

const isSimpleCriteria = (criteria: Criteria) => isPlainObject((criteria))

export function queryMatcher(criteria: Criteria) {
    const complexCriteria: ComplexCriteria = isSimpleCriteria(criteria) ? Object.entries(criteria).map(([name, value]) => [name, '=', value]) :  criteria as ComplexCriteria
    return (obj: DataStoreObject): boolean => {
        const conditionFn = (crit: CriteriaCondition) => (obj: DataStoreObject): boolean => {
            const  [fieldName, operator, value] = crit
            const fieldValue = obj[fieldName as keyof object]
            switch(operator) {
                case '=':
                case '==' : return fieldValue === value
                case '>': return fieldValue > value
                case '>=': return fieldValue >= value
                case '<': return fieldValue < value
                case '<=': return fieldValue <= value
                case '!=': return fieldValue != value
                default: return false
            }
        }
        const conditionFns = complexCriteria.map( conditionFn )
        return conditionFns.every( fn => fn(obj))
    }
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

export const AuthStatusValues = ['readwrite', 'readonly'] as const
export type AuthStatus = typeof AuthStatusValues[number] | null
