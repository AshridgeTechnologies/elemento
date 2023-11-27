import {nanoid} from 'nanoid'

const uniqueId = () => Date.now().toString() + '-' + (Math.random() * 1000000).toString().substring(6)

export function caller (funcName: string, opts: any = {}) {
  const addListener = opts.addListener || window.addEventListener
  const removeListener = opts.removeListener || window.removeEventListener
  const postMessage = opts.postMessage || window.postMessage
  const targetOrigin = opts.targetOrigin || '*'

  return function (...args: any[]) {
    const msg = {
      sender: 'elemento-postmsg-rpc/client',
      id: uniqueId(),
      func: funcName,
      args
    }

    return new Promise((resolve, reject) => {
      const handler = function (event: MessageEvent) {
        const {data} = event
        if (!data || data.sender !== 'elemento-postmsg-rpc/server' || data.id !== msg.id) return
        removeListener('message', handler)

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
