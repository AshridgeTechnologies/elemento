import {notEmpty, wait, waitUntil} from '../util/helpers'
//@ts-ignore
import {caller, observer} from './postmsgRpc/client'
import userEvent from '@testing-library/user-event'

export type SelectorType = 'treeItem' | 'selectedTreeItem' | 'treeExpand' | 'button' | 'menuButton' | 'menuItem' | 'propertyField' |  'propertiesPanel' | 'propertyTypeButton' | 'id' | 'css'

export type Options = {
    showBeforeActions: boolean,
    showWithPointer: boolean,
    delay: number
}

export type ActionFn = () => void | Promise<void>

export const highlightClassName = 'editor-highlight'
const highlightStyleId = 'elementoEditorHighlight'

export const editorDialogClassName = 'editorDialogContainer'

let storedOptions: Options = {showBeforeActions: false, showWithPointer: false, delay: 500}
export const getStoredOptions = ()=> ({...storedOptions})
export const updateStoredOptions = (updates: Partial<Options>)=> {
    storedOptions = {...storedOptions, ...updates}
}

export const getOffsetWithin = (el: HTMLElement, outerEl: HTMLElement) => {
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

export const isInputElement = (el: HTMLElement) => {
    const {tagName} = el
    const type = el.getAttribute('type') ?? ''
    return tagName === 'TEXTAREA' || (tagName === 'INPUT' && ['text', 'number'].includes(type))
}

export const isSelectElement = (el: HTMLElement) => el.classList.contains('MuiSelect-select')

export const isCheckboxElement = (el: HTMLElement) => {
    const {tagName} = el
    const type = el.getAttribute('type') ?? ''
    return tagName === 'INPUT' && type === 'checkbox'
}

export const isScrollable = (el: HTMLElement) => {
    const hasOverflow = el.scrollHeight > el.clientHeight
    const {overflowY} = window.getComputedStyle(el)
    return hasOverflow && ['scroll', 'auto'].includes(overflowY)
}

export const getScrollableParent = (el: HTMLElement | null): HTMLElement => {
    if (!el || el === document.body) {
        return document.body
    } else {
        return isScrollable(el) ? el : getScrollableParent(el.parentNode as HTMLElement | null)
    }
}

export const ensureVisible = (element: HTMLElement) => {
    element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
    return waitUntil( ()=> isScrolledIntoView(element), {intervalTime: 20, timeout: 2000} )
}

export const isScrolledIntoView = (element: HTMLElement) => {
    const parent = getScrollableParent(element)
    const fudgeFactor = 1
    const topIsInView = element.offsetTop >= parent.scrollTop - fudgeFactor
    const bottomIsInView = (element.offsetTop + element.offsetHeight) <= (parent.scrollTop + parent.offsetHeight + fudgeFactor)
    return topIsInView && bottomIsInView
}

export const findByCss = (container: HTMLElement, cssSelector: string) => Array.from(container.querySelectorAll(cssSelector)) as HTMLElement[]
export const textMatch = (elementOrText: Element | string, textToMatch: string) => {
    if (!textToMatch) return true
    const regex = new RegExp(textToMatch, 'i')
    const text = typeof elementOrText === 'string' ? elementOrText : elementOrText.textContent ?? ''
    return regex.test(text)
}

export const selectElements = (selector: SelectorType, container: HTMLElement = document.body, text: string = ''): HTMLElement[] => {
    switch(selector) {
        case 'css':
            return findByCss(container, text)

        case 'id':
            return findByCss(container, `[id\$="${text}"]`)

        case 'treeItem':
            return findByCss(container, `.rc-tree-node-content-wrapper`).filter( (el) => textMatch((el as HTMLElement).title, text) )

        case 'selectedTreeItem':
            return findByCss(container, `.rc-tree-node-content-wrapper.rc-tree-node-selected`).filter( (el) => textMatch((el as HTMLElement).title, text) )

        case 'treeExpand':
            return findByCss(container, `.rc-tree-node-content-wrapper`)
                .filter( el => textMatch(el.title, text) )
                .map( el => el.parentElement?.querySelector('.rc-tree-switcher')).filter( notEmpty ) as HTMLElement[]

        case 'button':
            return findByCss(container, `button:not([data-eltype="propertyTypeButton"])`).filter(el => textMatch(el, text) )

        case 'menuButton':
            return findByCss(container, `${'.' + editorDialogClassName} .MuiToolbar-root button`).filter(el => textMatch(el, text) )

        case 'menuItem':
            return findByCss(container, `[role=menuitem]`).filter(el => textMatch(el, text) )

        case 'propertyField':
            return findByCss(container, `.MuiFormControl-root>label`).filter( (el) => textMatch(el, text)).map(el => el.parentElement ) as HTMLElement[]

        case 'propertiesPanel':
            return findByCss(container, `#propertiesPanel`)

        case 'propertyTypeButton':
            return findByCss(container, `.MuiFormControl-root>label`)
                .filter( el => textMatch(el, text))
                .map( el => el.parentElement?.parentElement?.querySelector(`[data-eltype="propertyTypeButton"]`) )
                .filter( notEmpty )as HTMLElement[]

        default:
            console.error('Unknown editor element type', selector)
            return []
    }
}

export const selectSingleElement = (selector: SelectorType, container: HTMLElement = document.body, text: string, elementIndex = 0) => {
    const element = selectElements(selector, container, text)[elementIndex]
    if (element) {
        return element
    } else {
        console.warn('Element not found:', selector, text)
        return null
    }
}

export const addPointerElement = (container: HTMLElement): SVGElement => {
    const doc = container.ownerDocument

    const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')

    svg.setAttribute('style', 'width: 25px; top: 0; left: 0; position: absolute; z-index: 2000; opacity: 0')
    svg.setAttribute('viewBox', '11.8 9 16 22')
    svg.classList.add('pointer')

    path.setAttribute('d', 'M20,21l4.5,8l-3.4,2l-4.6-8.1L12,29V9l16,12H20z')
    svg.appendChild(path)

    container.appendChild(svg)
    return svg
}

const findPointer = (container: HTMLElement) => container.querySelector('svg.pointer') as HTMLElement | null

export const showPointer = async(element: HTMLElement, container: HTMLElement) => {
    const pointerEl = findPointer(container) ?? addPointerElement(container)
    const [left, top] = getOffsetWithin(element, container)
    const pointerX = left + element.offsetWidth / 2
    const pointerY = top + element.offsetHeight / 2 + 3
    pointerEl.style.opacity = `1`

    const movePointerFrames = [{transform: `translate(${pointerX}px, ${pointerY}px)`},]
    const duration = 600
    const fill = 'forwards' as FillMode
    const options = {duration, fill, easing: 'ease'}
    await pointerEl.animate(movePointerFrames, options).finished
    const fadeFrames = [{opacity: `0`},]
    const fadeAnimation = pointerEl.animate(fadeFrames, {delay: 5000, duration: 1000})
    fadeAnimation.finished.then( () => hidePointer(container) )
}

export const hidePointer = (container: HTMLElement) => {
    const pointerEl = findPointer(container)
    if (pointerEl) pointerEl.style.opacity = `0`
}

const findElementWith = (el: Element, condition: (el: Element) => boolean) => {
    let currentEl: Element | null = el
    while (currentEl !== null && !condition(currentEl)) {
        currentEl = currentEl.parentElement
    }

    return currentEl
}

export const highlightElements = (elementIds: string[], container: HTMLElement) => {
    const findInputParentLabel = (el: Element) : Element | null => el.tagName === 'INPUT' ? findElementWith(el, el => el.tagName === 'LABEL') : null

    if (!document.getElementById(highlightStyleId)) {
        const styleEl = document.createElement('style')
        styleEl.id = highlightStyleId
        styleEl.innerHTML = `.${highlightClassName} { outline: 2px dashed orangered !important; outline-offset: 2px}`
        document.head.append(styleEl)
    }
    const oldHighlightedElements = container.querySelectorAll('.' + highlightClassName)
    oldHighlightedElements.forEach(el => el.classList.remove(highlightClassName))
    elementIds.forEach(id => {
        let matchingElements: NodeListOf<Element> | Element[] = document.querySelectorAll(`[id = '${id}']`)
        if (matchingElements.length === 0) {
            const listItemIdRegExp = /\.#[^.]+/g
            const allElementsWithId = document.querySelectorAll(`[id]`) as NodeList
            matchingElements = Array.from(allElementsWithId).filter((node) => (<Element>node).id.replace(listItemIdRegExp, '') === id) as Element[]
        }
        matchingElements.forEach(el => {
            const elToHighlight = findInputParentLabel(el) ?? el
            elToHighlight.classList.add(highlightClassName)
        })
    })
}

export const setElementValue = async (element: HTMLElement, container: HTMLElement, value: string | boolean) => {
    const textInput = isInputElement(element) ? element : element.querySelector('textarea,input[type=text],input[type=number]')
    if (textInput) {
        (textInput as HTMLInputElement).focus()
        const currentValue = (textInput as HTMLInputElement).value

        await userEvent.type(textInput, value.toString(), {
            initialSelectionStart: 0,
            initialSelectionEnd: currentValue.length,
            delay: 50
        })
    }

    const select = isSelectElement(element) ? element : element.querySelector('.MuiSelect-select')
    if (select) {
        (select as HTMLSelectElement).focus()
        await userEvent.click(select)
        await wait(700)
        const itemToSelect = Array.from(container.querySelector('[role=listbox]')?.querySelectorAll(`[role=option]`) ?? []).find(el => textMatch(el, value.toString()))
        itemToSelect && (await userEvent.click(itemToSelect))
    }

    const checkbox = (isCheckboxElement(element) ? element : element.querySelector('input[type=checkbox]')) as HTMLInputElement
    if (checkbox) {
        checkbox.focus()
        const shouldBeChecked = ['true', 'yes'].includes(value.toString().toLowerCase())
        if (checkbox.checked !== shouldBeChecked) {
            await userEvent.click(checkbox)
        }
    }
}

// from https://dev.to/doctolib/using-promises-as-a-queue-co5
class PromiseQueue {
    queue: Promise<void> = Promise.resolve()

    add(operation: ActionFn) {
        return new Promise((resolve, reject) => {
            this.queue = this.queue
                .then(operation)
                .then(resolve)
                .catch(reject)
        })
    }
}

export class ActionQueue {
    private queue = new PromiseQueue()

    queueAndWait(fn: ActionFn, delay: number) {
        let completionPromise = this.queue.add(fn)
        if (delay) {
            completionPromise = this.queue.add(() => wait(delay))
        }
        return completionPromise
    }
}
