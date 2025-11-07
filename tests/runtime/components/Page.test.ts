/**
 * @vitest-environment jsdom
 */
import {expect, test} from 'vitest'
import React, {createElement} from 'react'
import {componentJSON, componentJSONAsync, DEBUG_TIMEOUT, wait, wrappedTestElement} from '../../testutil/testHelpers'
import TextElement from '../../../src/runtime/components/TextElement'
import {NumberInput, Page, TextInput} from '../../../src/runtime/components/index'
import {useComponentState} from '../../../src/runtime'
import {BaseComponentState} from '../../../src/runtime/state/BaseComponentState'
import {render} from '@testing-library/react'


class TestPageState extends BaseComponentState<{}> {
}

function TestPage(props: {path: string} ) {
    const pathTo = (name: string) => props.path + '.' + name

    const _state = useComponentState(props.path, TestPageState, {})
    const {BoxSize} = _state as any

    return React.createElement(Page, props,
        React.createElement(TextInput, {path: pathTo('Description'), initialValue: 'Big', label: 'Description'}),
        React.createElement(NumberInput, {path: pathTo('BoxSize'), initialValue: 33, label: 'Size'}),
        // @ts-ignore
        React.createElement(TextElement, {path: pathTo('Feedback'), content: 'Size is ' + BoxSize} )
    )
}

class CircularRefPageState extends BaseComponentState<{}> {
}

function CircularRefPage(props: {path: string} ) {
    const pathTo = (name: string) => props.path + '.' + name

    const _state = useComponentState(props.path, CircularRefPageState, {})
    const {Val1, Val2} = _state as any

    console.log('CircularRefPage render')
    return React.createElement(Page, props,
        React.createElement(TextInput, {path: pathTo('Val 1'), initialValue: Val2 + 'x', label: 'Value 1'}),
        React.createElement(TextInput, {path: pathTo('Val 2'), initialValue: Val1 + 'y', label: 'Value 2'}),
        // @ts-ignore
    )
}

test('Page element produces output containing children', () => {
    const child = createElement(TextElement, {path: 'page1.para1', styles: {maxWidth: 200}, content: 'Hello\nwhere are you'})
    const component = createElement(Page, {path: 'page1'}, child)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('TestPage produces output with correct values from child elements', async () => {
    const component = createElement(TestPage, {path: 'page1'})
    expect(await componentJSONAsync(component)).toMatchSnapshot()
})

// cannot provoke endless loop of updates that occurs in browser
test.skip('CircularRefPage does something sensible', async () => {

    const [page, appStoreHook] = wrappedTestElement(CircularRefPage)

    const stateAt = (path: string) => appStoreHook.stateAt(path)

    const {container} = render(page('app.page1', {}))
    await wait(1000)
    console.log(container.innerHTML)
    expect(container.innerHTML).toContain('Value 1')
}, DEBUG_TIMEOUT)
