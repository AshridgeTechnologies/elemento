import AppStateStore from './AppStateStore'

type Props = { [p: string]: any }

export function createProxy(store: AppStateStore, path: string, targetState: any) {
    const handler = {
        get(target: Props, property: string | symbol) {
            if (property === Symbol.toPrimitive) {
                return target.valueOf
            }

            if (typeof property === 'symbol') {
                return undefined
            }

            if (property in target) {
                return target[property]
            }

            return store.get(path + '.' + property)
        }
    }

    return new Proxy(targetState, handler)
}
