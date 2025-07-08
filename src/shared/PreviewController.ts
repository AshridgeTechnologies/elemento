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
import Observable from 'zen-observable'
import {getUrlChangeObservable, goBack, goForward, pushUrl} from '../runtime/navigationHelpers'
import {ElementId} from '../model/Types'
import {isNil} from 'ramda'
import AppStateStore from '../runtime/AppStateStore'


export function valueOf<T>(x: Value<T>): T {
    if (x instanceof Date) return x as T
    if (x instanceof BigNumber) return x as T
    if (isPlainObject(x)) return mapValues(x as object, valueOf) as T
    return isObject(x) ? x.valueOf() : x
}

export default class PreviewController {
    private readonly actionQueue = new ActionQueue()
    private debugObservable: Observable<any> | undefined
    private selectionObservable: Observable<any> | undefined

    constructor(private readonly window: Window, private readonly store: AppStateStore) {}

    private get container(): HTMLElement { return this.window.document.body }
    private get options() { return getStoredOptions() }
    private get debugDataObservable() {
        return this.debugObservable ??= eventObservable(this.window, 'debugData', (evt: Event) => {
            const {detail} = (evt as CustomEvent)
            return valueOf(detail)
        })
    }
    private get elementSelectedObservable() {
        const getIdOfElementAltClicked = (evt: Event) => {
            const event = evt as MouseEvent
            if (event.altKey) {
                event.preventDefault()
                event.stopPropagation()
                const target = event.target as HTMLElement
                return target.id || target.closest('[id]')?.id
            }
        }
        return this.selectionObservable ??= eventObservable(this.window, 'click', getIdOfElementAltClicked, true).filter( id => !isNil(id))
    }

    IsReady() {
        return true
    }

    async ServerStatus() {
        return await fetch(`/capi/status/Info`).then( resp => resp.json() )
    }

    Highlight(elementIds: ElementId[]) {
        highlightElements(elementIds, this.container)
        if (elementIds.length >= 1) {
            const firstElement = this.container.querySelector(`[id='${elementIds[0]}']`)
            ensureVisible(firstElement as HTMLElement)
        }
    }

    CallFunction(componentId: string, functionName: string, args: any[]) {
        const componentState = this.store.get(componentId)
        const func = (componentState as any)[functionName]
        func.apply(componentState, args)
    }

    Show(selector?: string) {
        console.log('Show', selector)
        const elements = selector ? selectElements('id', this.container, selector) : []

        this.queueAction(null, async () => {
            highlightElements(elements.map( el => el.id), this.container)
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

    Debug(debugExpr: string | null) {
        const windowAny = this.window as any
        windowAny.elementoDebugExpr = debugExpr
        this.window.dispatchEvent(new CustomEvent('debugExpr', {detail: debugExpr}))
        return this.debugDataObservable
    }

    Url() {
        return getUrlChangeObservable().map( url => this.normalizeUrl(url) )
    }

    ElementSelected() {
        return this.elementSelectedObservable
    }

    GetUrl() {
        return this.normalizeUrl(window.location.href)
    }

    SetUrl(url: string) {
        pushUrl(url)
    }

    Back() {
        goBack()
    }

    Forward() {
        goForward()
    }

    Reload() {
        this.window.location.reload()
    }

    private normalizeUrl(urlString: string) {
        const url = new URL(urlString)
        const pathname = '/' + url.pathname.split('/').slice(1).join('/')
        const queryString = url.search
        const queryPart = queryString ? '?' + queryString : ''
        const hashPart = url.hash ? '#' + url.hash : ''
        return pathname + queryPart + hashPart
    }

    private queueAction(selector: string | null, fn: ActionFn) {
        const {showBeforeActions, delay} = this.options
        if (showBeforeActions && selector) {
            this.Show(selector)
        }
        this.actionQueue.queueAndWait(fn, delay)
    }
}
