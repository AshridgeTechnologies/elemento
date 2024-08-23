export type NotificationLevel = 'default' | 'info' | 'warning' | 'error' | 'success'
export type Notification = {level: NotificationLevel, message: string, details?: string}
export type NotificationCallback = (notification: Notification)=> void

class NotificationManager {
    private notificationListeners = new Set<NotificationCallback>()
    private lastMessage: string | null = null
    private lastMessageTime = 0

    subscribeToNotifications = (callback: NotificationCallback ): VoidFunction => {
        this.notificationListeners.add(callback)
        return () => {
            this.notificationListeners.delete(callback)
        }
    }

    addNotification = (level: NotificationLevel, message: string, details?: string, throttleDelay = 0): boolean => {
        const now = Date.now()
        if (now - this.lastMessageTime >= throttleDelay || message !== this.lastMessage) {
            this.lastMessageTime = Date.now()
            this.lastMessage = message
            const notification = {level, message, details}
            this.notificationListeners.forEach( callback => callback(notification))
            return true
        }

        return false
    }
}

let theManager = new NotificationManager()

export const subscribeToNotifications = (callback: NotificationCallback ): VoidFunction => {
    return theManager.subscribeToNotifications(callback)
}

export const addNotification = (level: NotificationLevel, message: string, details?: string, throttleDelay?: number) => {
    return theManager.addNotification(level, message, details, throttleDelay)
}

export const test_resetManager = () => theManager = new NotificationManager()
