import userEvent from '@testing-library/user-event'
import {UserEvent} from '@testing-library/user-event/setup/setup'
import {
    ActionFn,
    ActionQueue,
    ensureVisible,
    hidePointer,
    highlightElements,
    Options,
    selectElementsById,
    selectSingleElementById,
    setElementValue,
    showPointer
} from './controllerHelpers'

export default class PreviewController {
    private _user: UserEvent | null = null
    private readonly actionQueue = new ActionQueue()
    private options: Options = {showBeforeActions: false, showWithPointer: false, delay: 1000}

    constructor(private readonly window: Window) {
    }

    private get container(): HTMLElement { return this.window.document.body }
    private get user() {
        // lazy initialization allows for document not being ready when this object is constructed
        return this._user ?? (this._user = userEvent.setup({delay: 20, document: this.window.document}))
    }

    SetOptions(options: Partial<Options>) {
        this.options = {...this.options, ...options}
    }

    Show(selector?: string) {
        console.log('Show', selector)
        const elements = selector ? selectElementsById(this.container, selector) : []

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
            const element = selectSingleElementById(this.container, selector)
            if (element) {
                return this.user.click(element)
            }
        })
    }

    SetValue(selector: string, value: string | boolean) {
        console.log('SetValue', selector, value)
        this.queueAction(selector, async () => {
            const element = selectSingleElementById(this.container, selector)
            if (element) {
                await setElementValue(element, this.container, this.user, value)
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
        const element = selectSingleElementById(this.container, selector)
        return element?.textContent
    }

    private queueAction(selector: string | null, fn: ActionFn) {
        const {showBeforeActions, delay} = this.options
        if (showBeforeActions && selector) {
            this.Show(selector)
        }
        this.actionQueue.queueAndWait(fn, delay)
    }
}