import SubscribableStore, {type AllChangesCallback, type UnsubscribeFn} from './SubscribableStore'

export type SetupComponentStateFn = <T extends object>(path: string, state: T, asi: AppStateForObject<T>, previousVersion?: T) => T | undefined
export type WithUpdatedPropsFn = <T extends object, P extends object>(state: T, props: P) => T
export type PlaceholderFn = (path: string) => any

export interface AppStateForObject<T> {
    path: string,
    latest: () => T
    update: (newVersion: T) => void,
    getChildState: (subPath: string) => any
}

class ObjectStateInterface<T> implements AppStateForObject<T> {
    constructor(public path: string, private _store: AppStateStore) {}

    getChildState(subPath: string): any {
        return this._store.get(this.path + '.' + subPath)
    }

    latest(): T {
        return this._store.getPlain(this.path)
    }

    update(newVersion: T): void {
        this._store.update(this.path, newVersion)
    }
}

const defaultSetupComponentState: SetupComponentStateFn = () => undefined
const defaultWithUpdatedProps: WithUpdatedPropsFn = <T extends object, P>(state: T, props: P) => Object.assign(state, props)
const defaultPlaceholder: PlaceholderFn = () => null

export default class AppStateStore {

    constructor(private store: SubscribableStore = new SubscribableStore(),
        private setupComponentStateFn: SetupComponentStateFn = defaultSetupComponentState,
        private withUpdatedPropsFn: WithUpdatedPropsFn = defaultWithUpdatedProps,
        private placeholderFn: PlaceholderFn = defaultPlaceholder) {}

    getPlain<T>(id: string): T {
        return this.store.get(id) as T
    }

    get<T>(id: string): T {
        const state = this.getPlain(id) as T
        return state ?? this.placeholderFn(id) as T
    }

    getOrUpdate<T extends object, P extends object>(id: string, stateClass: new(props: P) => T, stateProps: P): T {
        const existingState = this.store.get(id)

        if (existingState === null || existingState === undefined  || !(existingState instanceof stateClass)) {
            const newState = new stateClass(stateProps)
            return this.initAndSetNewState(newState, id)
        } else {
            const newState = this.withUpdatedPropsFn<T, P>(existingState, stateProps) as T
            if (newState !== existingState) {
                return this.initAndSetNewState(newState, id, existingState)
            }
        }

        return existingState as T
    }

    update<T>(id: string, newVersion: T) {
        const previousVersion = this.getPlain(id)
        this.initAndSetNewState(newVersion, id, previousVersion)
    }

    subscribeAll(callback: AllChangesCallback): UnsubscribeFn {
        return this.store.subscribeAll(callback)
    }

    setDeferNotifications<T>(id: string, item: T) {
        if (!this.store.isNotifyDeferred) {
            this.store.deferNotifications()
            setTimeout(() => this.store.sendNotifications(), 0)
        }
        this.store.set(id, item)
    }

    private initAndSetNewState(newState: any, id: string, existingState?: any) {
        const updatedState = this.setupComponentStateFn(id, newState, new ObjectStateInterface(id, this), existingState) ?? newState
        this.setDeferNotifications(id, updatedState)
        return updatedState
    }
}
