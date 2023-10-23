import {BaseComponentState, ComponentState} from './ComponentState'
import {ErrorResult, pending} from '../DataStore'
import appFunctions from '../appFunctions'
import {equals, mergeRight} from 'ramda'
import {valueOf} from '../runtimeFunctions'
import auth from './authentication'
import lodash from 'lodash'; const {startCase} = lodash;

type Properties = {path: string}

export interface Configuration {
    appName: string,
    url: string,
    functions: {
        [name: string] : {
            params: string[],
            action?: boolean
        }
    }
}

type ExternalProperties = {configuration: Configuration, fetch?: typeof globalThis.fetch}
type StateProperties = {resultCache: object, versionId: string, versionFetch: Promise<string> }

export default function ServerAppConnector({path}: Properties) {
    return null
}

export class ServerAppConnectorState extends BaseComponentState<ExternalProperties, StateProperties>
    implements ComponentState<ServerAppConnectorState> {

    private get fetch() { return this.props.fetch }
    private get configuration() { return this.props.configuration }
    private get resultCache() { return this.state.resultCache ?? {}}
    private get versionId() { return this.state.versionId}

    constructor(props: ExternalProperties) {
        super({fetch: globalThis.fetch.bind(globalThis), ...props})
        const functions = this.props.configuration?.functions ?? []
        Object.entries(functions).forEach( ([name, def]) => (this as any)[name] = (...params: any[]) => this.doCall(name, params, def.action))
    }

    Refresh(functionName?: string, ...args: any[]) {
        if (!functionName) {
            const newCache = {}
            this.state.resultCache = newCache
            this.updateState({resultCache: newCache})
        } else if (args.length > 0) {
            const functionArgsKey = this.getFunctionArgsKey(functionName, args)
            this.updateCalls(functionArgsKey, undefined)
        } else {
            const keysToDelete = Object.keys(this.resultCache).filter( key => key.startsWith(`${functionName}#`))
            const deletions = Object.fromEntries(keysToDelete.map(key => [key, undefined]))
            const newCache = mergeRight(this.resultCache, deletions)
            this.state.resultCache = newCache
            this.updateState({resultCache: newCache})
        }
    }

    private handleError = (functionName: string, error?: {message: string}) => {
        const errorMessage = error?.message ?? ''
        const functionDisplayName = startCase(functionName)
        const description = `${this.configuration.appName}: ${functionDisplayName}`
        appFunctions.NotifyError(description, new Error(errorMessage))
        return new ErrorResult(description, errorMessage)
    }

    protected isEqualTo(newObj: this): boolean {
        return equals(this.props.configuration, newObj.props.configuration)
    }

    private doCall(name: string, params: any[], action?: boolean) {
        return action ? this.doPostCall(name, params) : this.doGetCall(name, params)
    }

    private async getVersion() {
        if (this.versionId) return
        if (!this.state.versionFetch) {
            const versionFetch = this.fetch!('/version')
                .then( resp => resp.json() )
                .then( versionInfo => versionInfo.commitId as string)
                .then( versionId => {
                    this.updateVersion(versionId)
                    return versionId
                })
                this.updateVersionFetch(versionFetch)
        }
        return this.state.versionFetch
    }

    private doGetCall(name: string, params: any[]) {
        const functionArgsKey = this.getFunctionArgsKey(name, params)
        const cachedResult = this.resultCache[functionArgsKey as keyof object]

        if (cachedResult === undefined) {
            const config = this.configuration

            const functionDef = config.functions[name]
            const paramNames = functionDef.params.slice(0, params.length)
            const queryString = paramNames.map((name, index) => `${name}=${valueOf(params[index])}`).join('&')
            const resultPromise = this.getVersion()
                .then(() => auth.getIdToken())
                .then(token => {
                    const url = `${config.url.replace(':versionId', this.versionId)}/${name}?${queryString}`
                    const options = token ? {headers: {Authorization: `Bearer ${token}`} as HeadersInit} : {}
                    return this.fetch!(url, options)
                        .then(resp => {
                            if (resp.ok) {
                                return resp.json()
                            } else {
                                return resp.json().then(data => this.handleError(name, data.error))
                            }
                        })
                        .catch(err => {
                            return this.handleError(name, err)
                        })
                        .then(data => {
                            this.updateCalls(functionArgsKey, data)
                            return data
                        })
                })
            const result = pending(resultPromise)
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
        return this.getVersion()
            .then(() => auth.getIdToken())
            .then(token => {
                const url = `${config.url.replace(':versionId', this.versionId)}/${name}`
                const authHeaders = token ? {Authorization: `Bearer ${token}`} : {}
                const headers = {...({'Content-Type': 'application/json'}), ...authHeaders} as HeadersInit
                return this.fetch!(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(bodyData)
                })
            })
            // @ts-ignore
            .then(resp => {
                if (resp.ok) {
                    return resp.text()
                } else {
                    return resp.json().then(data => this.handleError(name, data.error))
                }
            })
            .catch(err => this.handleError(name, err))
    }

    private getFunctionArgsKey(name: string, params: any[]) {
        return `${name}#${JSON.stringify(params)}`
    }

    private updateCalls(key: string, data: any) {
        const newCache = mergeRight(this.resultCache, {[key]: data})
        this.state.resultCache = newCache
        this.updateState({resultCache: newCache})
    }

    private updateVersion(versionId: string) {
        this.state.versionId = versionId
        this.updateState({versionId})
    }

    private updateVersionFetch(versionFetch: Promise<string>) {
        this.state.versionFetch = versionFetch
        this.updateState({versionFetch})
    }
}

ServerAppConnector.State = ServerAppConnectorState
