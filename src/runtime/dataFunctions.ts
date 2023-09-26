import {Value, valueOf, valuesOf} from './runtimeFunctions'
import {Id} from './DataStore'

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

    GetAll(component: { GetAll: () => any[] }) {
        return component.GetAll()
    }
}

export default dataFunctions
