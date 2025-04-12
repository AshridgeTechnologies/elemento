import Observable from 'zen-observable'
import {without} from 'ramda'
import {Observer} from './SendObservable'

type EventSource = {addEventListener: typeof Window.prototype.addEventListener, removeEventListener: typeof Window.prototype.removeEventListener}

export default function eventObservable(eventSource: EventSource, eventType: string, getDataFromEvent: (evt: Event) => any)  {
    let observers: Observer<Event>[] = []
    const handler = (event: Event) => {
        const data = getDataFromEvent(event)
        observers.forEach( obs => obs.next(data) )
    }

    return new Observable(observer => {

        if (observers.length === 0) {
            eventSource.addEventListener(eventType, handler)
        }
        observers.push(observer)

        // return unsubscribe function
        return () => {
            observers = without([observer], observers)
            if (observers.length === 0) {
                eventSource.removeEventListener(eventType, handler)
            }
        }
    })
}
