import userEvent from '@testing-library/user-event'
import {
    ActionFn,
    ActionQueue,
    ensureVisible,
    getStoredOptions,
    hidePointer,
    highlightElements,
    selectElements,
    selectSingleElement,
    setElementValue,
    showPointer
} from './controllerHelpers'
import BigNumber from 'bignumber.js'
import {mapValues} from 'radash'
import {Value} from '../runtime/runtimeFunctions'
import {isObject, isPlainObject} from 'lodash'
import eventObservable from '../util/eventObservable'
import timerObservable from '../util/timerObservable'
import AppContext from '../runtime/AppContext'


export function valueOf<T>(x: Value<T>): T {
    if (x instanceof Date) return x as T
    if (x instanceof BigNumber) return x as T
    if (isPlainObject(x)) return mapValues(x as object, valueOf) as T
    return isObject(x) ? x.valueOf() : x
}

export default class PreviewController {
    private readonly actionQueue = new ActionQueue()

    constructor(private readonly window: Window) {}

    private get container(): HTMLElement { return this.window.document.body }
    private get options() { return getStoredOptions() }
    private get appContext(): AppContext | undefined { return (this.window as any).appContext }

    Show(selector?: string) {
        console.log('Show', selector)
        const elements = selector ? selectElements('id', this.container, selector) : []

        this.queueAction(null, async () => {
            highlightElements(elements, this.container)
            if (elements.length === 1) {
                const singleElement = elements[0].closest('.MuiFormControl-root') as HTMLElement
                await ensureVisible(singleElement)
                if (this.options.showWithPointer) {
                    await showPointer(singleElement, this.container)
                }
            } else {
                hidePointer(this.container)
            }
        })
    }

    Click(selector: string) {
        console.log('Click', selector)
        this.queueAction(selector, () => {
            const element = selectSingleElement('id', this.container, selector)
            if (element) {
                return userEvent.click(element)
            }
        })
    }

    SetValue(selector: string, value: string | boolean) {
        console.log('SetValue', selector, value)
        this.queueAction(selector, async () => {
            const element = selectSingleElement('id', this.container, selector)
            if (element) {
                await setElementValue(element, this.container, value)
            }
        })
    }

    GetValue(selector: string) { // @ts-ignore
        return this.GetState(selector).value
    }

    GetState(selector: string) { // @ts-ignore
        return this.window.appStore.getState().store.selectByEnding(selector)
    }

    GetTextContent(selector: string) { // @ts-ignore
        const element = selectSingleElement('id', this.container, selector)
        return element?.textContent
    }

    Debug(debugExpr: string) {
        const windowAny = this.window as any
        windowAny.elementoDebugExpr = debugExpr
        this.window.dispatchEvent(new CustomEvent('debugExpr', {detail: debugExpr}))
        return eventObservable(this.window, 'debugData', (evt: Event) => {
            const {detail} = (evt as CustomEvent)
            return valueOf(detail)
        })
    }

    Url() {
        return timerObservable(window, () => this.appContext?.getUrlString() ?? '')
    }

    SetUrl(url: string) {
        this.appContext?.pushUrl(url)
    }

    Back() {
        this.appContext?.goBack()
    }

    Forward() {
        this.appContext?.goForward()
    }

    Reload() {
        this.window.location.reload()
    }

    private queueAction(selector: string | null, fn: ActionFn) {
        const {showBeforeActions, delay} = this.options
        if (showBeforeActions && selector) {
            this.Show(selector)
        }
        this.actionQueue.queueAndWait(fn, delay)
    }
}
