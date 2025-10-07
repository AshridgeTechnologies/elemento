import {StoredState} from '../AppStateStore'
import {equals} from 'ramda'

export interface AppStateForObject {
    path: string,
    latest: () => StoredState
    updateVersion: (changes: object) => void,
    getChildState: (subPath: string) => StoredState
    // getOrCreateChildState: (subPath: string, item: StoredState) => StoredState
    // getApp: () => StoredState
}

export interface ComponentState<T> {
    init(asi: AppStateForObject): void

    withMergedState(changes: object): T

    latest(): T

    onChildStateChange(): void

    get _stateForTest(): any
}

export type StateMap = { [key: string]: StoredState }

export type WithChildStates<SP> = SP & {childStates: StateMap}

export class BaseComponentState<ExternalProps extends object, StateProps extends object = ExternalProps> {
    protected state: WithChildStates<StateProps> = {childStates: {}} as WithChildStates<StateProps>
    protected _appStateInterface?: AppStateForObject
    private __path?: string
    protected get _path(): string | undefined { return this.__path}

    protected readonly childNames: string[] = []

    constructor(public props: ExternalProps) {}

    init(asi: AppStateForObject): void {
        this._appStateInterface = asi
        this.__path = asi.path
        this.setupChildStates()
    }

    protected setupChildStates() {
        this.state.childStates ??= {}
        this.createChildStates()
    }

    protected createChildStates(): void {
    }

    protected getOrCreateChildState(path: string, item: StoredState) {
        // const childState = this._appStateInterface!.getOrCreateChildState(path, item)
        // this.state.childStates[path] = childState
        // return childState
    }

    updateState(changes: Partial<typeof this.state>) {
        this._appStateInterface!.updateVersion(changes)
    }

    latest(): this {
        return this._appStateInterface!.latest() as unknown as this
    }

    get domElement(): HTMLElement | null {
        return this._path ? document.getElementById(this._path) : null
    }

    get childStates() {
        return this.state.childStates ?? {}
    }

    get app() {
        return null //this._appStateInterface?.getApp()
    }

    Focus() {
        this.domElement?.focus()
    }

    private get thisConstructor(): any { return this.constructor as any }

    private copy(props: ExternalProps, state: WithChildStates<StateProps>): this {
        const newVersion = new this.thisConstructor(props) as this
        if (this._appStateInterface) {
            newVersion.init(this._appStateInterface)
        }
        newVersion.state = {...state}
        return newVersion
    }

    _matchesProps(props: ExternalProps) {
        return equals(this.props, props)
    }

    _withStateForTest(state: any): this {
        return this.withState(state)
    }

    withState(state: WithChildStates<StateProps>): this {
        return this.copy(this.props, state)
    }

    withProps(props: ExternalProps): this {
        return this.copy(props, this.state)
    }

    withMergedState(changes: Partial<StateProps>): this {
        const newState = Object.assign({}, this.state, changes) as WithChildStates<StateProps>
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

    protected getChildState(name: string) {
        return this._appStateInterface?.getChildState(name) as unknown as ComponentState<any>
    }

}
