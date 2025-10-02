import {afterEach, beforeEach, expect, test, vi} from "vitest"
/**
 * @vitest-environment jsdom
 */
import * as Elemento from '../../../src/runtime/index'
import {elProps, stateProps, wrapFn} from '../../../src/runtime/index'

import React, {createElement} from 'react'
import {wait} from '../../testutil/testHelpers'
import {testContainer} from '../../testutil/rtlHelpers'
import {lastTrace} from '../../../src/runtime/debug'

import * as notifications from '../../../src/runtime/components/notifications'

vi.mock('../../../src/runtime/components/notifications')

let originalConsoleError: any
let mockConsoleError: any
beforeEach(() => {
    vi.clearAllMocks()
    originalConsoleError = console.error
    console.error = mockConsoleError = vi.fn()
    vi.spyOn(notifications, 'addNotification').mockReturnValue(true)
})

afterEach(() => {
    console.error = originalConsoleError
})

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
    (window as any).elementoDebugExpr = `({t1: () => 10 + 20, t2: () => xxx.value })`
    let event: CustomEvent
    const listener = ((evt: CustomEvent) => event = evt) as unknown as EventListener
    window.addEventListener('debugData', listener)
    const component = createElement(Page1, {path: 'page1'})
    const {el} = testContainer(component)
    expect(event!.detail).toStrictEqual({t1: 30, t2: {_error: 'ReferenceError: xxx is not defined'} })
})

test('Page element traps uncloneable values in debug exprs and returns JSON copy or error result', async () => {
    (window as any).elementoDebugExpr = `({t1: () => 10 + 20, t2: () => Date, t3: () => ({ x: 10, doStuff() { console.log('Doing stuff') } }) })`
    let event: CustomEvent
    const listener = ((evt: CustomEvent) => event = evt) as unknown as EventListener
    window.addEventListener('debugData', listener)
    const component = createElement(Page1, {path: 'page1'})
    const {el} = testContainer(component)
    expect(event!.detail).toStrictEqual({t1: 30, t2: {_error: 'Value unavailable'}, t3: {x: 10} })
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

test('elProps builds path and properties with chaining and tracing before each property until get props', () => {
    const builder = elProps('Comp1')
    builder.prop1('abc').prop2(99)
    expect(lastTrace()).toStrictEqual({component: 'Comp1', property: 'prop2'})
    expect(builder.props).toStrictEqual({path: 'Comp1', prop1: 'abc', prop2: 99})
    expect(lastTrace()).toBe(null)
})

test('stateProps builds properties only', () => {
    const builder = stateProps('Comp1')
    builder.prop1('abc').prop2(99)
    expect(lastTrace()).toStrictEqual({component: 'Comp1', property: 'prop2'})
    expect(builder.props).toStrictEqual({prop1: 'abc', prop2: 99})
})

test('elProps saves last trace before an exception', () => {
    const builder = elProps('Comp1')
    const excp = () => {
        throw new Error('aaagh')
    }
    expect(()=> builder.prop1('abc').prop2(excp()).prop3(true)).toThrow('aaagh')
    expect(lastTrace()).toStrictEqual({component: 'Comp1', property: 'prop2'})
})

test('wrapFn returns function that passes on args and returns normal result if no errors', () => {
    const doStuff = (length: number) => {
        return 'Good result: ' + length
    }

    const wrappedFn = wrapFn(doStuff, null, 'AComponent', 'DoYourStuff')
    expect(wrappedFn(99)).toBe('Good result: 99')
    expect(notifications.addNotification).not.toHaveBeenCalled()
})

test('wrapFn returns function that passes on args and notifies errors in normal results', () => {
    const doStuff = (length: number) => {
        throw new Error('Bad result: ' + length)
    }

    const wrappedFn = wrapFn(doStuff, null, 'AComponent', 'DoYourStuff')
    wrappedFn(99)
    expect(notifications.addNotification).toHaveBeenCalledWith('error', 'Error: Bad result: 99', 'in the Do Your Stuff property of element AComponent', 30000)
    expect(mockConsoleError).toHaveBeenCalledWith(new Error('Bad result: 99'))
})

test('wrapFn returns function that does not log to console if not notified ', () => {
    const doStuff = (length: number) => {
        throw new Error('Bad result: ' + length)
    }
    vi.spyOn(notifications, 'addNotification').mockReturnValue(false)

    const wrappedFn = wrapFn(doStuff, null, 'AComponent', 'DoYourStuff')
    wrappedFn(99)
    expect(notifications.addNotification).toHaveBeenCalledWith('error', 'Error: Bad result: 99', 'in the Do Your Stuff property of element AComponent', 30000)
    expect(mockConsoleError).not.toHaveBeenCalled()
})

test('wrapFn returns function that passes on args and returns promise if no errors', async () => {
    const doStuff = async (length: number) => {
        return 'Good result: ' + length
    }

    const wrappedFn = wrapFn(doStuff, null, 'AComponent', 'DoYourStuff')
    await expect(wrappedFn(99)).resolves.toBe('Good result: 99')
    expect(notifications.addNotification).not.toHaveBeenCalled()
})

test('wrapFn returns function that notifies errors in promises', async () => {
    const doStuff = async (length: number) => {
        throw new Error('Bad result: ' + length)
    }

    const wrappedFn = wrapFn(doStuff, null, 'AComponent', 'DoYourStuff')
    await wrappedFn(99)
    expect(notifications.addNotification).toHaveBeenCalledWith('error', 'Error: Bad result: 99', 'in the Do Your Stuff property of element AComponent', 30000)
    expect(mockConsoleError).toHaveBeenCalledWith(new Error('Bad result: 99'))
})
