import {countBy, pickBy, without} from 'ramda'

export type Id = string
export type Callback = () => void
export type AllChangesCallback = (ids: Id[]) => void
export type UnsubscribeFn = () => void

const ALL_IDS = '*'

type Update = { id: Id, time: number }

export type Options = {updateWindow: number, updateLimit: number}
export const defaultOptions: Options = {updateWindow: 1000, updateLimit: 100}

export default class SubscribableStore {

    private items = new Map<Id, any>()
    private listeners = new Map<Id, (Callback | AllChangesCallback)[]>
    private notifyDeferred = false
    private updatedItemIds = new Set<Id>()
    private recentUpdates = new Array<Update>()
    private options: Options

    constructor(options: Partial<Options> = {}) {
        this.options = {...defaultOptions, ...options}
    }

    get(id: Id): any {
        return this.items.get(id)
    }

    set(id: Id, item: any) {
        this.checkUpdateLimits(id)
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

    private checkUpdateLimits(id: string) {
        const now = Date.now()
        const cutoffTime = now - this.options.updateWindow
        this.recentUpdates = this.recentUpdates.filter(upd => upd.time > cutoffTime).concat({id, time: now})
        if (this.recentUpdates.length > this.options.updateLimit) {
            const idCounts = countBy(({id}) => id, this.recentUpdates)
            const suspectCounts = pickBy((count: number) => count > 5, idCounts) as object
            const suspectIds = Object.keys(suspectCounts)
            throw new Error('Too many updates to ids: ' + suspectIds.join(', '))
        }
    }
}
