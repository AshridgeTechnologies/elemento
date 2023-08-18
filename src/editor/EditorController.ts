import userEvent from '@testing-library/user-event'
import {
    ActionFn,
    ActionQueue,
    ensureVisible,
    hidePointer,
    highlightElements,
    Options,
    selectElements,
    SelectorType,
    selectSingleElement,
    setElementValue,
    showPointer
} from './controllerHelpers'


export default class EditorController {
    private user = userEvent.setup({delay: 20})
    private actionQueue = new ActionQueue()
    private options: Options = {showBeforeActions: false, showWithPointer: false, delay: 1000}

    constructor(private readonly editorElement: HTMLElement) {
    }

    private get container(): HTMLElement { return this.editorElement }

    SetOptions(options: Partial<Options>) {
        this.options = {...this.options, ...options}
    }

    Show(selector?: SelectorType, text?: string) {
        console.log('Show', selector, text)
        this.queueAction(null, null, async () => {
            const elements = selector ? selectElements(selector, text) : []
            highlightElements(elements, this.container)
            if (elements.length === 1) {
                await ensureVisible(elements[0])
                if (this.options.showWithPointer) {
                    await showPointer(elements[0], this.container)
                }
            } else {
                hidePointer(this.container)
            }
        })
    }

    Click(selector: SelectorType, text: string) {
        console.log('Click', selector, text)
        this.queueAction(selector, text, () => {
            const element = selectSingleElement(selector, text)
            if (element) {
                return this.user.click(element)
            }
        })
    }

    ContextClick(selector: SelectorType, text: string) {
        console.log('ContextClick', selector, text)
        this.queueAction(selector, text, () => {
            const element = selectSingleElement(selector, text)
            if (element) {
                return this.user.pointer([{target: element}, {keys: '[MouseRight]', target: element}])
            }
        })
    }

    SetValue(selector: SelectorType, text: string, value: string) {
        console.log('SetValue', selector, text, value)
        this.queueAction(selector, text, async () => {
            const element = selectSingleElement(selector, text)
            if (element) {
                await setElementValue(element, this.container, this.user, value)
            }
        })
    }

    EnsureFormula(propertyFieldLabel: string, shouldBeFormula = true) {
        this.queueAction('propertyTypeButton', propertyFieldLabel, async () => {
            const element = selectSingleElement('propertyTypeButton', propertyFieldLabel)
            if (element) {
                const currentStateIsFormula = element.textContent?.toLowerCase() === 'fx='
                if (currentStateIsFormula !== shouldBeFormula) {
                    await this.user.click(element)
                }
            }
        })
    }

    EnsureTreeItemsExpanded(...treeItemNames: string[]) {
        treeItemNames.forEach((name) => {
            this.queueAction('treeExpand', name, async () => {
                const element = selectSingleElement('treeExpand', name)
                if (element) {
                    const isClosed = element.classList.contains('rc-tree-switcher_close')
                    if (isClosed) {
                        await this.user.click(element)
                    }
                }
            })
        })

    }

    private queueAction(selector: SelectorType | null, text: string | null, fn: ActionFn) {
        const {showBeforeActions, delay} = this.options
        if (showBeforeActions && selector && text) {
            this.Show(selector, text)
        }
        this.actionQueue.queueAndWait(fn, delay)
    }
}
