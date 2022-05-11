import {toEntry} from './components/Collection'
import {_DELETE} from './DataStore'
import {omit} from 'ramda'
import {Value, valueOf} from './runtimeFunctions'

type Id = string | number
const appFunctions = (state: {_updateApp: (changes: object) => void }) => {
    const {_updateApp} = state
    return ({
        ShowPage(pageName: string) {
            _updateApp( {_data: {currentPage: pageName}})
        },

        Reset(component: {Reset: () => void}) {
            component.Reset()
        },

        Set(component: {Set: (value: any) => void}, value: any) {
            component.Set(valueOf(value))
        },

        Update(component: {_update: (changes: object) => void}, idOrChanges: object | Value<Id>, changes?: object) {
            const updates = changes !== undefined
                ? { [valueOf(idOrChanges) as Id]: omit(['id', 'Id'], changes) }
                : idOrChanges as object
            component._update({value: updates})
        },

        Add(component: {_update: (changes: object) => void}, item: any) {
            const [id, value] = toEntry(valueOf(item))
            const changes = { [id]: value }
            component._update({value: changes})
        },

        Remove(component: {_update: (changes: object) => void}, id: Value<Id>) {
            const changes = { [valueOf(id)]: _DELETE }
            component._update({value: changes})
        },

        Get(component: {value: object}, id: Value<Id>) {
            return component.value[valueOf(id) as keyof object]
        },

        GetAll(component: {value: object}) {
            return Object.values(component.value)
        },

    })
}

export default appFunctions