import {FileDataStoreImpl} from '../../../src/runtime/components/index'
import {
    filePickerCancelling, filePickerErroring,
    filePickerReturning,
    resetSaveFileCallData,
    saveFileData,
    saveFilePicker,
    saveFilePickerOptions
} from '../../testutil/testHelpers'
import {mergeDeepRight} from 'ramda'
import {InvalidateAll, InvalidateAllQueries} from '../../../src/runtime/DataStore'

beforeEach(() => resetSaveFileCallData() )

test('has initial empty data store', async () => {
    const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker: jest.fn()})
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
})

test('can add, update and remove before Save', async () => {
    const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker: jest.fn()})
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: 'Bee1', c: true})

    await store.update('Widgets', 'w1', {a: 20, b: 'Bee1', c: true})
    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 20, b: 'Bee1', c: true})

    await store.remove('Widgets', 'w1')
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
})

test('has empty data store after New', async () => {
    const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker: jest.fn()})
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: 'Bee1', c: true})
    await store.New()
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
})

test('has empty data store after Open and New', async () => {
    const data = {Widgets: { w1: {a: 10, b: 'Bee1', c: true}, w2: {a: 11}}}
    const fileName = 'dataFile1.json'
    const showSaveFilePicker = jest.fn()
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
    const showSaveFilePicker = jest.fn()
    const showOpenFilePicker = filePickerReturning(data, fileName)

    const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})

    await store.Open()

    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: 'Bee1', c: true})
})

test('can cancel open file', async () => {
    const showSaveFilePicker = jest.fn()
    const showOpenFilePicker = filePickerCancelling

    const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})
    await store.Open()
    await expect(store.getById('Widgets', 'w1')).rejects.toHaveProperty('message', `Object with id 'w1' not found in collection 'Widgets'`)
})

test('notifies error opening file', async () => {
    const showSaveFilePicker = jest.fn()
    const showOpenFilePicker = filePickerErroring

    const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})
    expect(store.Open()).rejects.toHaveProperty('message', 'Could not access file')
})

test('saves to new file', async () => {
    const fileName = 'dataFile1.json'

    const store = new FileDataStoreImpl({
        showOpenFilePicker: jest.fn(),
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
        showOpenFilePicker: jest.fn(),
        showSaveFilePicker: filePickerCancelling
    })

    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    await store.SaveAs()
    expect(saveFileData).toBeUndefined()
})


test('notifies error in Save As', async () => {
    const store = new FileDataStoreImpl({
        showOpenFilePicker: jest.fn(),
        showSaveFilePicker: filePickerErroring
    })

    expect(store.SaveAs()).rejects.toHaveProperty('message', 'Could not access file')
    expect(saveFileData).toBeUndefined()
})


test('save does save as if not previously saved', async () => {
    const fileName = 'dataFile1.json'

    const store = new FileDataStoreImpl({
        showOpenFilePicker: jest.fn(),
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
    const showSaveFilePicker = jest.fn()
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

    const showSaveFilePicker = jest.fn().mockImplementation(saveFilePicker(fileName))
    const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker})

    await store.SaveAs()
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    expect(showSaveFilePicker).toHaveBeenCalledTimes(1)

    await store.add('Widgets', 'w2', {a: 11})
    // await store.Save() - add autosaves
    expect(saveFileData).toStrictEqual(JSON.stringify({Widgets: {w1: {a: 10, b: 'Bee1', c: true}, w2: {a: 11}}}))
    expect(showSaveFilePicker).toHaveBeenCalledTimes(1)
})

test('can update when file loaded', async () => {
    const showSaveFilePicker = jest.fn().mockImplementation(saveFilePicker('aFile'))
    const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker})

    await store.Save()
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    await store.update('Widgets', 'w1', {a: 20})
    expect(showSaveFilePicker).toHaveBeenCalledTimes(1)
    expect(saveFileData).toStrictEqual(JSON.stringify({Widgets: {w1: {a: 20, b: 'Bee1', c: true}}}))
    expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 20, b: 'Bee1', c: true})
})

test('can remove when file loaded', async () => {
    const showSaveFilePicker = jest.fn().mockImplementation(saveFilePicker('aFile'))
    const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker})

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
    const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker: jest.fn()})
    await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
    await store.add('Widgets', 'w2', {a: 20, b: 'Bee2', c: true})
    await store.add('Widgets', 'w3', {a: 20, b: 'Bee3', c: false})
    expect(await store.query('Widgets', {a: 20})).toStrictEqual([{a: 20, b: 'Bee2', c: true}, {a: 20, b: 'Bee3', c: false}])

})

describe('subscribe', () => {
    test('sends InvalidateAll on New to all subscriptions', async () => {
        const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker: jest.fn()})
        const onNextWidgets = jest.fn()
        const onNextSprockets = jest.fn()
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
        const showSaveFilePicker = jest.fn()
        const showOpenFilePicker = filePickerReturning(data, fileName)

        const store = new FileDataStoreImpl({showOpenFilePicker, showSaveFilePicker})
        const onNextWidgets = jest.fn()
        const onNextSprockets = jest.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        expect(await store.getById('Widgets', 'w1')).toStrictEqual({a: 10, b: 'Bee1', c: true})
        await store.Open()
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: InvalidateAll})
        expect(onNextSprockets).toHaveBeenCalledWith({collection: 'Sprockets', type: InvalidateAll})
    })

    test('sends InvalidateAllQueries on Add to subscriptions for that collection', async () => {
        const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker: jest.fn()})
        const onNextWidgets = jest.fn()
        const onNextSprockets = jest.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: InvalidateAllQueries})
        expect(onNextSprockets).not.toHaveBeenCalled()
    })

    test('sends InvalidateAllQueries on Update to subscriptions for that collection', async () => {
        const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker: jest.fn()})
        const onNextWidgets = jest.fn()
        const onNextSprockets = jest.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true}) // create the Widgets collection
        onNextWidgets.mockReset()
        await store.update('Widgets', 'w1', {c: true})
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: InvalidateAllQueries})
        expect(onNextSprockets).not.toHaveBeenCalled()
    })

    test('sends InvalidateAllQueries on Remove to subscriptions for that collection', async () => {
        const store = new FileDataStoreImpl({showOpenFilePicker: jest.fn(), showSaveFilePicker: jest.fn()})
        const onNextWidgets = jest.fn()
        const onNextSprockets = jest.fn()
        store.observable('Widgets').subscribe(onNextWidgets)
        store.observable('Sprockets').subscribe(onNextSprockets)
        await store.add('Widgets', 'w1', {a: 10, b: 'Bee1', c: true}) // create the Widgets collection
        onNextWidgets.mockReset()
        await store.remove('Widgets', 'w1')
        expect(onNextWidgets).toHaveBeenCalledWith({collection: 'Widgets', type: InvalidateAllQueries})
        expect(onNextSprockets).not.toHaveBeenCalled()
    })

})
