import {BaseComponentState, ComponentState} from './ComponentState'
import {Pending} from '../DataStore'
import {equals, mergeRight} from 'ramda'
import {valueOf} from '../runtimeFunctions'
import auth from './authentication'
import shallow from 'zustand/shallow'
import {deepEqual} from 'assert'

type Properties = {path: string}

export interface Configuration {
    url: string,
    functions: {
        [name: string] : {
            params: string[],
            action?: boolean
        }
    }
}

type ExternalProperties = {configuration: Configuration, fetch?: typeof globalThis.fetch}
type StateProperties = {resultCache: object }

export default function ServerAppConnector({path}: Properties) {
    return null
}

export class ServerAppConnectorState extends BaseComponentState<ExternalProperties, StateProperties>
    implements ComponentState<ServerAppConnectorState> {

    private get fetch() { return this.props.fetch }
    private get resultCache() { return this.state.resultCache ?? {}}

    constructor(props: ExternalProperties) {
        super({fetch: globalThis.fetch.bind(globalThis), ...props})
        const functions = this.props.configuration?.functions ?? []
        Object.entries(functions).forEach( ([name, def]) => (this as any)[name] = (...params: any[]) => this.doCall(name, params, def.action))
    }

    protected isEqualTo(newObj: this): boolean {
        return equals(this.props.configuration, newObj.props.configuration)
    }

    private doCall(name: string, params: any[], action?: boolean) {
        return action ? this.doPostCall(name, params) : this.doGetCall(name, params)
    }

    private doGetCall(name: string, params: any[]) {
        const functionArgsKey = `${name}#${JSON.stringify(params)}`
        const cachedResult = this.resultCache[functionArgsKey as keyof object]
        if (cachedResult === undefined) {
            const config = this.props.configuration
            const functionDef = config.functions[name]
            const paramNames = functionDef.params.slice(0, params.length)
            const queryString = paramNames.map( (name, index) => `${name}=${valueOf(params[index])}`).join('&')
            const url = `${config.url}/${name}?${queryString}`
            auth.getIdToken().then(token => {
                const options = token ? {headers: {Authorization: `Bearer ${token}`} as HeadersInit} : {}
                return this.fetch!(url, options)
                    .then( resp => resp.json())
                    .then( data => this.updateCalls(functionArgsKey, data) )
            })
            const result = new Pending()
            this.updateCalls(functionArgsKey, result)
            return result
        }

        return cachedResult
    }

    private doPostCall(name: string, params: any[]) {
        const config = this.props.configuration
        const functionDef = config.functions[name]
        const paramNames = functionDef.params.slice(0, params.length)
        const objectEntries = paramNames.map((name, index) => [name, valueOf(params[index])])
        const bodyData = Object.fromEntries(objectEntries)
        const url = `${config.url}/${name}`
        return auth.getIdToken().then(token => {
            const authHeaders = token ? {Authorization: `Bearer ${token}`} : {}
            const headers = {...({'Content-Type': 'application/json'}), ...authHeaders} as HeadersInit
            return this.fetch!(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(bodyData)
            })
        })
            .then(resp => resp.text())
    }

    private updateCalls(key: string, data: any) {
        const newCache = mergeRight(this.resultCache, {[key]: data})
        this.state.resultCache = newCache
        this.updateState({resultCache: newCache})
    }

}

ServerAppConnector.State = ServerAppConnectorState
