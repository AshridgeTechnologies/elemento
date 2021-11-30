import renderer, {act, create, ReactTestInstance, ReactTestRenderer} from 'react-test-renderer'
import React from 'react'
import TextInput from '../../src/runtime/TextInput'
import {render} from '@testing-library/react'

export function asJSON(obj: object): any { return JSON.parse(JSON.stringify(obj)) }

export const componentJSON = (component: JSX.Element) => renderer.create(component).toJSON()

export const snapshot = (element: React.ReactElement) => () => expect(componentJSON(element)).toMatchSnapshot()

export const snapshotTest = (element: JSX.Element) => test(`${element.type.name} has expected structure`, snapshot(element))

export const rendererRoot = (element: React.ReactElement): ReactTestInstance  => {
    let testRenderer: ReactTestRenderer
    act(() => {testRenderer = renderer.create(React.createElement(TextInput, {path: 'page1.widget', initialValue: 'Hi!'}))})
    return testRenderer!.root
}

export const testContainer = function (element: React.ReactElement) {
    let container: any
    act(() => {({container} = render(element))})
    return container
}

