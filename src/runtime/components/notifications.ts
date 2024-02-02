export type NotificationLevel = 'default' | 'info' | 'warning' | 'error' | 'success'
export type Notification = {level: NotificationLevel, message: string, details?: string}
export type NotificationCallback = (notification: Notification)=> void

class NotificationManager {
    private notificationListeners = new Set<NotificationCallback>()

    subscribeToNotifications = (callback: NotificationCallback ): VoidFunction => {
        this.notificationListeners.add(callback)
        return () => {
            this.notificationListeners.delete(callback)
        }
    }

    addNotification = (level: NotificationLevel, message: string, details?: string): void => {
        const notification = {level, message, details}
        this.notificationListeners.forEach( callback => callback(notification))
    }
}

let theManager = new NotificationManager()

export const subscribeToNotifications = (callback: NotificationCallback ): VoidFunction => {
    return theManager.subscribeToNotifications(callback)
}

export const addNotification = (level: NotificationLevel, message: string, details?: string) => {
    return theManager.addNotification(level, message, details)
}

export const test_resetManager = () => theManager = new NotificationManager()
