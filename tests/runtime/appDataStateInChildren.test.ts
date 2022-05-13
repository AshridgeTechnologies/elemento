/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {testContainer} from '../testutil/rtlHelpers'
import {useObjectStateWithDefaults} from '../../src/runtime/index'
import {StoreProvider} from '../../src/runtime/appData'

let stateInParent: any = null
let stateInChild: any = null

class Thing {
    constructor(public props: {a: number, b: string}) {}
}

function Child(props: object) {
    stateInChild = useObjectStateWithDefaults('app.parent')
    return createElement('div', props)
}

function Parent(props: object) {
    stateInParent = useObjectStateWithDefaults('app.parent', {a: 10, b: 'Bee', _type: Thing})
    return createElement(Child, props)
}

test('Child can get state set by parent with the same class', () => {
    testContainer(createElement(StoreProvider, null, createElement(Parent )) )
    expect(stateInParent).toStrictEqual(new Thing({a: 10, b: 'Bee'}))
    expect(stateInChild).toStrictEqual(new Thing({a: 10, b: 'Bee'}))
    expect(stateInChild).not.toBe(stateInParent)
    expect(stateInParent).toBeInstanceOf(Thing)
    expect(stateInChild).toBeInstanceOf(Thing)
})
