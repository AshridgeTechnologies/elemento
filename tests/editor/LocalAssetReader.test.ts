import 'fake-indexeddb/auto'
import {ASSET_DIR} from '../../src/editor/LocalProjectStore'  //ensure test uses original constant
import {LocalAssetReader} from '../../src/editor/LocalAssetReader'

let store: LocalAssetReader
globalThis.navigator = {} as any

beforeEach(() => {
    store = new LocalAssetReader()
})

afterEach(async () =>  {
    //await store['db'].delete()
})

test('reads asset files in sub dir in a project dir', async () => {
    const projectName = 'Test dir asset 1'
    // @ts-ignore
    const fs = store.fs
    const fileData = new Uint8Array([0, 1, 2, 3])
    await fs.mkdir(`/${projectName}`)
    await fs.mkdir(`/${projectName}/${ASSET_DIR}`)
    const fileName = 'Main.dat'
    await fs.writeFile(`/${projectName}/${ASSET_DIR}/${fileName}`, fileData)
    const dataRead = await store.readAssetFile(projectName, fileName)
    expect(dataRead.buffer).toStrictEqual(fileData.buffer)
})
