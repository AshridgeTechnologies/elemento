import AppStateStore, {type AppStateForObject, type SetupComponentStateFn} from './AppStateStore'
import {equals} from 'ramda'
import SubscribableStore from './SubscribableStore'

export type FunctionTransform = (fn: Function, thisRef: any, path?: string, property?: string) => Function

export interface StoredState {
    init?: (path: string, updateFn: (newVersion: any) => void, proxy: this, previousVersion?: any) => void
}

export interface StoredStateWithProps<Props extends object> extends StoredState {
    withProps: (props: Props) => this
}

export class BaseComponentState<ExternalProps extends object, StateProps extends object = ExternalProps> implements StoredStateWithProps<ExternalProps> {
    protected state: StateProps = {} as StateProps
    protected _thepath?: string
    protected _update?: (newVersion: any) => void
    get _path(): string | undefined { return this._thepath }

    constructor(public props: ExternalProps) {}

    init(path: string, updateFn:(newVersion: any) => void, proxy: this, previousVersion?: this): void {
        this._thepath = path
        this._update = updateFn
        this.doInit(previousVersion, proxy)
    }

    protected doInit(_previousVersion: this | undefined, _proxyThis: this): void {}

    updateState(changes: Partial<typeof this.state>) {
        const updatedState = this.withMergedState(changes)
        if (updatedState !== this) {
            this._update!(updatedState)
        }
        //
        // Object.assign(this.state, changes) as StateProps
        // for (const p in this.state) {
        //     if (this.state[p] === undefined) delete this.state[p]
        // }
    }

    withState(state: StateProps): this {
        return this.stateEqual(state) ? this : this.copy(this.props, state)
    }

    withProps(props: ExternalProps): this {
        return this.propsEqual(props) ? this : this.copy(props, this.state)
    }

    private withMergedState(changes: Partial<StateProps>): this {
        const newState = Object.assign({}, this.state, changes) as StateProps
        for (const p in newState) {
            if (newState[p] === undefined) delete newState[p]
        }

        return this.withState(newState)
    }

    get _stateForTest() {
        return this.state
    }

    protected copy(props: ExternalProps, state: StateProps): this {
        const ctor = this.constructor as new (props: ExternalProps) => this
        const newVersion = new ctor(props) as this
        newVersion.state = {...state}
        return newVersion
    }

    protected propsEqual(props: ExternalProps) {
        return equals(this.props, props)
    }

    protected stateEqual(state: StateProps) {
        return equals(this.state, state)
    }

}


const excludedProps = ['@@functional/placeholder', 'fantasy-land/equals', 'equals', '$$typeof']

class StatePlaceholder {
    constructor(public path: string) {}
    valueOf() { return undefined}
    [Symbol.toPrimitive]() { return undefined }
    _isPlaceholder = true
}

export const placeholder = (path: string, isSubProp?: boolean) => {
    const thePlaceholder = isSubProp ? Object.assign(function () {
        // placeholder
    },  {
        valueOf() { return undefined},
        [Symbol.toPrimitive]() { return undefined },
        _isPlaceholder: true,
        path
    })  : new StatePlaceholder(path)

    const handler = {
        get(target: any, property: string | symbol): any {
            if (property in target) {
                return target[property]
            }

            if (excludedProps.includes(property as string)) {
                return undefined
            }

            return placeholder(path + '.' + property.toString(), true)
        }
    }

    return new Proxy(thePlaceholder, handler)
}

export function withUpdatedProps<T extends object, P extends object>(state: T, props: P): T {
    const storedState = state as StoredStateWithProps<P>
    if (typeof storedState.withProps !== 'function') {
        const ctorFn = state.constructor as new (props: P) => T
        return new ctorFn(props) as T
    }
    return storedState.withProps(props) as T
}

export const wrapComponentState: (ft?: FunctionTransform) => SetupComponentStateFn = (ft?: FunctionTransform) => <T extends object>(path: string, state: T, appStateInterface: AppStateForObject<T>, previousVersion?: T): T => {
    const storedState = state as StoredState
    const proxy = createProxy<T>(appStateInterface, state, ft)
    if (typeof storedState.init === 'function') {
        storedState.init(path, appStateInterface.update.bind(appStateInterface), proxy, (previousVersion as any)?._original)
    }

    return proxy
}

const defaultFunctionTransform = (fn: Function, thisRef: any) => fn.bind(thisRef)
export function createProxy<T extends object>(store: AppStateForObject<T>, targetState: T, functionTransform: FunctionTransform = defaultFunctionTransform) {
    const handler = {
        cachedMethods: new Map<string, Function>(),
        get(target: T, property: string | symbol, receiver: any): any {
            if (property === '_original') {
                return target
            }
            const latestVersion = store.latest() ?? receiver
            if (latestVersion !== receiver) {
                return latestVersion[property as keyof T]
            }
            if (typeof property === 'symbol') {
                return Reflect.get(target, property, latestVersion)
            }

            if (this.cachedMethods.has(property)) {
                return this.cachedMethods.get(property)
            }

            if (property in target) {
                const propVal = Reflect.get(target, property, latestVersion)
                if (typeof propVal === 'function' && property !== 'constructor') {
                    const cachedFunction = functionTransform(propVal, receiver)
                    this.cachedMethods.set(property, cachedFunction)
                    return cachedFunction
                }
                return propVal
            }

            if (excludedProps.includes(property as string)) {
                return undefined
            }

            return store.getChildState(property)
        }
    }

    return new Proxy(targetState, handler)
}

export class ComponentStateStore extends AppStateStore {
    constructor(store = new SubscribableStore()) {
        super(store, wrapComponentState(), withUpdatedProps, placeholder)
    }
}
