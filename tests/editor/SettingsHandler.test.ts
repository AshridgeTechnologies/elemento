import SettingsHandler from '../../src/editor/SettingsHandler'
import {DiskProjectStoreInterface} from '../../src/editor/DiskProjectStore'

const initialFileContents = `{"area1": { "serverName": "foo"}}`

test('has stored settings values once initialised', async () => {
    const store = {
        readTextFile: jest.fn().mockResolvedValue(initialFileContents),
    } as unknown as DiskProjectStoreInterface
    const handler = await SettingsHandler.new(store)
    expect(store.readTextFile).toHaveBeenCalledWith('settings.json')
    expect(handler.settings).toStrictEqual({area1: { serverName: 'foo'}})
})

test('has empty settings if no file present', async () => {
    const store = {
        readTextFile: jest.fn().mockRejectedValue(new Error('File not found')),
    } as unknown as DiskProjectStoreInterface
    const handler = await SettingsHandler.new(store)
    expect(store.readTextFile).toHaveBeenCalledWith('settings.json')
    expect(handler.settings).toStrictEqual({})
})

test('caches and updates stored settings values once initialised', async () => {
    const store = {
        readTextFile: jest.fn().mockResolvedValue(initialFileContents),
        writeTextFile: jest.fn().mockResolvedValue(undefined)
    } as unknown as DiskProjectStoreInterface
    const handler = await SettingsHandler.new(store)
    const updatedSettings = {area1: { serverName: 'bar', delay: 1000}}
    handler.setSettings(updatedSettings)
    expect(handler.settings).toStrictEqual(updatedSettings)
    expect(store.writeTextFile).toHaveBeenCalledWith('settings.json', `{
  "area1": {
    "serverName": "bar",
    "delay": 1000
  }
}`)
})