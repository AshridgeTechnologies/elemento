export type ProgramErrorLevel = 'warning' | 'error'
export type ProgramError = {level: ProgramErrorLevel, path: string, property: string, message: string}
export type ProgramErrorCallback = (notification: ProgramError)=> void

class ProgramErrorsManager {
    private notificationListeners = new Set<ProgramErrorCallback>()

    subscribeToNotifications = (callback: ProgramErrorCallback ): VoidFunction => {
        this.notificationListeners.add(callback)
        return () => {
            this.notificationListeners.delete(callback)
        }
    }

    addNotification = (level: ProgramErrorLevel, path: string, property: string, message: string): void => {
        const notification = {level, path, property, message}
        this.notificationListeners.forEach( callback => callback(notification))
    }
}

let theManager = new ProgramErrorsManager()

export const subscribeToProgramErrors = (callback: ProgramErrorCallback ): VoidFunction => {
    return theManager.subscribeToNotifications(callback)
}

export const addError = (level: ProgramErrorLevel, path: string, property: string, message: string) => {
    return theManager.addNotification(level, path, property, message)
}

export const test_resetManager = () => theManager = new ProgramErrorsManager()
