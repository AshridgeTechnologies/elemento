import {act, fireEvent, render, RenderResult, screen} from '@testing-library/react/pure'
import userEvent from '@testing-library/user-event'
import {treeExpandControlSelector} from '../editor/Selectors'
import React from 'react'
import {doNothing, wait} from './testHelpers'

export const actWait = async (testFnOrTime: (() => void) | number = doNothing) => await act(async () => {
    if (typeof testFnOrTime === 'function') {
        testFnOrTime()
        await wait(5)
    } else {
        await wait(testFnOrTime)
    }
})
export const clickExpandControlFn = (container: any) => async (...indexes: number[]) => {
    for (const index of indexes) await actWait(() => fireEvent.click(container.querySelectorAll(treeExpandControlSelector)[index]))
}
type ElOrSel = HTMLElement | string
export const testContainer = (element: React.ReactElement | null = null, containerId = 'testContainer') => {

    const addTestContainer = () => {
        const el = document.createElement('div')
        el.id = containerId
        document.body.appendChild(el)
        return el
    }
    const containerEl = document.getElementById(containerId) || addTestContainer()
    const functions = containerFunctions(containerEl)
    if (element) {
        functions.renderThe(element)
    }
    return functions
}
export const containerFunctions = (container: HTMLElement) => {
    let renderResult: RenderResult
    const renderThe = (element: React.ReactElement) => {
        renderResult = render(element, {container})
    }
    const elIn = (containingEl: HTMLElement, selector: string): HTMLElement => {
        return containingEl.querySelector(selector) as HTMLElement
        ?? containingEl.querySelector(`[id$="${selector}"]`) as HTMLElement
            ?? renderResult.queryByLabelText(selector)
            ?? renderResult.queryByText(selector)
            // ?? screen.getByText(selector)
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

    const el = ([s]: TemplateStringsArray): any => element(s)
    const querySelector = (selector: string): HTMLElement => container.querySelector(selector)!
    const user = userEvent.setup()
    return {domContainer: container, renderThe, elIn, el, element, querySelector, expectEl, user, enter, click}
}