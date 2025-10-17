import {AppStateForObject, StoredState, StoredStateWithProps} from './AppStateStore'
import {equals} from 'ramda'

export class BaseComponentState<ExternalProps extends object, StateProps extends object = ExternalProps> implements StoredStateWithProps<ExternalProps> {
    protected state: StateProps = {} as StateProps
    protected _appStateInterface?: AppStateForObject<any>
    get _path(): string | undefined { return this._appStateInterface?.path }

    constructor(public props: ExternalProps) {}

    init(asi: AppStateForObject<any>, previousVersion?: this): this {
        this._appStateInterface = asi
        this.doInit(previousVersion)
        return this
    }

    protected doInit(_previousVersion?: this) {}

    updateState(changes: Partial<typeof this.state>) {
        const latestState = this.latest()
        const updatedState = latestState.withMergedState(changes)
        if (updatedState !== latestState) {
            this._appStateInterface!.update(updatedState)
        }
    }

    latest(): this {
        return this._appStateInterface!.latest() as this
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

    protected getChildState<T extends StoredState>(name: string): T {
        return this._appStateInterface?.getChildState(name) as T
    }
}

export function createProxy<T extends StoredState>(store: AppStateForObject<T>, targetState: T) {
    const handler = {
        get(target: T, property: string): any {
            if (property in target) {
                return target[property as keyof T]
            }

            return store.getChildState(property)
        }
    }

    return new Proxy(targetState, handler)
}

export class BaseComponentStateWithProxy<ExternalProps extends object, StateProps extends object = ExternalProps> extends BaseComponentState<ExternalProps, StateProps> {

    init(asi: AppStateForObject<any>, previousVersion?: this): this {
        return createProxy(asi, super.init(asi, previousVersion))
    }
}
