import {act, fireEvent, render} from '@testing-library/react'
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
