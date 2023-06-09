import {AppStateForObject} from '../appData'
import shallow from 'zustand/shallow'
import {equals, omit} from 'ramda'

export interface ComponentState<T> {
    init(asi: AppStateForObject): void

    updateFrom(newObj: T): T

    latest(): T
}

export class BaseComponentState<ExternalProps extends object, StateProps extends object = ExternalProps> {
    protected state: StateProps = {} as StateProps
    protected _appStateInterface?: AppStateForObject

    constructor(public props: ExternalProps) {}

    init(asi: AppStateForObject): void {
        this._appStateInterface = asi
    }

    updateFrom(newObj: this): this {
        return this.isEqualTo(newObj) ? this : new this.thisConstructor(newObj.props).withState(this.state)
    }

    latest(): this {
        return this._appStateInterface!.latest()
    }

    private get thisConstructor(): any { return this.constructor as any }

    protected isEqualTo(newObj: this) {
        return shallow(this.props, newObj.props)
    }

    protected withState(state: StateProps): this {
        const newVersion = new this.thisConstructor(this.props) as BaseComponentState<ExternalProps, StateProps>
        newVersion.state = state
        return newVersion as this
    }

    _withStateForTest(state: StateProps): this {
        const newVersion = new this.thisConstructor(this.props)
        newVersion.state = state
        newVersion._appStateInterface = this._appStateInterface
        return newVersion
    }

    protected updateState(changes: Partial<StateProps>) {
        const newState = Object.assign({}, this.state, changes) as StateProps
        this._appStateInterface!.updateVersion(this.withState(newState))
    }

    protected propsMatchValueEqual(thisProps: { value: any }, newProps: { value: any }) {
        const thisSimpleProps = omit(['value'], thisProps)
        const newSimpleProps = omit(['value'], newProps)
        const simplePropsMatch = shallow(thisSimpleProps, newSimpleProps)
        return simplePropsMatch && equals(thisProps.value, newProps.value)
    }
}