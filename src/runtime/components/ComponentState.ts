import {shallow} from 'zustand/shallow'
import {StoredState} from '../AppStateStore'

export interface AppStateForObject {
    latest: () => StoredState
    updateVersion: (changes: object) => void,
    getChildState: (subPath: string) => StoredState
    getOrCreateChildState: (subPath: string, item: StoredState) => StoredState
    getApp: () => StoredState
}

export interface ComponentState<T> {
    init(asi: AppStateForObject, path: string): void

    updateFrom(newObj: T): T

    withMergedState(changes: object): T

    latest(): T

    onChildStateChange(): void

    get _stateForTest(): any
}

export type StateMap = { [key: string]: StoredState }

type WithChildStates<SP> = SP & {childStates: StateMap}

export class BaseComponentState<ExternalProps extends object, StateProps extends object = ExternalProps> {
    protected state: WithChildStates<StateProps> = {childStates: {}} as WithChildStates<StateProps>
    protected _appStateInterface?: AppStateForObject
    protected _path?: string

    protected readonly childNames: string[] = []

    constructor(public props: ExternalProps) {}

    init(asi: AppStateForObject, path: string): void {
        this._appStateInterface = asi
        this._path = path
        this.setupChildStates()
    }

    protected setupChildStates() {
        this.state.childStates ??= {}
        this.createChildStates()
    }

    protected createChildStates(): void {
    }

    protected getOrCreateChildState(path: string, item: StoredState) {
        const childState = this._appStateInterface!.getOrCreateChildState(path, item)
        this.state.childStates[path] = childState
        return childState
    }

    updateFrom(newObj: this): this {
        const sameType = this.constructor === newObj.constructor
        return sameType && this.isEqualTo(newObj) ? this : newObj.withState(this.state)
    }

    latest(): this {
        return this._appStateInterface!.latest() as this
    }

    get domElement(): HTMLElement | null {
        return this._path ? document.getElementById(this._path) : null
    }

    get childStates() {
        return this.state.childStates ?? {}
    }

    get app() {
        return this._appStateInterface?.getApp()
    }

    Focus() {
        this.domElement?.focus()
    }

    private get thisConstructor(): any { return this.constructor as any }

    protected isEqualTo(newObj: this) {
        return shallow(this.props, newObj.props)
    }

    protected withState(state: WithChildStates<StateProps>): this {
        const newVersion = new this.thisConstructor(this.props) as BaseComponentState<ExternalProps, StateProps>
        newVersion.state = {...state}
        return newVersion as this
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
        const getChildState = (name: string) => this._appStateInterface?.getChildState(name) as ComponentState<any>
        const latestChildStates = Object.fromEntries(this.childNames.map(name => [name, getChildState(name)]))
        if (!shallow(this.childStates, latestChildStates)) {
            // @ts-ignore
            this.updateState({childStates: latestChildStates})
        }
    }

    _withStateForTest(state: StateProps): this {
        const newVersion = new this.thisConstructor(this.props)
        newVersion.state = state
        newVersion._appStateInterface = this._appStateInterface
        newVersion._path = this._path
        return newVersion
    }

    get _stateForTest() { return this.state }

    protected updateState(changes: Partial<typeof this.state>) {
        this._appStateInterface!.updateVersion(changes)
    }

    setPreventUpdates() {

    }

    protected getChildState(name: string) {
        return (this._appStateInterface?.getChildState(name) as ComponentState<any>)
    }

}
