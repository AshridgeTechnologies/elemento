import {FirebaseApp, initializeApp} from 'firebase/app'

class FirebaseAppManager {
    private app: FirebaseApp | null = null
    private firebaseConfig: any = null

    async getApp() {
        const config = this.firebaseConfig ?? (this.firebaseConfig = await this.loadConfig())
        this.app = this.app ?? initializeApp(this.firebaseConfig, this.firebaseConfig.projectId)
        return this.app
    }

    setConfig(config: any) {
        this.firebaseConfig = config
        this.app = null
    }

    private loadConfig() {
        return fetch('/firebaseConfig.json').then( resp => resp.json() )
    }
}

const appManager = new FirebaseAppManager()

export const getApp = async () => {
    return appManager.getApp()
}
export const setConfig = (config: any) => {
    appManager.setConfig(config)
}