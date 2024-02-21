import Observable from 'zen-observable'
import {without} from 'ramda'
import {Observer} from './SendObservable'

export default function eventObservable(window: Window, eventType: string, getDataFromEvent: (evt: Event) => any)  {
    let observers: Observer<Event>[] = []
    const handler = (event: Event) => {
        const data = getDataFromEvent(event)
        observers.forEach( obs => obs.next(data) )
    }

    return new Observable(observer => {

        if (observers.length === 0) {
            window.addEventListener(eventType, handler)
        }
        observers.push(observer)

        // return unsubscribe function
        return () => {
            observers = without([observer], observers)
            if (observers.length === 0) {
                window.removeEventListener(eventType, handler)
            }
        }
    })
}
