import SubscribableStore, {type AllChangesCallback, type UnsubscribeFn} from './SubscribableStore'

export interface StoredState {
    init?: (asi: AppStateForObject, previousVersion?: this) => this | undefined
}
export interface StoredStateWithProps<Props extends object> extends StoredState {
    withProps: (props: Props) => this
}

const placeholder = function() {let _placeholder = 0}
placeholder.valueOf = () => undefined
placeholder._isPlaceholder = true

export interface AppStateForObject {
    path: string,
    latest: () => StoredState
    updateVersion: (newVersion: StoredState) => void,
    getChildState: (subPath: string) => StoredState
}

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


export default class AppStateStore {

    constructor(private store: SubscribableStore = new SubscribableStore()) {}

    get<T extends StoredState>(id: string): T {
        const state = this.getRaw(id) as T
        return state ?? placeholder
    }

    getOrCreate<T extends StoredStateWithProps<P>, P extends object>(id: string, stateClass: new(props: P) => T, stateProps: P): T {
        const existingState = this.getRaw<T>(id)
        let targetState = existingState

        if (existingState === null || existingState === undefined) {
            const newState = new stateClass(stateProps)
            const initialState = newState.init?.(new ObjectStateInterface(id, this)) ?? newState
            targetState = initialState
            this.setDeferNotifications(id, initialState)
        } else {
            const newState: T = (existingState).withProps(stateProps)
            if (newState !== existingState) {
                const updatedState = newState.init?.(new ObjectStateInterface(id, this), existingState) ?? newState
                targetState = updatedState
                this.setDeferNotifications(id, updatedState)
            }
        }

        return targetState as T
    }

    subscribeAll(callback: AllChangesCallback): UnsubscribeFn {
        return this.store.subscribeAll(callback)
    }

    updateVersion<T extends StoredState>(id: string, newVersion: T, previousVersion: T | undefined) {
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

    getRaw<T extends StoredState>(id: string): T {
        return this.store.get(id)
    }
}
