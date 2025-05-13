import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import SettingsHandler from '../../src/editor/SettingsHandler'
import {DiskProjectStoreInterface} from '../../src/editor/DiskProjectStore'
import {wait} from '../testutil/testHelpers'

const initialFileContents = `{"area1": { "serverName": "foo"}}`

test('has stored settings values once initialised', async () => {
    const store = {
        readTextFile: vi.fn().mockResolvedValue(initialFileContents),
    } as unknown as DiskProjectStoreInterface
    const handler = await SettingsHandler.new(store)
    expect(store.readTextFile).toHaveBeenCalledWith('settings.json')
    expect(handler.settings).toStrictEqual({area1: { serverName: 'foo'}})
})

test('has empty settings if no file present', async () => {
    const store = {
        readTextFile: vi.fn().mockRejectedValue(new Error('File not found')),
    } as unknown as DiskProjectStoreInterface
    const handler = await SettingsHandler.new(store)
    expect(store.readTextFile).toHaveBeenCalledWith('settings.json')
    expect(handler.settings).toStrictEqual({})
})

test('caches and updates stored settings values and notifies listener once initialised', async () => {
    const store = {
        readTextFile: vi.fn().mockResolvedValue(initialFileContents),
        writeTextFile: vi.fn().mockResolvedValue(undefined)
    } as unknown as DiskProjectStoreInterface
    const listener = vi.fn()
    const handler = await SettingsHandler.new(store, listener)
    const updatedSettings = {area1: { serverName: 'bar', delay: 1000}}
    handler.setSettings(updatedSettings)
    expect(handler.settings).toStrictEqual(updatedSettings)
    expect(store.writeTextFile).toHaveBeenCalledWith('settings.json', `{
  "area1": {
    "serverName": "bar",
    "delay": 1000
  }
}`)
    await wait()
    expect(listener).toHaveBeenCalledWith(updatedSettings)
})
