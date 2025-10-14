/**
 * @vitest-environment jsdom
 */
import {expect, test} from 'vitest'
import React, {createElement} from 'react'
import {componentJSON, componentJSONAsync} from '../../testutil/testHelpers'
import TextElement from '../../../src/runtime/components/TextElement'
import {NumberInput, Page, TextInput} from '../../../src/runtime/components/index'
import {use$state} from '../../../src/runtime'
import {BaseComponentStateWithProxy} from '../../../src/runtime/components/ComponentState'


class TestPageState extends BaseComponentStateWithProxy<{}> {
}

function TestPage(props: {path: string} ) {
    const pathTo = (name: string) => props.path + '.' + name

    const _state = use$state(props.path, TestPageState, {})
    const {BoxSize} = _state as any

    return React.createElement(Page, props,
        React.createElement(TextInput, {path: pathTo('Description'), initialValue: 'Big', label: 'Description'}),
        React.createElement(NumberInput, {path: pathTo('BoxSize'), initialValue: 33, label: 'Size'}),
        // @ts-ignore
        React.createElement(TextElement, {path: pathTo('Feedback'), content: 'Size is ' + BoxSize} )
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
