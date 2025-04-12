import {caller, observer} from './postmsgRpc/client'

export const callRpc = (functionName: string, win = window.parent, timeout?: number) => caller(functionName, {timeout, postMessage: (msg: any, target: string) => win.postMessage(msg, target)})
export const observeRpc = (functionName: string, transformFn?: (val: any) => any, win = window.parent) => observer(functionName, {
    transformFn,
    postMessage: (msg: any, target: string) => win.postMessage(msg, target)
})
