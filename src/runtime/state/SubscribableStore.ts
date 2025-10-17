import {without} from 'ramda'

export type Id = string
export type Callback = () => void
export type AllChangesCallback = (ids: Id[]) => void
export type UnsubscribeFn = () => void

const ALL_IDS = '*'

export default class SubscribableStore {

    private items = new Map<Id, any>()
    private listeners = new Map<Id, (Callback | AllChangesCallback)[]>
    private notifyDeferred = false
    private updatedItemIds = new Set<Id>()

    get(id: Id): any {
        return this.items.get(id)
    }

    set(id: Id, item: any) {
        this.items.set(id, item)
        if (this.isNotifyDeferred) {
            this.updatedItemIds.add(id)
        } else {
            this.notifyListeners(id)
            this.notifyListenersToAll([id])
        }
    }

    subscribe(id: Id, callback: Callback | AllChangesCallback): UnsubscribeFn {
        const existingListeners = this.listenersFor(id)
        this.listeners.set(id, [...existingListeners, callback])
        return () => {
            const existingListeners = this.listenersFor(id)
            this.listeners.set(id, without([callback], existingListeners))
        }
    }

    subscribeAll(callback: AllChangesCallback): UnsubscribeFn {
        return this.subscribe(ALL_IDS, callback)
    }

    get isNotifyDeferred() { return this.notifyDeferred }

    deferNotifications() {
        this.notifyDeferred = true
    }

    sendNotifications() {
        const updatedIds = Array.from(this.updatedItemIds.values())
        this.notifyDeferred = false
        this.updatedItemIds.clear()
        updatedIds.forEach( id => this.notifyListeners(id))
        this.notifyListenersToAll(updatedIds)
    }

    private notifyListeners(id: string) {
        this.listenersFor(id).forEach(l => (l as Callback)())
    }

    private notifyListenersToAll(ids: string[]) {
        this.listenersFor(ALL_IDS).forEach(l => l(ids))
    }

    private listenersFor(id: string) {
        return this.listeners.get(id) ?? []
    }
}
