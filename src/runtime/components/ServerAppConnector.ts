import {BaseComponentState} from '../state/BaseComponentState'
import {ErrorResult, pending} from '../../shared/DataStore'
import appFunctions from '../appFunctions'
import {mergeRight} from 'ramda'
import {isoDateReviver, valueOf} from '../runtimeFunctions'
import {getIdToken, onAuthChange} from './authentication'
import lodash from 'lodash'

const {startCase} = lodash

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

type ExternalProperties = {configuration: Configuration}
type StateProperties = {resultCache: object, authSubscription?: VoidFunction }

export default function ServerAppConnector(_props: Properties) {
    return null
}

export class ServerAppConnectorState extends BaseComponentState<ExternalProperties, StateProperties> {

    private get configuration() { return this.props.configuration }
    private get resultCache() { return this.state.resultCache ?? {}}

    constructor(props: ExternalProperties) {
        super(props)
        const functions = this.props.configuration?.functions ?? []
        Object.entries(functions).forEach( ([name, def]) => (this as any)[name] = (...params: any[]) => this.doCall(name, params, def.action))
    }

    protected doInit(previousVersion?: this) {
        if (!previousVersion) {
            this.state.authSubscription = onAuthChange( ()=> this.latest().updateState({resultCache: {}}) )
        }
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

    private doCall(name: string, params: any[], action?: boolean) {
        return action ? this.doPostCall(name, params) : this.doGetCall(name, params)
    }

    private doGetCall(name: string, params: any[]) {
        const functionArgsKey = this.getFunctionArgsKey(name, params)
        const cachedResult = this.resultCache[functionArgsKey as keyof object]

        if (cachedResult === undefined) {
            const config = this.configuration

            const functionDef = config.functions[name]
            const paramNames = functionDef.params.slice(0, params.length)
            const queryString = paramNames.map((name, index) => `${name}=${valueOf(params[index])}`).join('&')
            const resultPromise = getIdToken()
                .then(token => {
                    const url = `${config.url}/${name}?${queryString}`
                    const options = token ? {headers: {Authorization: `Bearer ${token}`} as HeadersInit} : {}
                    return fetch!(url, options)
                        .then(resp => {
                            if (resp.ok) {
                                return resp.text().then( jsonText => JSON.parse(jsonText, isoDateReviver) )
                            } else {
                                return resp.json().then((data: any) => this.handleError(name, data.error))
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
        return getIdToken()
            .then(token => {
                const url = `${config.url}/${name}`
                const authHeaders = token ? {Authorization: `Bearer ${token}`} : {}
                const headers = {...({'Content-Type': 'application/json'}), ...authHeaders} as HeadersInit
                return fetch!(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(bodyData)
                })
            })
            // @ts-ignore
            .then(resp => {
                if (resp.ok) {
                    this.Refresh()
                    return resp.text()
                } else {
                    return resp.json().then((data: any) => this.handleError(name, data.error))
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
}

ServerAppConnector.State = ServerAppConnectorState
