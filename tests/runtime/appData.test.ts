import {createElement} from 'react'
import renderer, {act, ReactTestRenderer} from 'react-test-renderer'
import {StoreProvider, useGetObjectState, useGetStore} from '../../src/runtime/appData'
import {BaseComponentState, ComponentState} from '../../src/runtime/components/ComponentState'
import {wait} from '../testutil/testHelpers'
import {range} from 'ramda'

const runInProvider = async function (testFn: () => void, childTestFn?: () => void, repeatCount = 0) {
    function TestComponent(props: any) {
        props.testFn()
        return props.children ?? null
    }

    let rendererInstance: ReactTestRenderer

    function createProviderElement() {
        return createElement(StoreProvider, {
            children:
                createElement(TestComponent, {
                    testFn, children: childTestFn && createElement(TestComponent, {testFn: childTestFn})
                })
        })
    }

    await act(async () => {
        rendererInstance = renderer.create(createProviderElement())
        await wait(5)
    });

    for (let i = 0; i < repeatCount; i++) {
        await act(async () => {
            rendererInstance.update(createProviderElement() )
            await wait(5)
        })
    }
}

class StateObject extends BaseComponentState<object> implements ComponentState<StateObject> {

    constructor(props: object) {
        super(props)
    }
    get color() { // @ts-ignore
        return this.state.color ?? this.props.color
    }

    get length() {
        // @ts-ignore
        return this.state.length ?? this.props.length
    }

    setColor(color: string) {
        this.updateState({color})
    }

    increaseLength(amount: number) {
        this.updateState({length: this.length + amount})
    }

}

class StateObject2 extends StateObject {
}

const stateObj = (props: object) => new StateObject(props)

test('get initial state using initialiser supplied', async () => {
    const state = stateObj({widgets: {color: 'red', length: 23}})
    await runInProvider(() => {
        expect(useGetStore().setObject('TheApp.foo', state)).toBe(state)
    })
})

test('get initial state immediately without initialiser', async () => {
    const state = stateObj({widgets: {color: 'red', length: 23}})
    await runInProvider(() => {
        useGetStore().setObject('TheApp.foo', state)
        expect(useGetObjectState('TheApp.foo')).toBe(state)
    })
})

test('updates initial state object from initialiser supplied so it is available in child', async () => {
    let length = 1
    let renderCount = 0
    const state = () => stateObj({color: 'red', length: length === 1 ? length++ : length})
    const parentTestFn = () => {
        ++renderCount
        const fooState = useGetStore().setObject<StateObject>('TheApp.foo', state())
        if (renderCount === 1) {
            expect(fooState.props).toStrictEqual({color: 'red', length: 1})
        } else {
            expect(fooState.props).toStrictEqual({color: 'red', length: 2})
        }
    }
    const childTestFn = () => {
        const fooState = useGetObjectState<StateObject>('TheApp.foo')
        if (renderCount === 1) {
            expect(fooState.props).toStrictEqual({color: 'red', length: 1})
        } else {
            expect(fooState.props).toStrictEqual({color: 'red', length: 2})
        }
    }

    await runInProvider(parentTestFn, childTestFn)
    await wait(0)
    expect(renderCount).toBe(2)
})

test('can get different number of state objects on each call', async () => {
    let renderCount = 0
    const state = (length: number) => stateObj({color: 'red', length})
    const fooPath = (i: number) => `rc${i}`

    const parentTestFn = () => {
        ++renderCount
        const initialStates = Object.fromEntries( range(0, renderCount).map(i => [fooPath(i), state(i)]) )
        const fooStates = useGetStore().setObjects(initialStates, 'TheApp.foo')

        for (let i = 0; i < renderCount; i++) {
            expect((fooStates[fooPath(i)] as StateObject).props).toStrictEqual({color: 'red', length: i})
        }
    }

    const childTestFn = () => {
        const elementPaths = range(0, renderCount).map(fooPath)
        const store = useGetStore()
        const fooStates = store.useObjects(elementPaths, 'TheApp.foo')

        expect((useGetObjectState('TheApp.foo.rc0') as StateObject).props).toStrictEqual({color: 'red', length: 0})
        for (let i = 0; i < renderCount; i++) {
            expect((fooStates[fooPath(i)] as StateObject).props).toStrictEqual({color: 'red', length: i})
        }
    }

    await runInProvider(parentTestFn, childTestFn, 2)
    await wait()

    expect(renderCount).toBe(6)
})

test('keeps same state object if initialiser supplied has same properties', async () => {
    const anObj = {a: 10}
    const state = stateObj({color: 'red', length: 23, thing: anObj})
    const state2 = stateObj({color: 'red', length: 23, thing: anObj})
    await runInProvider(() => {
        expect(useGetStore().setObject('TheApp.foo', state)).toBe(state)
        expect(useGetStore().setObject('TheApp.foo', state2)).toBe(state)
    })
})

test('initial state is empty object if no initial values supplied', async () => await runInProvider(() => {
    expect(useGetStore().setObject<StateObject>('TheApp.page1.description', stateObj({})).props).toStrictEqual({})
}))

test('can get state with an element path using the app codename', async () => {
    const state = stateObj({color: 'red', length: 23})
    await runInProvider(() => {
        useGetStore().setObject('TheApp.page1.description', state)
        expect(useGetObjectState('TheApp.page1.description')).toBe(state)
    })
})

test('state object can update its own state immediately', async () => {
    const state = stateObj({color: 'red', length: 23})
    let renderCount = 0
    let fooState: any
    await runInProvider(() => {
        renderCount++
        fooState = useGetStore().setObject<StateObject>('TheApp.foo', state)
        fooState.setColor('blue')
    })
    await wait(0)
    expect(fooState.color).toBe('blue')
})

test('state object can update its own state asynchronously', async () => {
    const state = stateObj({color: 'red', length: 23})
    let renderCount = 0
    let fooState: any
    await runInProvider(() => {
        renderCount++
        fooState = useGetStore().setObject('TheApp.foo', state)
    })
    await wait(0)

    expect(fooState.color).toBe('red')
    act(() => fooState.setColor('blue'))
    expect(fooState.color).toBe('blue')
    expect(renderCount).toBe(3)
})

test('state object can update its own state in multiple separate calls immediately', async () => {
    const state = stateObj({color: 'red', length: 23})
    let renderCount = 0
    let fooState: any
    await runInProvider(() => {
        renderCount++
        fooState = useGetStore().setObject<StateObject>('TheApp.foo', state)
        fooState.setColor('blue')
        fooState.increaseLength(2)
    })
    await wait(0)
    expect(fooState.length).toBe(25)
    expect(fooState.color).toBe('blue')
})

test('state object can update its own state in multiple separate calls asynchronously', async () => {
    const state = stateObj({color: 'red', length: 23})
    let renderCount = 0
    let fooState: any
    await runInProvider(() => {
        renderCount++
        fooState = useGetStore().setObject('TheApp.foo', state)
    })
    await wait(0)

    expect(fooState.color).toBe('red')
    act(() => {
        fooState.setColor('blue')
        fooState.increaseLength(2)
    })
    expect(fooState.color).toBe('blue')
    expect(fooState.length).toBe(25)
    expect(renderCount).toBe(3)
})



test('BaseComponentState keeps same state if properties change', async () => {
    const state = stateObj({color: 'red', length: 23})._withStateForTest({color: 'blue'})
    const stateWithNewProps = state.updateFrom(stateObj({color: 'red', length: 55}))
    expect(stateWithNewProps.color).toBe('blue')
    expect(stateWithNewProps.length).toBe(55)
})

test('BaseComponentState uses constructor of new object even if props are the same', async () => {
    const state = stateObj({color: 'red', length: 23})._withStateForTest({color: 'blue'})
    const stateWithNewProps = state.updateFrom(new StateObject2({color: 'red', length: 23}))
    expect(stateWithNewProps.color).toBe('blue')
    expect(stateWithNewProps.length).toBe(23)
    expect(stateWithNewProps.constructor).toBe(StateObject2)
})

test('state object can get latest to update its own state', async () => {
    const state = stateObj({color: 'red', length: 20})
    let renderCount = 0
    let fooState: StateObject
    await runInProvider(() => {
        renderCount++
        fooState = useGetStore().setObject('TheApp.foo', state)
    })
    await wait(0)

    expect(fooState!.length).toBe(20)

    act(() => fooState.latest().increaseLength(5))
    await wait(0)

    expect(fooState!.length).toBe(25)
    act(() => fooState.latest().increaseLength(7))
    await wait(0)

    expect(fooState!.length).toBe(32)

    expect(renderCount).toBe(4)
})
