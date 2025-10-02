import SubscribableStore, {type AllChangesCallback, type Callback, type Id, type UnsubscribeFn} from './SubscribableStore'
// import {unique} from 'radash'

type Props = { [p: string]: any }

export type StoredState = any

const placeholder = function() {}

const shallowClone = (latestState: object) => Object.create(
    Object.getPrototypeOf(latestState),
    Object.getOwnPropertyDescriptors(latestState)
)

const shallowCloneWithUpdates = (state: object, changes: object) => {
    return Object.assign(shallowClone(state), changes)
}

const updateState = (state: object, stateChanges: object) => {
    if (typeof (state as any).withState === 'function') {
        return (state as any).withState(stateChanges)
    }
    return shallowCloneWithUpdates(state, stateChanges)
}

const matches = (base: object, latest: object): boolean => {
    return Object.keys(latest).every((key) => base[key as keyof object] === latest[key as keyof object])
}

const updateProps = (state: object, propChanges: object) => {
    if (typeof (state as any).withProps === 'function') {
        return (state as any).withProps(propChanges)
    }
    return shallowCloneWithUpdates(state, propChanges)
}

function storeItemProxy(path: string, store: AppStateStore, targetState: any) {
    const handler = {
        get(target: Props, property: string) {
            if (property === 'id') {
                return (subId: Id) => `${path}.${subId}`
            }

            if (property === 'set') {
                return (item: any) => store.setDeferNotifications(path, item)
            }

            if (property === 'updateState') {
                const latestState = store.getRaw(path)
                return (changes: any) => {
                    store.setDeferNotifications(path, updateState(latestState, changes))
                }
            }

            if (property in target) {
                return target[property]
            }

            const childState = store.get(path + '.' + property)
            return childState ?? placeholder
        }
    }

    return new Proxy(targetState, handler)
}


export default class AppStateStore {

    constructor(private store: SubscribableStore = new SubscribableStore()) {
        this.subscribeToAllChanges()
    }

    getRaw(id: string): StoredState {
        return this.store.get(id)
    }
    get(id: string): StoredState {
        const state = this.store.get(id)
        return state && storeItemProxy(id, this, state)
    }

    getOrCreate(id: string, stateClass: any, stateProps: any) {
        const existingState = this.store.get(id)
        let targetState = existingState
        if (existingState === null || existingState === undefined) {
            const initialState = new stateClass(stateProps)
            targetState = initialState
            this.setDeferNotifications(id, initialState)
        } else if (!existingState._matchesProps(stateProps)) {
            const updatedState = updateProps(existingState, stateProps)
            targetState
            this.setDeferNotifications(id, updatedState)
        }

        return storeItemProxy(id, this, targetState)
    }

    set<T extends StoredState>(id: string, item: T) {
        // item.init(this.appStoreInterface(id), id)
        this.store.set(id, item)
    }

    updateIfChanged<T extends StoredState>(id: string, item: T) {
        const existingItem = this.get(id)
        const latestItem = existingItem ? existingItem.updateFrom(item) : item
        if (latestItem !== existingItem) {
            this.setDeferNotifications(id, latestItem)
        }
    }

    subscribe(id: string, callback: Callback): UnsubscribeFn {
        return this.store.subscribe(id, callback)
    }

    subscribeAll(callback: AllChangesCallback): UnsubscribeFn {
        return this.store.subscribeAll(callback)
    }

    private subscribeToAllChanges() {
        this.store.subscribeAll( (ids: string[]) => this.updateParentItems(ids))
    }

    private updateParentItems(_ids: Id[]) {
        // const extractParent = (id: Id) => id.replace(/\.\w+$/, '')
        // const parentIds = unique(ids.map(extractParent))
        // parentIds.forEach( id => this.get(id)?.onChildStateChange() )
    }

    setDeferNotifications<T extends StoredState>(id: string, item: T) {
        if (!this.store.isNotifyDeferred) {
            this.store.deferNotifications()
            setTimeout(() => this.store.sendNotifications(), 0)
        }
        this.set(id, item)
    }

    // private appStoreInterface(id: string) {
    //     const store = this
    //     return {
    //         latest() {
    //             return store.get(id)
    //         },
    //         updateVersion(changes: object) {
    //             const updatedItem = store.get(id).withMergedState(changes)
    //             store.set(id, updatedItem)
    //         },
    //         getChildState(subPath: string) {
    //             return store.get(id + '.' + subPath)
    //         },
    //         getOrCreateChildState(subPath: string, item: StoredState) {
    //             store.updateIfChanged(id + '.' + subPath, item)
    //             return this.getChildState(subPath)
    //         },
    //         getApp() {
    //             const appId = id.split('.')[0]
    //             return store.get(appId)
    //         }
    //     }
    // }
}
