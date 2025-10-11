import {StoredState} from '../state/AppStateStore'
import {equals} from 'ramda'
import {createProxy} from '../state/createProxy'

export interface AppStateForObject {
    path: string,
    latest: () => StoredState
    updateVersion: (newVersion: StoredState) => void,
    getChildState: (subPath: string) => StoredState
}

export interface ComponentState<T> {
    init(asi: AppStateForObject): T | undefined

    withMergedState(changes: object): T

    latest(): T

    onChildStateChange(): void

    get _stateForTest(): any
}

export class BaseComponentState<ExternalProps extends object, StateProps extends object = ExternalProps> {
    protected state: StateProps = {} as StateProps
    protected _appStateInterface?: AppStateForObject
    protected get _path(): string | undefined { return this._appStateInterface?.path }

    constructor(public props: ExternalProps) {}

    init(asi: AppStateForObject): this {
        this._appStateInterface = asi
        this.doInit()
        return createProxy(asi, this)
    }

    protected doInit() {}

    protected getOrCreateChildState(path: string, item: StoredState) {
        // const childState = this._appStateInterface!.getOrCreateChildState(path, item)
        // this.state.childStates[path] = childState
        // return childState
    }

    updateState(changes: Partial<typeof this.state>) {
        const latestState = this._appStateInterface!.latest()
        const updatedState = (latestState as any).withMergedState(changes)
        if (updatedState !== latestState) {
            this._appStateInterface!.updateVersion(updatedState)
        }
    }

    latest(): this {
        return this._appStateInterface!.latest() as unknown as this
    }

    get domElement(): HTMLElement | null {
        return this._path ? document.getElementById(this._path) : null
    }

    get childStates() {
        return {}
    }

    get app() {
        return null //this._appStateInterface?.getApp()
    }

    Focus() {
        this.domElement?.focus()
    }

    private get thisConstructor(): any { return this.constructor as any }

    private copy(props: ExternalProps, state: StateProps): this {
        const newVersion = new this.thisConstructor(props) as this
        newVersion.state = {...state}
        if (this._appStateInterface) {
            newVersion.init(this._appStateInterface)
        }
        return newVersion
    }

    propsEqual(props: ExternalProps) {
        return equals(this.props, props)
    }

    stateEqual(state: StateProps) {
        return equals(this.state, state)
    }

    _withStateForTest(state: any): this {
        return this.withState(state)
    }

    withState(state: StateProps): this {
        return this.stateEqual(state) ? this : this.copy(this.props, state)
    }

    withProps(props: ExternalProps): this {
        return this.propsEqual(props) ? this : this.copy(props, this.state)
    }

    withMergedState(changes: Partial<StateProps>): this {
        const newState = Object.assign({}, this.state, changes) as StateProps
        for (const p in newState) {
            // @ts-ignore
            if (newState[p] === undefined) delete newState[p]
        }

        return this.withState(newState)
    }

    onChildStateChange() {
        // const getChildState = (name: string) => this._appStateInterface?.getChildState(name) as ComponentState<any>
        // const latestChildStates = Object.fromEntries(this.childNames.map(name => [name, getChildState(name)]))
        // if (!shallow(this.childStates, latestChildStates)) {
        //     // @ts-ignore
        //     this.updateState({childStates: latestChildStates})
        // }
    }

    get _stateForTest() { return this.state }

    get _raw() { return this }

    protected getChildState(name: string) {
        return this._appStateInterface?.getChildState(name) as unknown as ComponentState<any>
    }

}
