import {AppStateForObject} from '../components/ComponentState'

type Props = { [p: string]: any }

export function createProxy(store: AppStateForObject, targetState: any) {
    const handler = {
        get(target: Props, property: string | symbol): any {
            if (property === Symbol.toPrimitive) {
                return target.valueOf
            }

            if (typeof property === 'symbol') {
                return undefined
            }

            if (property in target) {
                return target[property]
            }

            return store.getChildState(property)
        }
    }

    return new Proxy(targetState, handler)
}
