/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {testContainer} from '../testutil/rtlHelpers'
import {useGetObjectState, useObjectState} from '../../src/runtime/index'
import {StoreProvider} from '../../src/runtime/appData'
import {equals} from 'ramda'
import {BaseComponentState} from '../../src/runtime/components/ComponentState'

let stateInParent: any = null
let stateInChild: any = null

class Thing extends BaseComponentState<{a: number, b: string}>{

    mergeProps(newState: typeof this) {
        return equals(this.props, newState.props) ? this : new Thing(newState.props)
    }
}

function Child(props: object) {
    stateInChild = useGetObjectState('app.parent')
    return createElement('div', props)
}

function Parent(props: object) {
    stateInParent = useObjectState('app.parent', new Thing({a: 10, b: 'Bee'}))
    return createElement(Child, props)
}

test('Child can get state set by parent with the same class', () => {
    testContainer(createElement(StoreProvider, null, createElement(Parent )) )
    expect(stateInParent).toMatchObject(new Thing({a: 10, b: 'Bee'}))
    expect(stateInParent).toBeInstanceOf(Thing)
    expect(stateInChild).toBe(stateInParent)
})
