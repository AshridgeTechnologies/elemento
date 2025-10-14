import SubscribableStore, {type AllChangesCallback, type UnsubscribeFn} from './SubscribableStore'
import {AppStateForObject} from '../components/ComponentState'

export type StoredState = any

const placeholder = function() {const placeholder = 0}
placeholder.valueOf = () => undefined
placeholder._isPlaceholder = true

class ObjectStateInterface implements AppStateForObject {
    constructor(public path: string, private _store: AppStateStore) {}

    getChildState(subPath: string): StoredState {
        return this._store.get(this.path + '.' + subPath)
    }

    latest(): StoredState {
        return this._store.get(this.path)
    }

    updateVersion(newVersion: StoredState): void {
        this._store.updateVersion(this.path, newVersion, this.latest())
    }

}

export type MaybeInitable = { init?: (asi: AppStateForObject, previousVersion?: any) => any }

export default class AppStateStore {

    constructor(private store: SubscribableStore = new SubscribableStore()) {}

    get(id: string): StoredState {
        const state = this.getRaw(id)
        return state ?? placeholder
    }

    getOrCreate<T extends MaybeInitable>(id: string, stateClass: new(...args: any[]) => T, stateProps: any): T {
        const existingState = this.getRaw(id)
        let targetState = existingState

        if (existingState === null || existingState === undefined) {
            const newState = new stateClass(stateProps)
            const initialState = newState.init?.(new ObjectStateInterface(id, this)) ?? newState
            targetState = initialState
            this.setDeferNotifications(id, initialState)
        } else {
            const newState = (existingState as any).withProps(stateProps)
            if (newState !== existingState) {
                const updatedState = newState.init?.(new ObjectStateInterface(id, this), existingState) ?? newState
                targetState = updatedState
                this.setDeferNotifications(id, updatedState)
            }
        }

        return targetState
    }

    subscribeAll(callback: AllChangesCallback): UnsubscribeFn {
        return this.store.subscribeAll(callback)
    }

    updateVersion<T extends MaybeInitable>(id: string, newVersion: T, previousVersion: T | null) {
        const initialisedItem = newVersion.init?.(new ObjectStateInterface(id, this), previousVersion) ?? newVersion

        this.setDeferNotifications(id, initialisedItem)
    }

    setDeferNotifications<T extends StoredState>(id: string, item: T) {
        if (!this.store.isNotifyDeferred) {
            this.store.deferNotifications()
            setTimeout(() => this.store.sendNotifications(), 0)
        }
        this.store.set(id, item)
    }

    getRaw(id: string): StoredState {
        return this.store.get(id)
    }
}
