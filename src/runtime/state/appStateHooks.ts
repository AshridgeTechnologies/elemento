import {useContext, useEffect, useRef, useState} from 'react'
import {StoreContext} from './StoreContext'
import type {Id} from './SubscribableStore'
import {StoredStateWithProps} from './BaseComponentState'

export const useComponentState = <T extends StoredStateWithProps<P>, P extends object>(path: string, stateClass?: new (props: P) => T, stateProps?: P): T => {
    const store = useContext(StoreContext)
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
    return stateClass && stateProps ? store.getOrUpdate(path, stateClass, {...stateProps}) : store.get(path) as T
}

