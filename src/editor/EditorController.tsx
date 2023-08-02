import userEvent from '@testing-library/user-event'
import PQueue from 'p-queue'
import {notEmpty, waitUntil} from '../util/helpers'
import {editorElement, editorPointerElement} from './Editor'
import {fireEvent} from '@testing-library/react'

const highlightClassName = 'editor-highlight'

type SelectorType = 'treeItem' | 'selectedTreeItem' | 'treeExpand' | 'button' | 'menuItem' | 'propertyField' | 'propertyTypeButton'

const wait = (time: number = 200): Promise<void> => new Promise(resolve => setTimeout(resolve, time))

const getOffsetWithin = (el: HTMLElement, outerEl: HTMLElement) => {
    let offsetX = el.offsetLeft, offsetY = el.offsetTop
    let currentEl: HTMLElement | null = el.parentNode as HTMLElement
    while (currentEl && currentEl !== outerEl) {
        offsetY -= currentEl.scrollTop
        const elStyle = window.getComputedStyle(currentEl)
        if (elStyle.position === 'absolute' || elStyle.position === 'relative') {
            offsetX += currentEl.offsetLeft
            offsetY += currentEl.offsetTop
        }
        currentEl = currentEl.parentNode as HTMLElement
    }
    return [offsetX, offsetY]
}

const isScrollable = (el: HTMLElement) => {
    const hasOverflow = el.scrollHeight > el.clientHeight
    const {overflowY} = window.getComputedStyle(el)
    return hasOverflow && ['scroll', 'auto'].includes(overflowY)
}

const getScrollableParent = (el: HTMLElement | null): HTMLElement => {
    if (!el || el === document.body) {
        return document.body
    } else {
        return isScrollable(el) ? el : getScrollableParent(el.parentNode as HTMLElement | null)
    }
}

const ensureVisible = (element: HTMLElement) => {
    element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
    return waitUntil( ()=> isScrolledIntoView(element), 20, 2000 )
}

const isScrolledIntoView = (element: HTMLElement) => {
    const parent = getScrollableParent(element)
    const fudgeFactor = 1
    const topIsInView = element.offsetTop >= parent.scrollTop - fudgeFactor
    const bottomIsInView = (element.offsetTop + element.offsetHeight) <= (parent.scrollTop + parent.offsetHeight + fudgeFactor)
    return topIsInView && bottomIsInView
}

const els = (cssSelector: string) => Array.from(document.querySelectorAll(cssSelector)) as HTMLElement[]
const textMatch = (elementOrText: Element | string, textToMatch: string) => {
    if (!textToMatch) return true
    const regex = new RegExp(textToMatch, 'i')
    const text = typeof elementOrText === 'string' ? elementOrText : elementOrText.textContent ?? ''
    return regex.test(text)
}
const selectElements = (selector: SelectorType, text: string = ''): HTMLElement[] => {
    switch(selector) {
        case 'treeItem':
            return els(`.rc-tree-node-content-wrapper`).filter( (el) => textMatch((el as HTMLElement).title, text) )

        case 'selectedTreeItem':
            return els(`.rc-tree-node-content-wrapper.rc-tree-node-selected`).filter( (el) => textMatch((el as HTMLElement).title, text) )

        case 'treeExpand':
            return els(`.rc-tree-node-content-wrapper`)
                .filter( el => textMatch(el.title, text) )
                .map( el => el.parentElement?.querySelector('.rc-tree-switcher')).filter( notEmpty ) as HTMLElement[]

        case 'button':
            return els(`button:not([data-eltype="propertyTypeButton"])`).filter( el => textMatch(el, text) )

        case 'menuItem':
            return els(`[role=menuitem]`).filter( el => textMatch(el, text) )

        case 'propertyField':
            return els(`.MuiFormControl-root>label`).filter( (el) => textMatch(el, text)).map( el => el.parentElement ) as HTMLElement[]

        case 'propertyTypeButton':
            return els(`.MuiFormControl-root>label`)
                .filter( el => textMatch(el, text))
                .map( el => el.parentElement?.parentElement?.querySelector(`[data-eltype="propertyTypeButton"]`) )
                .filter( notEmpty )as HTMLElement[]

        default:
            console.error('Unknown editor element type', selector)
            return []
    }
}

const selectSingleElement = (selector: SelectorType, text: string) => {
    const element = selectElements(selector, text)[0]
    if (element) {
        return element
    } else {
        console.warn('Element not found:', selector, text)
        return null
    }
}

type Options = {
    showBeforeActions: boolean,
    showWithPointer: boolean,
    delay: number
}

type ActionFn = () => void | Promise<void>

export class EditorController {
    private user = userEvent.setup({delay: 20})
    private actionQueue = new PQueue({concurrency: 1})
    private pointerEl = editorPointerElement()
    private options: Options = {showBeforeActions: false, showWithPointer: false, delay: 1000}

    SetOptions(options: Partial<Options>) {
        this.options = {...this.options, ...options}
    }

    Show(selector?: SelectorType, text?: string) {
        console.log('Show', selector, text)
        this.queue(async () => {
            const oldHighlightedElements = document.querySelectorAll('.' + highlightClassName)
            oldHighlightedElements.forEach(el => el.classList.remove(highlightClassName))

            const elements = selector ? selectElements(selector, text) : []
            elements.forEach(el => el.classList.add(highlightClassName))
            if (elements.length === 1) {
                await ensureVisible(elements[0])
                if (this.options.showWithPointer) {
                    await this.showPointer(elements[0])
                }
            } else {
                this.hidePointer()
            }
        })
        this.wait(1000)
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
            if (!element) {
                return
            }

            const textInput = element.querySelector('textarea,input[type=text],input[type=number]')
            if (textInput) {
                fireEvent.focus(textInput)
                const currentValue = (textInput as HTMLInputElement).value

                await this.user.type(textInput, value.toString(), {
                    initialSelectionStart: 0,
                    initialSelectionEnd: currentValue.length
                })
            }

            const select = element.querySelector('.MuiSelect-select')
            if (select) {
                fireEvent.focus(select)
                await this.user.click(select)
                await wait(700)
                const itemToSelect = Array.from(document.querySelector('[role=listbox]')?.querySelectorAll(`[role=option]`) ?? []).find( el => textMatch(el, value) )
                itemToSelect && await this.user.click(itemToSelect)
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

    private async showPointer(element: HTMLElement) {
        if (!this.pointerEl) return
        const [left, top] = getOffsetWithin(element, editorElement()!)
        const pointerX = left + element.offsetWidth / 2
        const pointerY = top + element.offsetHeight / 2 + 3
        this.pointerEl.style.opacity = `1`

        const movePointerFrames = [{transform: `translate(${pointerX}px, ${pointerY}px)`},]
        const duration = 600
        const fill = 'forwards' as FillMode
        const options = {duration, fill, easing: 'ease'}
        await this.pointerEl.animate(movePointerFrames, options).finished
        const fadeFrames = [{opacity: `0`},]
        const fadeAnimation = this.pointerEl.animate(fadeFrames, {delay: 5000, duration: 1000})
        fadeAnimation.finished.then( () => this.hidePointer() )
    }

    private hidePointer() {
        if (!this.pointerEl) return
        this.pointerEl.style.opacity = `0`
    }

    private queueAction(selector: SelectorType, text: string, fn: ActionFn) {
        const {showBeforeActions, delay} = this.options
        if (showBeforeActions) {
            this.Show(selector, text)
        }
        this.queueAndWait(fn)
    }

    private queue(fn: ActionFn) {
        this.actionQueue.add(fn)
    }

    private queueAndWait(fn: ActionFn) {
        this.queue(fn)
        const {delay} = this.options
        if (delay) {
            this.wait(delay)
        }
    }

    private wait(delay: number) {
        this.queue(() => wait(delay))
    }
}