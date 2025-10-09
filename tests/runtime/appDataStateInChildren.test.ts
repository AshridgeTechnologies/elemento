/**
 * @vitest-environment jsdom
 */
import {expect, test} from 'vitest'
import {createElement} from 'react'
import {testContainer} from '../testutil/rtlHelpers'
import {use$state} from '../../src/runtime/state/appStateHooks'
import {BaseComponentState} from '../../src/runtime/components/ComponentState2'

import {StoreProvider} from '../../src/runner/StoreContext'
import {wait} from '../testutil/testHelpers'

let stateInParent: any = null
let stateInChild: any = null

class Thing extends BaseComponentState<{a: number, b: string}>{
    get a() { return this.props.a }
    get b() { return this.props.b }
}

function Child(props: object) {
    stateInChild = use$state('app.parent.child', Thing, {a: 10, b: 'Bee'})
    return createElement('div', props)
}

function Parent(props: object) {
    stateInParent = use$state('app.parent.child')
    return createElement(Child, props)
}

test('Parent can get state set by child with the same class', async () => {
    testContainer(createElement(StoreProvider, null, createElement(Parent)))
    await wait()
    expect(stateInChild).toBeInstanceOf(Thing)
    expect(stateInChild.a).toBe(10)
    expect(stateInChild.b).toBe('Bee')
    expect(stateInParent._raw).toBe(stateInChild._raw)
})
