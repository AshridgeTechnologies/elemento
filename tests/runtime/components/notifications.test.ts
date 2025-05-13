import {beforeEach, expect, test, vi} from "vitest"
import * as notifications from '../../../src/runtime/components/notifications'
import {wait} from '../../testutil/testHelpers'

beforeEach( notifications.test_resetManager)

test('can subscribe and get notifications and unsubscribe', () => {
    const callback = vi.fn()
    const unsubscribe = notifications.subscribeToNotifications(callback)
    const result = notifications.addNotification('success', 'Add New User')
    expect(result).toBe(true)
    expect(callback).toHaveBeenCalledWith({level: 'success', message: 'Add New User'})
    notifications.addNotification('info', 'Add New User', 'User added successfully')
    expect(callback).toHaveBeenCalledWith({level: 'info', message: 'Add New User', details: 'User added successfully'})
    notifications.addNotification('error', 'Add New User', 'Failed to add user')
    expect(callback).toHaveBeenLastCalledWith({level: 'error', message: 'Add New User', details: 'Failed to add user'})

    unsubscribe()
    notifications.addNotification('warning', 'Add New User', 'Add users disabled')
    expect(callback).toHaveBeenLastCalledWith({level: 'error', message: 'Add New User', details: 'Failed to add user'})
})

test('can throttle repeated notifications with same message even if details different', async () => {
    const callback = vi.fn()
    const unsubscribe = notifications.subscribeToNotifications(callback)
    let result = notifications.addNotification('error', 'Add New User', 'No good user 1', 20)
    expect(result).toBe(true)
    result = notifications.addNotification('error', 'Add New User', 'No good user 2', 20)
    expect(result).toBe(false)
    result = notifications.addNotification('error', 'Update User', 'No good user 2a', 20)
    expect(result).toBe(true)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith({level: 'error', message: 'Add New User', details: 'No good user 1'})
    expect(callback).toHaveBeenLastCalledWith({level: 'error', message: 'Update User', details: 'No good user 2a'})

    await wait(40)
    result = notifications.addNotification('error', 'Add New User', 'No good user 3', 20)
    expect(result).toBe(true)
    result = notifications.addNotification('info', 'Add New User', 'No good user 4', 20)
    expect(result).toBe(false)
    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenLastCalledWith({level: 'error', message: 'Add New User', details: 'No good user 3'})
})

