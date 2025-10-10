import SubscribableStore, {type AllChangesCallback, type Callback, type UnsubscribeFn} from './SubscribableStore'
import {AppStateForObject} from '../components/ComponentState2'

type Props = { [p: string]: any }

export type StoredState = any

const placeholder = function() {const placeholder = 0}
placeholder.valueOf = () => undefined
placeholder._isPlaceholder = true

export type MaybeInitable = { init?: (asi: AppStateForObject) => void }
export default class AppStateStore {

    constructor(private store: SubscribableStore = new SubscribableStore()) {}

    get(id: string): StoredState {
        const state = this.getRaw(id)
        return this.itemProxy(id, state ?? placeholder)
    }

    getOrCreate<T extends MaybeInitable>(id: string, stateClass: new(...args: any[]) => T, stateProps: any): T {
        const existingState = this.getRaw(id)
        let targetState = existingState

        const initIfNeeded = (initialState: T) => {
            if (typeof initialState.init === 'function') {
                const store = this
                const asi: AppStateForObject = {
                    path: id,
                    latest() {
                        return store.get(id)
                    },
                    updateVersion(changes: object) {
                        const latestState = store.getRaw(id)
                        const updatedState = (latestState as any).withMergedState(changes)
                        store.setDeferNotifications(id, updatedState)
                    },
                    getChildState(subPath: string) {
                        return store.get(id + '.' + subPath)
                    }
                }
                initialState.init(asi)
            }
        }

        if (existingState === null || existingState === undefined) {
            const initialState = new stateClass(stateProps)
            initIfNeeded(initialState)
            targetState = initialState
            this.setDeferNotifications(id, initialState)
        } else if (!existingState._matchesProps(stateProps)) {
            const updatedState = (existingState as any).withProps(stateProps)
            initIfNeeded(updatedState)
            targetState = updatedState
            this.setDeferNotifications(id, updatedState)
        }

        return this.itemProxy(id, targetState)
    }

    subscribeAll(callback: AllChangesCallback): UnsubscribeFn {
        return this.store.subscribeAll(callback)
    }

    setDeferNotifications<T extends StoredState>(id: string, item: T) {
        if (!this.store.isNotifyDeferred) {
            this.store.deferNotifications()
            setTimeout(() => this.store.sendNotifications(), 0)
        }
        this.store.set(id, item)
    }

    private getRaw(id: string): StoredState {
        return this.store.get(id)
    }

    private itemProxy(path: string, targetState: any) {
        const store = this
        const handler = {
            get(target: Props, property: string | symbol) {
                if (property === Symbol.toPrimitive) {
                    return target.valueOf
                }

                if (typeof property === 'symbol') {
                    return undefined
                }

                if (property in target) {
                    return target[property]
                }

                return store.get(path + '.' + property)
            }
        }

        return new Proxy(targetState, handler)
    }
}
