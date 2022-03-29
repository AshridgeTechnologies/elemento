import React from 'react'
import {act, fireEvent, render} from '@testing-library/react'

type ElOrSel = HTMLElement | string
export const addContainer = (documentEl: Document = document) => {

    const containerEl = documentEl.createElement('div')
    documentEl.body.appendChild(containerEl)
    return containerFunctions(containerEl)
}

export const containerFunctions = (container: HTMLElement) => {
    const renderThe = (element: React.ReactElement) => act( () => {render(element, {container})})
    const renderIt = (element: React.ReactElement) => render(element, {container})
    const elIn = (containingEl: HTMLElement, selector: string): HTMLElement => containingEl.querySelector(`[id$="${selector}"]`) as HTMLElement
    const element = (elOrSelector: ElOrSel): HTMLElement => elOrSelector instanceof HTMLElement ? elOrSelector : elIn(container, elOrSelector)
    const expectEl = (elOrSel: ElOrSel) => expect(element(elOrSel))
    const enter = (elOrSel: ElOrSel, text: string) => fireEvent.input(element(elOrSel), {target: {value: text}})
    const click = (elOrSel: ElOrSel, options: object = {}) => {
        fireEvent(element(elOrSel),
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                ...options
            })
        )
    }

    const el = ([s]: TemplateStringsArray) => {
        return element(s)
    }

    return {domContainer: container, renderThe, renderIt, elIn, el, expectEl, enter, click}
}
