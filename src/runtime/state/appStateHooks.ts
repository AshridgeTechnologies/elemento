import {useContext, useEffect, useRef, useState} from 'react'
import {StoreContext} from './StoreContext'
import type {Id} from './SubscribableStore'
import AppStateStore from './AppStateStore'


const defaultStore = new AppStateStore()



export const use$state = (path: string, stateClass: any, stateProps: any = {}) => {
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

    // unsubscribe on unmount
    useEffect(() => unsubscribe, [])

    if (subscribeRef.current === null) {
        subscribeRef.current = subscribe()
    }
    return store.getOrCreate(path, stateClass, {path, ...stateProps})
}
