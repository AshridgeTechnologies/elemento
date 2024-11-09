import SendObservable, {Observer} from './SendObservable'

const _NOT_SET = 'Not set'
export default class HotSendObservable<T> extends SendObservable<T> {

    private latestValue: T | typeof _NOT_SET = _NOT_SET

    onSubscribe(observer: Observer<T>): () => void {
        if (this.latestValue !== _NOT_SET) {
            observer.next(this.latestValue)
        }

        return super.onSubscribe(observer)
    }

    send(value: T) {
        this.latestValue = value
        super.send(value)
    }

}

