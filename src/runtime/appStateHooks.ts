import {useContext, useEffect, useState} from 'react'
import {StoredState} from './AppStateStore'
import {StoreContext} from '../runner/StoreContext'

export type GetObjectFn = <T extends StoredState>(path: string) => T

const NOT_FOUND = {NOT_FOUND: true}
export const useObject = <T extends StoredState>(path: string): T => {
    const store = useContext(StoreContext)
    const [, setItem] = useState<any>(NOT_FOUND)
    useEffect(() => store.subscribe(path, () => setItem(store.get(path))), [])
    return store.get(path) as T
}

export const setObject = <T extends StoredState>(path: string, initialState: T): T => {
    const store = useContext(StoreContext)
    store.updateIfChanged(path, initialState)
    return useObject(path)
}

export const useGetObjectFunction = (): GetObjectFn => {
    const store = useContext(StoreContext)
    return <T extends StoredState>(path: string): T => store.get(path) as T
}
