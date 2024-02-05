import {startsWithUppercase} from '../../util/helpers'

export function expose (funcName: string, func:(...args: any[]) => any, opts: any = {}) {
    const addListener = opts.addListener || window.addEventListener
    const removeListener = opts.removeListener || window.removeEventListener
    const targetOrigin = opts.targetOrigin || '*'

    const handler = async function (event: MessageEvent) {
        const {data, source} = event
        if (!data || data.sender !== 'elemento-postmsg-rpc/client' || data.func !== funcName) return

        const respond = (props: { res: any } | { err: any }) => {
            const response = {sender: 'elemento-postmsg-rpc/server', id: data.id, ...props}
            source?.postMessage(response, targetOrigin)
        }

        try {
            respond({res: await func(...data.args)})
        } catch (e: any) {
            const err: any = Object.assign({message: e.message}, e.output && e.output.payload)

            if (process.env.NODE_ENV !== 'production') {
                err.stack = err.stack || e.stack
            }
            respond({err})
        }
    }

    addListener('message', handler)

    return {close: () => removeListener('message', handler)}
}

const exposeBoundFunction = (objectName: string, functionName: string, object: any, opts: any = {}) => {
    const nameToExpose = objectName + '.' + functionName
    return expose(nameToExpose, object[functionName].bind(object), opts)
}

export const exposeFunctions = (objectName: string, serverObject: object, opts: any = {}): VoidFunction => {
    const functionNames = Object.getOwnPropertyNames(serverObject.constructor.prototype).filter(startsWithUppercase)
    const closeFns = functionNames.map(name => exposeBoundFunction(objectName, name, serverObject, opts).close)
    return () => {closeFns.forEach( fn => fn() )}
}
