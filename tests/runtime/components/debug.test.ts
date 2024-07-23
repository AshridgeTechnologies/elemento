/**
 * @jest-environment jsdom
 */

import * as Elemento from '../../../src/runtime/index'

import React, {createElement} from 'react'
import {wait} from '../../testutil/testHelpers'
import {testContainer} from '../../testutil/rtlHelpers'

function Page1(props: any) {
    const pathWith = (name: string) => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const {Sum} = Elemento.globalFunctions
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    // @ts-ignore
    return React.createElement(Page, {id: props.path as any},
        React.createElement(TextElement, {path: pathWith('t1'), content: 'x', styles: {width: Sum(10, 20, 30) as number}}),
    )
}

test('Page element evaluates debug info and sends event and updates if debug expr changes', async () => {
    (window as any).elementoDebugExpr = `({'styles.width': () => Sum(10, 20, 30)})`
    let event: CustomEvent
    const listener = ((evt: CustomEvent) => event = evt) as unknown as EventListener
    window.addEventListener('debugData', listener)
    const component = createElement(Page1, {path: 'page1'})
    const {el} = testContainer(component)
    expect(event!.detail).toStrictEqual({'styles.width': 60});

    (window as any).elementoDebugExpr = `({foo: () => 42 + 7})`
    window.dispatchEvent(new CustomEvent('debugExpr', {detail: {foo: `42 + 7`}}))
    await wait()
    expect(event!.detail).toStrictEqual({foo: 49});
})

test('Page element traps errors in debug exprs and returns error result', async () => {
    (window as any).elementoDebugExpr = `({t2: () => xxx.value })`
    let event: CustomEvent
    const listener = ((evt: CustomEvent) => event = evt) as unknown as EventListener
    window.addEventListener('debugData', listener)
    const component = createElement(Page1, {path: 'page1'})
    const {el} = testContainer(component)
    expect(event!.detail).toStrictEqual({t2: {_error: 'ReferenceError: xxx is not defined'} })
})

test('Page element traps errors in evaluating debug exprs and returns error result', async () => {
    (window as any).elementoDebugExpr = `const app = null\nconst {CurrentUrl} = app;`
    let event: CustomEvent
    const listener = ((evt: CustomEvent) => event = evt) as unknown as EventListener
    window.addEventListener('debugData', listener)
    const component = createElement(Page1, {path: 'page1'})
    const {el} = testContainer(component)
    expect(event!.detail).toStrictEqual({_error: "TypeError: Cannot destructure property 'CurrentUrl' of 'app' as it is null."})
})
