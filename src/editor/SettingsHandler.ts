import {ProjectSettings} from './Types'
import {DiskProjectStore, DiskProjectStoreInterface} from './DiskProjectStore'

export default class SettingsHandler {
    private _settings: ProjectSettings = {}

    static new = async (diskProjectStore: DiskProjectStoreInterface): Promise<SettingsHandler> => {
        const newInstance = new SettingsHandler(diskProjectStore, 'settings.json')
        await newInstance.init()
        return newInstance
    }

    constructor(private readonly diskProjectStore: DiskProjectStoreInterface, private readonly settingsFileName: string) {
    }

    get settings() {
        return this._settings
    }

    setSettings(newSettings: ProjectSettings) {
        this._settings = newSettings
        return this.diskProjectStore.writeTextFile(this.settingsFileName, JSON.stringify(this._settings, null, 2))
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