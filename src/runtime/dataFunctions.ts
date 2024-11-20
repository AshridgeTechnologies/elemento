import {Value, valueOf, valuesOf} from './runtimeFunctions'
import {Criteria, Id} from './DataStore'
import {customAlphabet} from 'nanoid'

const idSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4)

const dataFunctions = {
    Update(component: { Update: (idOrChanges: object | Value<Id>, changes?: object) => void }, idOrChanges: object | Value<Id>, changes?: object) {
        if (changes !== undefined) {
            const id = valueOf(idOrChanges) as Id
            return component.Update(id, changes)

        } else {
            component.Update(idOrChanges as object)
        }
    },

    Add(component: { Add: (item: object) => void }, item: any) {
        return component.Add(valueOf(item))
    },

    AddAll(component: { AddAll: (items: object[]) => void }, items: any[]) {
        return component.AddAll(valuesOf(...items))
    },

    Remove(component: { Remove: (id: Id) => void }, id: Value<Id>) {
        return component.Remove(valueOf(id))
    },

    Get(component: { Get: (id: Id) => any }, id: Value<Id>) {
        return component.Get(valueOf(id))
    },

    GetIfExists(component: { Get: (id: Id) => any }, id: Value<Id | null | undefined>, defaultValue: any = null) {
        try {
            const idVal = valueOf(id)
            return (idVal === null || idVal === undefined) ? defaultValue : component.Get(idVal)
        } catch (e) {
            return defaultValue
        }
    },

    Query(component: { Query: (criteria: Criteria) => any[] }, criteria: Value<Criteria>) {
        return component.Query(valueOf(criteria))
    },

    GetRandomId: () => Date.now() + '-' + idSuffix()

}

export default dataFunctions
