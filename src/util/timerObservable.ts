import Observable from 'zen-observable'
import {without} from 'ramda'
import {Observer} from './SendObservable'

export default function timerObservable(window: Window, getData: () => any, interval = 500)  {
    let observers: Observer<Event>[] = []
    let previousData: any = undefined
    let intervalId: number
    const handler = () => {
        const data = getData()
        if (data !== previousData) {
            observers.forEach( obs => obs.next(data) )
            previousData = data
        }
    }

    return new Observable(observer => {

        if (observers.length === 0) {
            intervalId = window.setInterval(handler, interval)
        }
        observers.push(observer)

        // return unsubscribe function
        return () => {
            observers = without([observer], observers)
            if (observers.length === 0) {
                window.clearInterval(intervalId)
            }
        }
    })
}
