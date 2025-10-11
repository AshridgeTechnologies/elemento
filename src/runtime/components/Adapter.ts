import {BaseComponentState, ComponentState} from './ComponentState'
import {ErrorResult, pending} from '../../shared/DataStore'
import {equals, mergeRight, without} from 'ramda'
import lodash from 'lodash'
import {valuesOf} from '../runtimeFunctions'
import appFunctions from '../appFunctions'
import Observable from 'zen-observable'

const {startCase} = lodash

type Properties = {path: string}

type ExternalProperties = {target?: any}
type StateProperties = {resultCache: object, subscriptionCache: object, pendingCalls: number}

const excludedProps = ['constructor', 'equals']

export default function Adapter({path}: Properties) {
    return null
}

export class AdapterState extends BaseComponentState<ExternalProperties, StateProperties>
    implements ComponentState<AdapterState> {

    constructor(props: ExternalProperties) {
        super(props)

        const addProps = (obj: object) => {
            const propNames = without(excludedProps, Object.getOwnPropertyNames(obj))
            for (const p of propNames) {
                if (typeof this.target[p] === 'function') {
                    (this as any)[p] = (...args: any[]) => this.doCall(p, args)
                }
            }
        }

        if (this.target) {
            addProps(this.target.constructor.prototype)
            addProps(this.target)
        }
    }

    public get pending() { return this.pendingCalls > 0 }

    private get pendingCalls() { return this.state.pendingCalls ?? 0 }
    private get target() { return this.props.target}
    private get resultCache() { return this.state.resultCache ?? {}}
    private get subscriptionCache() { return this.state.subscriptionCache ?? {}}


    Refresh(functionName?: string, ...args: any[]) {
        const removeSubscriptions = (functionNamePrefix: string) => {
            const keysToUnsubscribe = Object.keys(this.subscriptionCache).filter(key => key.startsWith(functionNamePrefix))
            keysToUnsubscribe.forEach((key) => {
                const subscription = this.state.subscriptionCache[key as keyof object] as ZenObservable.Subscription
                subscription?.unsubscribe()
            })
            const subDeletions = Object.fromEntries(keysToUnsubscribe.map(key => [key, undefined]))
            const newSubsCache = mergeRight(this.subscriptionCache, subDeletions)
            this.state.subscriptionCache = newSubsCache
            return newSubsCache
        }

        const removeResults = (functionNamePrefix: string) => {
            const keysToDelete = Object.keys(this.resultCache).filter(key => key.startsWith(functionNamePrefix))
            const deletions = Object.fromEntries(keysToDelete.map(key => [key, undefined]))
            const newCache = mergeRight(this.resultCache, deletions)
            this.state.resultCache = newCache
            return newCache
        }

        if (!functionName) {
            removeSubscriptions('')
            this.state.resultCache = {}
            this.state.subscriptionCache = {}
            this.updateState({resultCache: {}, subscriptionCache: {}})
        } else {
            const functionArgsKey = this.getFunctionArgsKey(functionName, args)
            const newCache = removeResults(functionArgsKey)
            const newSubsCache = removeSubscriptions(functionArgsKey)
            this.updateState({resultCache: newCache, subscriptionCache: newSubsCache})
        }
    }

    protected isEqualTo(newObj: this): boolean {
        return equals(this.props.target, newObj.props.target)
    }

    private doCall(name: string, args: any[]) {
        const argValues = valuesOf(...args)
        const functionArgsKey = this.getFunctionArgsKey(name, argValues)
        const cachedResult: any = this.resultCache[functionArgsKey as keyof object]
        if (cachedResult !== undefined) {
            return cachedResult
        }

        let callResult
        const description = startCase(name)
        try {
            callResult = this.target[name]?.(...argValues)
        } catch (error: any) {
            return new ErrorResult(description, error.message)
        }
        if (callResult instanceof Promise) {
            const result = pending(callResult)
            this.updateCalls(functionArgsKey, result, 1)
            callResult
                .then((resolvedResult: any) => this.updateCalls(functionArgsKey, resolvedResult, -1))
                .catch( (error: any) => {
                    this.updateCalls(functionArgsKey, new ErrorResult(description, error.message), -1)
                    appFunctions.NotifyError(description, new Error(error.message))
                })
            return result
        }

        if (callResult instanceof Observable) {
            const next = (resolvedResult: any) => {this.updateCalls(functionArgsKey, resolvedResult) }
            const error = (err: any) => {this.updateCalls(functionArgsKey, new ErrorResult(description, err.message)) }
            const subscription = callResult.subscribe({next, error})
            const latestValue = null
            this.updateCalls(functionArgsKey, latestValue)
            this.updateSubscriptions(functionArgsKey, subscription)
            return latestValue
        }

        return callResult
    }

    private getFunctionArgsKey(name: string, params: any[]) {
        return `${name}#${params.length ? JSON.stringify(params) : ''}`
    }

    private updateCalls(key: string, data: any, pendingCallsChange = 0) {
        const newPendingCalls = this.pendingCalls + pendingCallsChange
        const newCache = mergeRight(this.resultCache, {[key]: data})
        this.updateState({resultCache: newCache, pendingCalls: newPendingCalls})
        this.state.resultCache = newCache
        this.state.pendingCalls = newPendingCalls
    }

    private updateSubscriptions(key: string, subscription: ZenObservable.Subscription | undefined) {
        const newCache = mergeRight(this.subscriptionCache, {[key]: subscription})
        this.state.subscriptionCache = newCache
        this.updateState({subscriptionCache: newCache})
    }
}

Adapter.State = AdapterState
