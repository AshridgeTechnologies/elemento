import {beforeEach, describe, expect, test, vi} from "vitest"
import {FileDataStoreImpl} from '../../../src/runtime/components/index'
import {
    filePickerCancelling,
    filePickerErroring,
    filePickerReturning,
    resetSaveFileCallData,
    saveFileData,
    saveFilePicker,
    saveFilePickerOptions
} from '../../testutil/testHelpers'
import {mergeDeepRight} from 'ramda'
import {Add, InvalidateAll, MultipleChanges, Remove, Update} from '../../../src/shared/DataStore'

beforeEach(() => resetSaveFileCallData() )

test('has initial empty data store', async () => {
    const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn()})
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
})

test('returns null if not found and nullIfNotFound set', async () => {
    const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn()})
    await expect(store.getById('Widgets', 'wxxx', true)).resolves.toBe(null)
})

test('can add, update and remove before Save', async () => {
    const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn()})
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: 'Bee1', c: true})

    await store.addAll('Widgets', {w2: {a: 50, b: 'Bee50', c: true}, w3: {a: 60, b: 'Bee60', c: false}})
    expect(await store.getById('Widgets', 'w3')).toStrictEqual({a: 60, b: 'Bee60', c: false})

    await store.update('Widgets', 'w1', {a: 20, b: 'Bee1', c: true})
    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 20, b: 'Bee1', c: true})

    await store.remove('Widgets', 'w1')
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
})

test('has empty data store after New', async () => {
    const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn()})
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: 'Bee1', c: true})
    await store.New()
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
})

test('has empty data store after Open and New', async () => {
    const data = {Widgets: { w1: {a: 10, b: 'Bee1', c: true}, w2: {a: 11}}}
    const fileName = 'dataFile1.json'
    const showSaveFilePicker = vi.fn()
    const showOpenFilePicker = filePickerReturning(data, fileName)

    const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})

    await store.Open()
    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: 'Bee1', c: true})
    await store.New()
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
})

test('opens file', async () => {
    const data = {Widgets: { w1: {a: 10, b: 'Bee1', c: true}, w2: {a: 11}}}
    const fileName = 'dataFile1.json'
    const showSaveFilePicker = vi.fn()
    const showOpenFilePicker = filePickerReturning(data, fileName)

    const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})

    await store.Open()

    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: 'Bee1', c: true})
})

test('can cancel open file', async () => {
    const showSaveFilePicker = vi.fn()
    const showOpenFilePicker = filePickerCancelling

    const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})
    await store.Open()
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
})

test('notifies error opening file', async () => {
    const showSaveFilePicker = vi.fn()
    const showOpenFilePicker = filePickerErroring

    const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})
    await expect(store.Open()).rejects.toHaveProperty('message', 'Could not access file')
})

test('saves to new file', async () => {
    const fileName = 'dataFile1.json'

    const store = new FileDataStoreImpl({
        showOpenFilePicker: vi.fn(),
        showSaveFilePicker: saveFilePicker(fileName)
    })

    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    await store.add('Widgets', 'w2', {a: 11})
    await store.SaveAs()
    expect(saveFileData).toStrictEqual(JSON.stringify({Widgets: {w1: {a: 10, b: 'Bee1', c: true}, w2: {a: 11}}}))
    expect(saveFilePickerOptions).toStrictEqual({
        types: [
            {
                description: 'JSON data files',
                accept: {
                    'application/json': ['.json'],
                },
            },
        ],
    })
})

test('can cancel Save As', async () => {
    const store = new FileDataStoreImpl({
        showOpenFilePicker: vi.fn(),
        showSaveFilePicker: filePickerCancelling
    })

    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    await store.SaveAs()
    expect(saveFileData).toBeUndefined()
})


test('notifies error in Save As', async () => {
    const store = new FileDataStoreImpl({
        showOpenFilePicker: vi.fn(),
        showSaveFilePicker: filePickerErroring
    })

    await expect(store.SaveAs()).rejects.toHaveProperty('message', 'Could not access file')
    expect(saveFileData).toBeUndefined()
})


test('save does save as if not previously saved', async () => {
    const fileName = 'dataFile1.json'

    const store = new FileDataStoreImpl({
        showOpenFilePicker: vi.fn(),
        showSaveFilePicker: saveFilePicker(fileName)
    })

    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    await store.add('Widgets', 'w2', {a: 11})
    await store.Save()
    expect(saveFileData).toStrictEqual(JSON.stringify({Widgets: {w1: {a: 10, b: 'Bee1', c: true}, w2: {a: 11}}}))
})

test('can Save after open', async () => {
    const data = {Widgets: { w1: {a: 22, b: 'Bee1', c: false}, w2: {a: 19}}}
    const fileName = 'dataFile1.json'
    const showSaveFilePicker = vi.fn()
    const showOpenFilePicker = filePickerReturning(data, fileName)

    const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})

    await store.Open()
    await store.add('Widgets', 'w3', {b: 'Bee'})
    await store.Save()
    const expectedData = mergeDeepRight(data, {Widgets: {w3: {b: 'Bee'}}})
    expect(saveFileData).toStrictEqual(JSON.stringify(expectedData))
})

test('save directly after save as without picking file again', async () => {
    const fileName = 'dataFile1.json'

    const showSaveFilePicker = vi.fn().mockImplementation(saveFilePicker(fileName))
    const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker})

    await store.SaveAs()
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    expect(showSaveFilePicker).toHaveBeenCalledTimes(1)

    await store.add('Widgets', 'w2', {a: 11})
    // await store.Save() - add autosaves
    expect(saveFileData).toStrictEqual(JSON.stringify({Widgets: {w1: {a: 10, b: 'Bee1', c: true}, w2: {a: 11}}}))
    expect(showSaveFilePicker).toHaveBeenCalledTimes(1)
})

test('can update when file loaded', async () => {
    const showSaveFilePicker = vi.fn().mockImplementation(saveFilePicker('aFile'))
    const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker})

    await store.Save()
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    await store.update('Widgets', 'w1', {a: 20})
    expect(showSaveFilePicker).toHaveBeenCalledTimes(1)
    expect(saveFileData).toStrictEqual(JSON.stringify({Widgets: {w1: {a: 20, b: 'Bee1', c: true}}}))
    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 20, b: 'Bee1', c: true})
})

test('can remove when file loaded', async () => {
    const showSaveFilePicker = vi.fn().mockImplementation(saveFilePicker('aFile'))
    const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker})

    await store.Save()
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    await store.add('Widgets', 'w2', {a: 99})
    await store.remove('Widgets', 'w1')
    expect(showSaveFilePicker).toHaveBeenCalledTimes(1)
    expect(saveFileData).toStrictEqual(JSON.stringify({Widgets: {w2: {a: 99}}}))
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
    expect(await store.getById('Widgets', 'w2')).toStrictEqual({a: 99})
})

test('can query', async () => {
    const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn()})
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    await store.add('Widgets', 'w2', {a: 20, b: 'Bee2', c: true})
    await store.add('Widgets', 'w3', {a: 20, b: 'Bee3', c: false})
    expect(await store.query('Widgets', {a: 20})).toStrictEqual([{a: 20, b: 'Bee2', c: true}, {a: 20, b: 'Bee3', c: false}])

})

test('stores dates in ISO format', async () => {
    const store = new FileDataStoreImpl({
        showOpenFilePicker: vi.fn(),
        showSaveFilePicker: saveFilePicker('file.json')
    })

    const hour = 10
    const theDate = new Date(2022, 6, 2, hour, 11, 12)
    await store.add('Widgets', 'w1', {a: 10, b: theDate})
    await store.SaveAs()
    const timezoneOffsetHours = theDate.getTimezoneOffset() / 60
    const expectedHour = hour + timezoneOffsetHours
    const expectedHourStr = expectedHour.toString().padStart(2, '0')
    const expectedDate = `2022-07-02T${expectedHourStr}:11:12.000Z`
    expect(saveFileData).toStrictEqual(JSON.stringify({Widgets: {w1: {a: 10, b: expectedDate}}}))
})

test('retrieves dates in ISO format', async () => {
    const data = {Widgets: { w1: {a: 10, b: `2022-06-29T15:47:21.968Z`}}}
    const showSaveFilePicker = vi.fn()
    const showOpenFilePicker = filePickerReturning(data, 'file.json')
    const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})
    await store.Open()
    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: new Date(`2022-06-29T15:47:21.968Z`)})
})

test('retrieves invalid dates as strings', async () => {
    const data = {Widgets: { w1: {a: 10, b: '2022-02-29T15:47:21.968Z'}}}
    const showSaveFilePicker = vi.fn()
    const showOpenFilePicker = filePickerReturning(data, 'file.json')
    const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})
    await store.Open()

    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: '2022-02-29T15:47:21.968Z'})
})

describe('subscribe', () => {
    test('sends InvalidateAll on New to all subscriptions', async () => {
        const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn()})
        const onNextWidgets = vi.fn()
        const onNextSprockets = vi.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: 'Bee1', c: true})
        await store.New()
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: InvalidateAll})
        expect(onNextSprockets).toHaveBeenCalledWith({collection: 'Sprockets', type: InvalidateAll})
    })

    test('sends InvalidateAll on Open to all subscriptions', async () => {
        const data = {Widgets: { w1: {a: 10, b: 'Bee1', c: true}, w2: {a: 11}}}
        const fileName = 'dataFile1.json'
        const showSaveFilePicker = vi.fn()
        const showOpenFilePicker = filePickerReturning(data, fileName)

        const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})
        const onNextWidgets = vi.fn()
        const onNextSprockets = vi.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: 'Bee1', c: true})
        await store.Open()
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: InvalidateAll})
        expect(onNextSprockets).toHaveBeenCalledWith({collection: 'Sprockets', type: InvalidateAll})
    })

    test('sends changes on Add to subscriptions for that collection', async () => {
        const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn()})
        const onNextWidgets = vi.fn()
        const onNextSprockets = vi.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: Add, id: 'w1', changes: {a: 10, b: 'Bee1', c: true}})
        expect(onNextSprockets).not.toHaveBeenCalled()
    })

    test('sends multiple changes on Add all to subscriptions for that collection', async () => {
        const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn()})
        const onNextWidgets = vi.fn()
        const onNextSprockets = vi.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.addAll('Widgets', {'w1': {a: 10, b: 'Bee1', c: true}})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: MultipleChanges, })
        expect(onNextSprockets).not.toHaveBeenCalled()
    })

    test('sends changes on Update to subscriptions for that collection', async () => {
        const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn()})
        const onNextWidgets = vi.fn()
        const onNextSprockets = vi.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true}) // create the Widgets collection
        onNextWidgets.mockReset()
        await store.update('Widgets', 'w1', {c: true})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: Update, id: 'w1', changes: {c: true}})
        expect(onNextSprockets).not.toHaveBeenCalled()
    })

    test('sends change on Remove to subscriptions for that collection', async () => {
        const store = new FileDataStoreImpl({showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn()})
        const onNextWidgets = vi.fn()
        const onNextSprockets = vi.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true}) // create the Widgets collection
        onNextWidgets.mockReset()
        await store.remove('Widgets', 'w1')
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: Remove, id: 'w1'})
        expect(onNextSprockets).not.toHaveBeenCalled()
    })

})
