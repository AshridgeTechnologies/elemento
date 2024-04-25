/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {testContainer} from '../testutil/rtlHelpers'
import {useGetObjectState, useGetStore} from '../../src/runtime/index'
import {StoreProvider} from '../../src/runtime/appData'
import {BaseComponentState} from '../../src/runtime/components/ComponentState'

let stateInParent: any = null
let stateInChild: any = null

class Thing extends BaseComponentState<{a: number, b: string}>{
    get a() { return this.props.a }
    get b() { return this.props.b }
}

function Child(props: object) {
    stateInChild = useGetObjectState('app.parent')
    return createElement('div', props)
}

function Parent(props: object) {
    stateInParent = useGetStore().setObject('app.parent', new Thing({a: 10, b: 'Bee'}))
    return createElement(Child, props)
}

test('Child can get state set by parent with the same class', () => {
    testContainer(createElement(StoreProvider, null, createElement(Parent)))
    expect(stateInChild).toBeInstanceOf(Thing)
    expect(stateInChild.a).toBe(10)
    expect(stateInChild.b).toBe('Bee')
    expect(stateInChild).toBe(stateInParent)
})
