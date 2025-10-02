import SubscribableStore, {type AllChangesCallback, type Callback, type Id, type UnsubscribeFn} from './SubscribableStore'

type Props = { [p: string]: any }

export type StoredState = any

const placeholder = function() {}

export default class AppStateStore {

    constructor(private store: SubscribableStore = new SubscribableStore()) {}

    getRaw(id: string): StoredState {
        return this.store.get(id)
    }

    get(id: string): StoredState {
        const state = this.getRaw(id)
        return state && this.itemProxy(id, state)
    }

    getOrCreate(id: string, stateClass: any, stateProps: any) {
        const existingState = this.getRaw(id)
        let targetState = existingState
        if (existingState === null || existingState === undefined) {
            const initialState = new stateClass(stateProps)
            targetState = initialState
            this.setDeferNotifications(id, initialState)
        } else if (!existingState._matchesProps(stateProps)) {
            const updatedState = (existingState as any).withProps(stateProps)
            targetState = updatedState
            this.setDeferNotifications(id, updatedState)
        }

        return this.itemProxy(id, targetState)
    }

    subscribe(id: string, callback: Callback): UnsubscribeFn {
        return this.store.subscribe(id, callback)
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

    private itemProxy(path: string, targetState: any) {
        const store = this
        const handler = {
            get(target: Props, property: string) {
                if (property === 'id') {
                    return (subId: Id) => `${path}.${subId}`
                }

                if (property in target) {
                    return target[property]
                }

                if (property === 'updateState') {
                    const latestState = store.getRaw(path)
                    return (changes: any) => {
                        store.setDeferNotifications(path, (latestState as any).withState(changes))
                    }
                }

                const childState = store.get(path + '.' + property)
                return childState ?? placeholder
            }
        }

        return new Proxy(targetState, handler)
    }

}
