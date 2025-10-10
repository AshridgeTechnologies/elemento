import {useContext, useEffect, useRef, useState} from 'react'
import {StoreContext} from './StoreContext'
import type {Id} from './SubscribableStore'
import AppStateStore, {StoredState} from './AppStateStore'
import {ComponentState} from '../components/ComponentState2'

export type GetObjectFn = <T extends StoredState>(path: string) => T

const defaultStore = new AppStateStore()



export const use$state = <T extends ComponentState<any>>(path: string, stateClass?: new (...args: any[]) => T, stateProps: any = {}): T => {
    const store = useContext(StoreContext) ?? defaultStore
    const [, setRenderCount] = useState<any>(0)
    const subscribe = () => {
        return store.subscribeAll((ids: Id[]) => {
            if (ids.some(id => id.startsWith(path))) {
                setRenderCount((c: number) => c + 1)
            }
        })
    }

    const subscribeRef = useRef<any>(null)
    const unsubscribe = () => {
        subscribeRef.current?.()
        subscribeRef.current = null
    }

    // return unsubscribe function to be called on unmount
    useEffect(() => unsubscribe, [])

    if (subscribeRef.current === null) {
        subscribeRef.current = subscribe()
    }
    return stateClass ? store.getOrCreate(path, stateClass, {path, ...stateProps}) : store.get(path) as T
}

export const useGetObjectFunction = (): GetObjectFn => {
    const store = useContext(StoreContext)
    return <T extends StoredState>(path: string): T => store.get(path) as T
}
