import Observable from 'zen-observable'
import {without} from 'ramda'

export type Observer<T> = {
    next: (val: T) => void,
    error: (err: any) => void,
    complete: () => void,
}
export default class SendObservable<T> extends Observable<T> {

    private observers: Observer<T>[] = []

    onSubscribe(observer: Observer<T>)  {
        this.observers = this.observers.concat(observer)
        // On unsubscription, remove observer
        return () => {
            this.observers = without([observer], this.observers)
        }
    }

    constructor(observer?: Observable<T>) {
        if (observer) {
            // @ts-ignore
            return new Observable(observer)  // allow map etc to work
        }
        super((observer: Observer<T>) => this.onSubscribe(observer))
    }

    send(value: T) {
        this.observers.forEach(o => o.next(value) )
    }

    error(err: any) {
        this.observers.forEach(o => o.error(err) )
    }

    complete() {
        this.observers.forEach(o => o.complete() )
    }
}
