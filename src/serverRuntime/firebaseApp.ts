import admin from 'firebase-admin'
import App = admin.app.App

export interface AppProvider {
    getApp(): App
}

let defaultApp: App

const defaultAppProvider: AppProvider = {
    getApp(): App {
        if (!defaultApp) {
            defaultApp = admin.initializeApp()
        }

        return defaultApp
    }
}

export const getApp = () => defaultAppProvider.getApp()
