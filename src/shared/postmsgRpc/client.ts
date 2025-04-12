import Observable from 'zen-observable'
import {identity} from 'ramda'

const uniqueId = () => Date.now().toString() + '-' + (Math.random() * 1000000).toString().substring(6)

export function caller(funcName: string, opts: any = {}) {
    const addListener = opts.addListener || globalThis.addEventListener
    const removeListener = opts.removeListener || globalThis.removeEventListener
    const postMessage = opts.postMessage || globalThis.postMessage
    const targetOrigin = opts.targetOrigin || '*'
    const timeout = opts.timeout || 0

    return function (...args: any[]): Promise<any> {
        const msg = {
            sender: 'elemento-postmsg-rpc/client',
            id: uniqueId(),
            func: funcName,
            args
        }

        return new Promise((resolve, reject) => {
            const handleTimeout = () => {
                removeListener('message', handler)
                reject(new Error(`Timeout calling ${funcName}`))
            }
            const timer = timeout ? setTimeout(handleTimeout, timeout) : null
            const handler = function (event: MessageEvent) {
                const {data} = event
                if (!data || data.sender !== 'elemento-postmsg-rpc/server' || data.id !== msg.id) return
                removeListener('message', handler)
                timer && clearTimeout(timer)

                if (data.err) {
                    const err = new Error(`Unexpected error calling ${funcName}`)
                    Object.assign(err, data.err)
                    reject(err)
                } else {
                    resolve(data.res)
                }
            }

            addListener('message', handler)
            postMessage(msg, targetOrigin)
        })
    }
}

export function observer(funcName: string, opts: any = {}) {
    const addListener = opts.addListener || globalThis.addEventListener
    const removeListener = opts.removeListener || globalThis.removeEventListener
    const postMessage = opts.postMessage || globalThis.postMessage
    const targetOrigin = opts.targetOrigin || '*'
    const transformFn: (val: any) => any = opts.transformFn ?? identity

    return function (...args: any[]): Observable<any> {
        const subscriptionId = uniqueId()
        const baseMsg = {
            sender: 'elemento-postmsg-rpc/client',
            id: subscriptionId,
            func: funcName
        }
        let subscriberCount = 0

        return new Observable(observer => {
            const handler = function (event: MessageEvent) {
                const {data} = event
                if (!data || data.sender !== 'elemento-postmsg-rpc/server' || data.id !== subscriptionId) return

                if (data.err) {
                    const err = new Error(`Unexpected error calling ${funcName}`)
                    Object.assign(err, data.err)
                    observer.error(err)
                } else {
                    observer.next(transformFn(data.res))
                }
            }

            addListener('message', handler)
            if (subscriberCount === 0) {
                const subscribeMessage = {...baseMsg, args}
                postMessage(subscribeMessage, targetOrigin)
            }
            subscriberCount++

            // return unsubscribe function
            return () => {
                removeListener('message', handler)
                subscriberCount--
                if (subscriberCount === 0) {
                    const unsubscribeMessage = {...baseMsg, unsubscribe: true}
                    postMessage(unsubscribeMessage, targetOrigin)
                }
            }
        })
    }
}
