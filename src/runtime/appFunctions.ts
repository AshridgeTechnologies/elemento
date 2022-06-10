import {Value, valueOf} from './runtimeFunctions'
import DataStore, {Id} from './DataStore'
import MemoryDataStore from './components/MemoryDataStore'
import {useObjectStateWithDefaults} from './appData'

let defaultDataStoreInstance: DataStore | null = null

export function defaultDataStore(): DataStore {
    if (!defaultDataStoreInstance) {
        defaultDataStoreInstance = new MemoryDataStore()
    }

    return defaultDataStoreInstance
}

const appFunctions = (init: boolean = true) => {
    const appData = init && useObjectStateWithDefaults('app._data')
    return ({
        ShowPage(page: string | Function) {
            const pageName = typeof page === 'function' ? page.name : valueOf(page)
            appData._update( {currentPage: pageName})
        },

        Reset(...components: {Reset: () => void}[]) {
            components.forEach(comp => comp.Reset())
        },

        Set(component: {Set: (value: any) => void}, value: any) {
            component.Set(valueOf(value))
        },

        Update(component: {Update: (idOrChanges: object | Value<Id>, changes?: object) => void}, idOrChanges: object | Value<Id>, changes?: object) {
            if (changes !== undefined) {
                const id = valueOf(idOrChanges) as Id
                component.Update(id, changes)

            } else {
                component.Update(idOrChanges as object)
            }
        },

        Add(component: {Add: (item: object) => void}, item: any) {
            component.Add(valueOf(item))
        },

        Remove(component: {Remove: (id: Id) => void}, id: Value<Id>) {
            component.Remove(valueOf(id))
        },

        Get(component: {Get: (id: Id) => any}, id: Value<Id>) {
            return component.Get(valueOf(id))
        },

        GetAll(component: {GetAll: () => any[]}) {
            return component.GetAll()
        },

        NotifyError(description: string, error: Error) {
            //temporary implementation
            console.error(description, error)
            alert(`${description}\n${error.message}`)
        }
    })
}

export const appFunctionsNames = () => {
    return Object.keys(appFunctions(false))
}

export default appFunctions