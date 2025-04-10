import {FirebaseApp, initializeApp} from 'firebase/app'

type Callback = (app: FirebaseApp | null) => void

class FirebaseAppManager {
    private app: FirebaseApp | null = null
    private firebaseConfig: any = null
    private configFetch: Promise<void> | null = null
    private listeners: Callback[] = []

    getApp() {
        if (!this.firebaseConfig) {
            // this.loadConfig()
        }
        return this.app
    }

    get config() { return this.firebaseConfig }

    setConfig(config: any) {
        this.firebaseConfig = config
        this.app = config ? initializeApp(this.firebaseConfig, this.firebaseConfig.projectId) : null
        this.appChanged()
    }

    getAppAndSubscribeToChanges(listener: Callback) {
        this.listeners = [...this.listeners, listener]
        listener(this.getApp())  // will trigger loading config
    }

    private appChanged() {
        this.listeners.forEach( l => l(this.app) )
    }

    private loadConfig() {
        if (!this.configFetch) {
            this.configFetch = fetch('/firebaseConfig.json')
                .then(resp => resp.json())
                .then( config => this.setConfig(config))
                .catch((err) => {
                    console.warn('Could not load firebase config from server', err.message)
                })
        }
    }
}

let appManager = new FirebaseAppManager()

export type {FirebaseApp} from 'firebase/app'
export const getAppAndSubscribeToChanges = (callback: Callback) => appManager.getAppAndSubscribeToChanges(callback)
export const setConfig = (config: any) => appManager.setConfig(config)
export const test_resetAppManager = () => appManager = new FirebaseAppManager()
