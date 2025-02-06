import SubscribableStore, {Callback, Id, UnsubscribeFn} from './SubscribableStore'
import {ComponentState} from './components/ComponentState'
import {unique} from 'radash'

export type StoredState = ComponentState<any>

export default class AppStateStore {

    constructor(private store: SubscribableStore = new SubscribableStore()) {
        this.subscribeToAllChanges()
    }

    get(id: string): StoredState {
        return this.store.get(id)
    }

    set<T extends StoredState>(id: string, item: T) {
        item.init(this.appStoreInterface(id), id)
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

    private subscribeToAllChanges() {
        this.store.subscribeAll( (ids: string[]) => this.updateParentItems(ids))
    }

    private updateParentItems(ids: Id[]) {
        const extractParent = (id: Id) => id.replace(/\.\w+$/, '')
        const parentIds = unique(ids.map(extractParent))
        parentIds.forEach( id => this.get(id)?.onChildStateChange() )
    }

    private setDeferNotifications<T extends StoredState>(id: string, item: T) {
        if (!this.store.isNotifyDeferred) {
            this.store.deferNotifications()
            setTimeout(() => this.store.sendNotifications(), 0)
        }
        this.set(id, item)
    }

    private appStoreInterface(id: string) {
        const store = this
        return {
            latest() {
                return store.get(id)
            },
            updateVersion(changes: object) {
                const updatedItem = store.get(id).withMergedState(changes)
                store.set(id, updatedItem)
            },
            getChildState(subPath: string) {
                return store.get(id + '.' + subPath)
            },
            getOrCreateChildState(subPath: string, item: StoredState) {
                store.updateIfChanged(id + '.' + subPath, item)
                return this.getChildState(subPath)
            },
            getApp() {
                const appId = id.split('.')[0]
                return store.get(appId)
            }
        }
    }
}
