import renderer, {act as rtrAct} from 'react-test-renderer'
import React from 'react'
import {act, render} from '@testing-library/react'
import {treeItemSelector} from '../editor/Selectors'
import {proxify, useObjectState, useStore} from '../../src/runtime/appData'

export function asJSON(obj: object): any { return JSON.parse(JSON.stringify(obj)) }

export const componentJSON = (component: JSX.Element) => renderer.create(component).toJSON()

export const snapshot = (element: React.ReactElement) => () => expect(componentJSON(element)).toMatchSnapshot()

export const snapshotTest = (element: JSX.Element) => test(`${element.type.name} has expected structure`, snapshot(element))

export const testContainer = function (element: React.ReactElement) {
    let container: any
    act(() => {({container} = render(element))})
    return container
}

export const wait = (time: number) => new Promise(resolve => setInterval(resolve, time) )
export const actWait = async (testFn: () => void) => {
    await act(async ()=> {
        testFn()
        await wait(20)
    })
}

export const treeItemLabels = (container: any) => {
    const treeNodesShown = container.querySelectorAll(treeItemSelector)
    return [...treeNodesShown.values()].map( (it: any) => it.textContent)
}

export const componentProps = (domElement: any) => {
    const propsKey = Object.keys(domElement).find(k => k.startsWith("__reactProps$"))
    return propsKey !== undefined ? domElement[propsKey as string] : null
}

function StatefulComponent(props:{path?: string, exposeState: (state: any) => void}) {
    const {path, exposeState} = props
    const state = path === undefined ? useStore() : useObjectState(path)
    exposeState(state)
    return null
}

export function stateFor(path?: string) {
    let state: any = undefined
    rtrAct( () => {renderer.create(React.createElement(StatefulComponent, {path, exposeState: s => state = s}))} )
    return state
}

export const stateVal = (value: any, path = 'path.x') => proxify({value}, path)