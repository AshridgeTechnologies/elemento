import {act, fireEvent, render, RenderResult} from '@testing-library/react'
import {treeExpandControlSelector} from '../editor/Selectors'
import React from 'react'

export const testContainer = function (element: React.ReactElement) {
    let container: any
    act(() => {
        ({container} = render(element))
    })
    return container!
}

export const testContainerWait = async (element: React.ReactElement) => {
    let container: HTMLElement
    await actWait(() => {
        ({container} = render(element))
    })
    return container!
}

const doNothingJustWait = () => {}

export const wait = (time: number): Promise<void> => new Promise(resolve => setTimeout(resolve, time))
export const actWait = async (testFn: () => void = doNothingJustWait) => await act(async () => {
    testFn()
    await wait(5)
})
export const clickExpandControlFn = (container: any) => async (...indexes: number[]) => {
    for (const index of indexes) await actWait(() => fireEvent.click(container.querySelectorAll(treeExpandControlSelector)[index]))
}
type ElOrSel = HTMLElement | string
export const addContainer = (documentEl: Document = document) => {

    const containerEl = documentEl.createElement('div')
    documentEl.body.appendChild(containerEl)
    return containerFunctions(containerEl)
}
export const containerFunctions = (container: HTMLElement) => {
    let renderResult: RenderResult
    const renderThe = (element: React.ReactElement) => {
        renderResult = render(element, {container})
    }
    const renderIt = (element: React.ReactElement) => render(element, {container})
    const elIn = (containingEl: HTMLElement, selector: string): HTMLElement => {
        return containingEl.querySelector(`[id$="${selector}"]`) as HTMLElement
            || renderResult.getByText(selector)
    }
    const element = (elOrSelector: ElOrSel): HTMLElement => elOrSelector instanceof HTMLElement ? elOrSelector : elIn(container, elOrSelector)
    const expectEl = (elOrSel: ElOrSel) => expect(element(elOrSel))
    const enter = (elOrSel: ElOrSel, text: string) => actWait(() => fireEvent.input(element(elOrSel), {target: {value: text}}))
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