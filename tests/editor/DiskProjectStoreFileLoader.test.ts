import DiskProjectStoreFileLoader from '../../src/editor/DiskProjectStoreFileLoader'
import type {DiskProjectStoreInterface} from '../../src/editor/DiskProjectStore'

test('lists files in a directory from a DiskProjectStore', async () => {
    const store = {
        getFileNames: jest.fn().mockResolvedValue(['file1.jpg', 'file2.pdf'])
    } as unknown as DiskProjectStoreInterface

    const loader = new DiskProjectStoreFileLoader(store)

    await expect(loader.listFiles('theDir')).resolves.toStrictEqual(['file1.jpg', 'file2.pdf'])
    expect(store.getFileNames).toHaveBeenCalledWith('theDir')
})

test('reads files from a DiskProjectStore', async () => {
    const store = {
        readFile: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
    } as unknown as DiskProjectStoreInterface

    const loader = new DiskProjectStoreFileLoader(store)

    await expect(loader.readFile('theDir/file1.jpg')).resolves.toStrictEqual(new Uint8Array([1, 2, 3]))
    expect(store.readFile).toHaveBeenCalledWith('theDir/file1.jpg')
})
