import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import DiskProjectStoreFileLoader from '../../src/editor/DiskProjectStoreFileLoader'
import type {DiskProjectStoreInterface} from '../../src/editor/DiskProjectStore'

test.each([false, true])('returns exists for a directory from a DiskProjectStore', async (existsVal) => {
    const storeWithDir = {
        exists: vi.fn().mockResolvedValue(existsVal)
    } as unknown as DiskProjectStoreInterface

    const loader = new DiskProjectStoreFileLoader(storeWithDir)

    await expect(loader.exists('theDir')).resolves.toStrictEqual(existsVal)
    expect(storeWithDir.exists).toHaveBeenCalledWith('theDir')
})

test('lists files in a directory from a DiskProjectStore', async () => {
    const store = {
        getFileNames: vi.fn().mockResolvedValue(['file1.jpg', 'file2.pdf'])
    } as unknown as DiskProjectStoreInterface

    const loader = new DiskProjectStoreFileLoader(store)

    await expect(loader.listFiles('theDir')).resolves.toStrictEqual(['file1.jpg', 'file2.pdf'])
    expect(store.getFileNames).toHaveBeenCalledWith('theDir')
})

test('reads files from a DiskProjectStore', async () => {
    const store = {
        readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
    } as unknown as DiskProjectStoreInterface

    const loader = new DiskProjectStoreFileLoader(store)

    await expect(loader.readFile('theDir/file1.jpg')).resolves.toStrictEqual(new Uint8Array([1, 2, 3]))
    expect(store.readFile).toHaveBeenCalledWith('theDir/file1.jpg')
})
