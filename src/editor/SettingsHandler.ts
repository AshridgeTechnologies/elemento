import {ProjectSettings} from './Types'
import {DiskProjectStoreInterface} from './DiskProjectStore'
import {noop} from '../util/helpers'

export default class SettingsHandler {
    private _settings: ProjectSettings = {}

    static new = async (diskProjectStore: DiskProjectStoreInterface, listener: (settings: ProjectSettings) => void = noop): Promise<SettingsHandler> => {
        const newInstance = new SettingsHandler(diskProjectStore, 'settings.json', listener)
        await newInstance.init()
        return newInstance
    }

    private constructor(private readonly diskProjectStore: DiskProjectStoreInterface,
                private readonly settingsFileName: string,
                private readonly listener: (settings: ProjectSettings) => void) {
    }

    get settings() {
        return this._settings
    }

    async setSettings(newSettings: ProjectSettings) {
        this._settings = newSettings
        await this.diskProjectStore.writeTextFile(this.settingsFileName, JSON.stringify(this._settings, null, 2))
        this.listener(newSettings)
    }

    private async init() {
        try {
            const fileContents = await this.diskProjectStore.readTextFile(this.settingsFileName)
            this._settings = JSON.parse(fileContents)
        } catch (e) {
            this._settings = {}
        }
    }

}