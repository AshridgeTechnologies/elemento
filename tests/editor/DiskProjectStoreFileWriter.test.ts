import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import DiskProjectStoreFileWriter from '../../src/editor/DiskProjectStoreFileWriter'
import type {DiskProjectStoreInterface} from '../../src/editor/DiskProjectStore'

test('writes text file to a DiskProjectStore at the given path', async () => {
    const store = {
        writeTextFile: vi.fn().mockResolvedValue(undefined)
    } as unknown as DiskProjectStoreInterface

    const writer = new DiskProjectStoreFileWriter(store, 'dir1/dir2')
    await writer.writeFile('dir3/file1.jpg', 'File contents')
    expect(store.writeTextFile).toHaveBeenCalledWith('dir1/dir2/dir3/file1.jpg', 'File contents', true)
})

test('writes binary file to a DiskProjectStore at the given path', async () => {
    const store = {
        writeFile: vi.fn().mockResolvedValue(undefined),
    } as unknown as DiskProjectStoreInterface

    const fileContents = new Uint8Array([1,2,3])
    const writer = new DiskProjectStoreFileWriter(store, 'dir1/dir2')
    await writer.writeFile('dir3/file1.jpg', fileContents)
    expect(store.writeFile).toHaveBeenCalledWith('dir1/dir2/dir3/file1.jpg', fileContents, true)
})
