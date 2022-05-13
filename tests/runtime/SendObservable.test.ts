import SendObservable from '../../src/runtime/SendObservable'

test('can add and remove multiple subscribers', function () {
    const obs = new SendObservable()
    let s1Val, s2Val
    const s1 = obs.subscribe((n) => s1Val = n)
    const s2 = obs.subscribe({
        next(n) {
            s2Val = n
        }
    })

    obs.send(2)
    expect(s1Val).toBe(2)
    expect(s2Val).toBe(2)

    s1.unsubscribe()
    obs.send(3)
    expect(s1Val).toBe(2)
    expect(s2Val).toBe(3)

    s2.unsubscribe()
    obs.send(4)
    expect(s1Val).toBe(2)
    expect(s2Val).toBe(3)

})

test('can map to another observable', function () {
    const obs = new SendObservable<number>()
    const mappedObs = obs.map((x: number) => x * 2)

    const vals = [] as number[]
    mappedObs.subscribe(v => vals.push(v))
    obs.send(1)
    obs.send(2)

    expect(vals).toStrictEqual([2, 4])
})

test('can filter to another observable', function () {
    const obs = new SendObservable<number>()
    const mappedObs = obs.filter((x: number) => x > 5)

    const vals = [] as number[]
    mappedObs.subscribe(v => vals.push(v))
    obs.send(2)
    obs.send(7)
    obs.send(3)
    obs.send(8)

    expect(vals).toStrictEqual([7, 8])
})

test('can send error event', function () {
    const obs = new SendObservable()
    let err = null
    obs.subscribe({
        next: () => {
        },
        error: e => err = e,
        complete: () => {
        },
    })

    obs.error(27)

    expect(err).toBe(27)
})

test('can send error and complete events', function () {
    const obs = new SendObservable()
    let completed = false
    obs.subscribe({
        next: () => {
        },
        error: () => {
        },
        complete: () => completed = true,
    })

    obs.complete()
    expect(completed).toBe(true)
})