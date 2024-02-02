import * as notifications from '../../../src/runtime/components/notifications'

beforeEach( notifications.test_resetManager)

test('can subscribe and get notifications and unsubscribe', () => {
    const callback = jest.fn()
    const unsubscribe = notifications.subscribeToNotifications(callback)
    notifications.addNotification('success', 'Add New User')
    expect(callback).toHaveBeenCalledWith({level: 'success', message: 'Add New User'})
    notifications.addNotification('info', 'Add New User', 'User added successfully')
    expect(callback).toHaveBeenCalledWith({level: 'info', message: 'Add New User', details: 'User added successfully'})
    notifications.addNotification('error', 'Add New User', 'Failed to add user')
    expect(callback).toHaveBeenLastCalledWith({level: 'error', message: 'Add New User', details: 'Failed to add user'})

    unsubscribe()
    notifications.addNotification('warning', 'Add New User', 'Add users disabled')
    expect(callback).toHaveBeenLastCalledWith({level: 'error', message: 'Add New User', details: 'Failed to add user'})
})

