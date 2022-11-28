import {createElement} from 'react'
import renderer, {act} from 'react-test-renderer'
import {StoreProvider, useGetObjectState, useObjectState} from '../../src/runtime/appData'
import {BaseComponentState, ComponentState} from '../../src/runtime/components/ComponentState'
import {wait} from '../testutil/testHelpers'

const runInProvider = async function (testFn: () => void, childTestFn?: () => void) {
    function TestComponent(props: any) {
        props.testFn()
        return props.children ?? null
    }

    await act(async () => {
        renderer.create(createElement(StoreProvider, {
            children:
                createElement(TestComponent, {
                    testFn, children: childTestFn && createElement(TestComponent, {testFn: childTestFn})
                })
        }))
        await wait(5)
    })

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

const stateObj = (props: object) => new StateObject(props)

test('get initial state using initialiser supplied', async () => {
    const state = stateObj({widgets: {color: 'red', length: 23}})
    await runInProvider(() => {
        expect(useObjectState('app.foo', state)).toBe(state)
    })
})

test('get initial state immediately without initialiser', async () => {
    const state = stateObj({widgets: {color: 'red', length: 23}})
    await runInProvider(() => {
        useObjectState('app.foo', state)
        expect(useGetObjectState('app.foo')).toBe(state)
    })
})

test('updates initial state object from initialiser supplied so it is available in child', async () => {
    let length = 1
    let renderCount = 0
    const state = () => stateObj({color: 'red', length: length === 1 ? length++ : length})
    const parentTestFn = () => {
        ++renderCount
        const fooState = useObjectState<StateObject>('app.foo', state())
        if (renderCount === 1) {
            expect(fooState.props).toStrictEqual({color: 'red', length: 1})
        } else {
            expect(fooState.props).toStrictEqual({color: 'red', length: 2})
        }
    }
    const childTestFn = () => {
        const fooState = useGetObjectState<StateObject>('app.foo')
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

test('keeps same state object if initialiser supplied has same properties', async () => {
    const anObj = {a: 10}
    const state = stateObj({color: 'red', length: 23, thing: anObj})
    const state2 = stateObj({color: 'red', length: 23, thing: anObj})
    await runInProvider(() => {
        expect(useObjectState('app.foo', state)).toBe(state)
        expect(useObjectState('app.foo', state2)).toBe(state)
    })
})

test('initial state is empty object if no initial values supplied', async () => await runInProvider(() => {
    expect(useObjectState<StateObject>('app.page1.description', stateObj({})).props).toStrictEqual({})
}))

test('can get state with an element path and normalise first part to "app"', async () => {
    const state = stateObj({color: 'red', length: 23})
    await runInProvider(() => {
        useObjectState('app.page1.description', state)
        expect(useGetObjectState('BigApp.page1.description')).toBe(state)
    })
})

test('state object can update its own state immediately', async () => {
    const state = stateObj({color: 'red', length: 23})
    let renderCount = 0
    let fooState: any
    await runInProvider(() => {
        renderCount++
        fooState = useObjectState<StateObject>('app.foo', state)
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
        fooState = useObjectState('app.foo', state)
    })
    await wait(0)

    expect(fooState.color).toBe('red')
    act(() => fooState.setColor('blue'))
    expect(fooState.color).toBe('blue')
    expect(renderCount).toBe(3)
})

test('BaseComponentState keeps same state if properties change', async () => {
    const state = stateObj({color: 'red', length: 23})._withStateForTest({color: 'blue'})
    const stateWithNewProps = state.updateFrom(stateObj({color: 'red', length: 55}))
    expect(stateWithNewProps.color).toBe('blue')
    expect(stateWithNewProps.length).toBe(55)
})

test('state object can get latest to update its own state', async () => {
    const state = stateObj({color: 'red', length: 20})
    let renderCount = 0
    let fooState: StateObject
    await runInProvider(() => {
        renderCount++
        fooState = useObjectState('app.foo', state)
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
