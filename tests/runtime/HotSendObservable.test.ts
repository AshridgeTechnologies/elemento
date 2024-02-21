import HotSendObservable from '../../src/util/HotSendObservable'
import {wait} from '../testutil/testHelpers'

test('new subscribers get immediate callback after first value sent', async () => {
    const obs = new HotSendObservable()
    const nextCallback1 = jest.fn(), nextCallback2 = jest.fn()
    obs.subscribe(nextCallback1)

    expect(nextCallback1).not.toHaveBeenCalled()
    obs.send(2)
    expect(nextCallback1).toHaveBeenCalledWith(2)

    obs.subscribe(nextCallback2)
    await wait()
    expect(nextCallback2).toHaveBeenCalledWith(2)
})

// other functionality tested with SendObservable
