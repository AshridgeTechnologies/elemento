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
import ProjectHandler from '../editor/ProjectHandler'
import {ElementId} from '../model/Types'
import HotSendObservable from '../util/HotSendObservable'

export default class EditorController {
    private actionQueue = new ActionQueue()
    private options: Options = {showBeforeActions: false, showWithPointer: false, delay: 1000}
    private selectedItemIdObservable = new HotSendObservable()

    constructor(private readonly editorElement: HTMLElement, private readonly gitHubUrl: string | null, private readonly projectHandler: ProjectHandler) {
    }

    private get container(): HTMLElement { return this.editorElement }

    setSelectedItemId(id: ElementId) {
        console.log('setSelectedItemId', id)
        this.selectedItemIdObservable.send(id)
    }

    SelectedItemId() {
        return this.selectedItemIdObservable
    }

    Project() {
        return this.projectHandler.changes
    }

    SetOptions(options: Partial<Options>) {
        this.options = {...this.options, ...options}
    }

    Show(selector?: SelectorType, text?: string) {
        console.log('Show', selector, text)
        return this.queueAction(null, null, async () => {
            const elements = selector ? selectElements(selector, this.container, text) : []
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
        return this.queueAction(selector, text, () => {
            const element = selectSingleElement(selector, this.editorElement, text)
            if (element) {
                return userEvent.click(element)
            }
        })
    }

    ContextClick(selector: SelectorType, text: string) {
        console.log('ContextClick', selector, text)
        this.queueAction(selector, text, async () => {
            const element = selectSingleElement(selector, this.editorElement, text)
            if (element) {
                await userEvent.pointer([{target: element}, {keys: '[MouseRight]', target: element}])
            }
        })
    }

    SetValue(selector: SelectorType, text: string, value: string) {
        console.log('SetValue', selector, text, value)
        this.queueAction(selector, text, async () => {
            const element = selectSingleElement(selector, this.editorElement, text)
            if (element) {
                await setElementValue(element, this.container, value)
            }
        })
    }

    GetValue(selector: SelectorType, text: string) {
        console.log('GetValue', selector, text)
        const element = selectSingleElement(selector, this.editorElement, text)
        return element ? (element as HTMLInputElement).value : undefined
    }

    EnsureFormula(propertyFieldLabel: string, shouldBeFormula = true) {
        this.queueAction('propertyTypeButton', propertyFieldLabel, async () => {
            const element = selectSingleElement('propertyTypeButton', this.editorElement, propertyFieldLabel)
            if (element) {
                const currentStateIsFormula = element.textContent?.toLowerCase() === 'fx='
                if (currentStateIsFormula !== shouldBeFormula) {
                    await userEvent.click(element)
                }
            }
        })
    }

    EnsureTreeItemsExpanded(...treeItemNames: string[]) {
        treeItemNames.forEach((name) => {
            this.queueAction('treeExpand', name, async () => {
                const element = selectSingleElement('treeExpand', this.editorElement, name)
                if (element) {
                    const isClosed = element.classList.contains('rc-tree-switcher_close')
                    if (isClosed) {
                        await userEvent.click(element)
                    }
                }
            })
        })

    }

    GetGitHubUrl() {
        console.log('GetGitHubUrl', this.gitHubUrl)
        return this.gitHubUrl
    }

    GetSettings(settingsName: string) {
        return this.projectHandler.getSettings(settingsName)
    }

    UpdateSettings(settingsName: string, updates: object) {
        return this.projectHandler.updateSettings(settingsName, updates)
    }

    private queueAction(selector: SelectorType | null, text: string | null, fn: ActionFn) {
        const {showBeforeActions, delay} = this.options
        if (showBeforeActions && selector && text) {
            this.Show(selector, text)
        }
        return this.actionQueue.queueAndWait(fn, delay)
    }
}
