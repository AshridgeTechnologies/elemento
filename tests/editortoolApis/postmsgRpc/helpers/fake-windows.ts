type Listener = (data: any) => void

export default function fakeWindows() {

    const win = (name: string, otherWin: () => any) => {

        let listeners = [] as Listener[]
        let messageCount = 0

        return {
            name,
            addEventListener: (_: unknown, listener: Listener) => listeners.push(listener),
            removeEventListener(_: unknown, listener: Listener) {
                listeners = listeners.filter(l => l !== listener)
            },
            postMessage(data: any) {
                const msg = {data, source: otherWin()}
                process.nextTick(() => listeners.forEach(l => l(msg)))
                messageCount++
            },
            get postMessagesReceived() { return messageCount }
        }
    }
    const clientWin = win('client', () => serverWin)
    const serverWin = win('server', () => clientWin)

    return [serverWin, clientWin]
}
