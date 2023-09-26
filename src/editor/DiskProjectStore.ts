import Project from '../model/Project'
import FS from '@isomorphic-git/lightning-fs'
import {loadJSONFromString} from '../model/loadJSON'
import {ASSET_DIR, projectFileName} from '../shared/constants'

interface ProjectWorkingCopy {
    get project(): Project
    get assetFileNames(): string[]
    get projectWithFiles(): Project
}

class FileError extends Error {
    constructor(path: string, description: string, public code: string) {
        super(`Path ${path}: ${description}`)
    }
}

export interface DiskProjectStoreInterface {

    getProject(): Promise<ProjectWorkingCopy>

    createProject(): Promise<void>

    getFileNames(dirName: string): Promise<string[]>
    readFile(path: string): Promise<Uint8Array>

    writeFile(path: string, fileData: Uint8Array, createDirs?: boolean): Promise<void>

    readTextFile(path: string): Promise<string>

    writeTextFile(path: string, text: string, createDirs?: boolean): Promise<void>

    writeProjectFile(project: Project): Promise<void>

    deleteFile(path: string): Promise<void>

    rename(oldPath: string, newPath: string): Promise<void>

    readAssetFile(fileName: string): Promise<Uint8Array>

    writeAssetFile(fileName: string, fileData: Uint8Array): Promise<void>

    deleteAssetFile(path: string): Promise<void>

    renameAsset(oldPath: string, newPath: string): Promise<void>

    get fileSystem() : FS

    copyFiles(directory: FileSystemDirectoryHandle): Promise<void>
}


const adjustPath = (filePath: string) => filePath.replace(/^\//, '')

export class DirectoryFS  {
    promises: this
    constructor(private directoryHandle: FileSystemDirectoryHandle) {
        this.promises = this
    }

    init(_name: string, _options?: FS.Options): void {}

    async mkdir(filepath: string, _options?: FS.MKDirOptions): Promise<void> {
        const pathSegments = this.pathSegments(filepath)
        const lastDirSegment = pathSegments.slice(-1)[0]
        const parentSegments = pathSegments.slice(0, -1)
        const parentDirHandle =  await this.resolveDirHandle(parentSegments)
        let alreadyExists = false
        try {
            await parentDirHandle.getDirectoryHandle(lastDirSegment, {create: false})
            alreadyExists = true
        } catch (e) {
        }

        if (alreadyExists) {
            throw new FileError(filepath, 'already exists', 'EEXIST')
        }
        await parentDirHandle.getDirectoryHandle(lastDirSegment, {create: true})

    }

    /**
     * Remove directory
     * @param filepath
     * @param options
     */
    async rmdir(filepath: string, options?: undefined): Promise<void> {
        const pathSegments = this.pathSegments(filepath)
        const lastDirSegment = pathSegments.slice(-1)[0]
        const parentSegments = pathSegments.slice(0, -1)
        const parentDirHandle =  await this.resolveDirHandle(parentSegments)
        let exists = false
        try {
            await parentDirHandle.getDirectoryHandle(lastDirSegment, {create: false})
            exists = true
        } catch (e) {
        }

        if (!exists) {
            throw new FileError(filepath, 'not found', 'ENOENT')
        }
        await parentDirHandle.removeEntry(lastDirSegment, {recursive: true})
    }

    /**
     * Read directory
     *
     * The Promise return value is an Array of strings. NOTE: To save time, it is NOT SORTED. (Fun fact: Node.js' readdir output is not guaranteed to be sorted either. I learned that the hard way.)
     * @param dirpath
     * @param options
     * @returns The file list.
     */
    async readdir(dirpath: string, options?: undefined): Promise<string[]> {
        let dirHandle = await this.getDirectoryHandle(dirpath)
        const result = []
        // @ts-ignore
        for await (const entry of dirHandle.keys()) {
            result.push(entry)
        }
        return result
    }

    async writeFile(filepath: string, data: Uint8Array | string, options?: FS.WriteFileOptions | string, createDirs?: boolean): Promise<void> {
        const fileHandle = await this.getFileHandle(filepath, {create: true}, createDirs)
        // @ts-ignore
        const writable = await fileHandle.createWritable()
        await writable.write(data)
        await writable.close()
    }

    async readFile(filepath: string, options?: FS.ReadFileOptions | string): Promise<Uint8Array | string> {
        const fileHandle = await this.getFileHandle(filepath)
        const file = await fileHandle.getFile()
        const readText = options && (options === 'utf8' || (options as FS.ReadFileOptions).encoding === 'utf8')
        return readText ? await file.text() : new Uint8Array(await file.arrayBuffer())
    }

    /**
     * Delete a file
     * @param filepath
     * @param options
     */
    async unlink(filepath: string, options?: undefined): Promise<void> {
        const pathSegments = this.pathSegments(filepath)
        const fileSegment = pathSegments.slice(-1)[0]
        const parentSegments = pathSegments.slice(0, -1)
        const parentDirHandle =  await this.resolveDirHandle(parentSegments)
        let exists = false
        try {
            await parentDirHandle.getFileHandle(fileSegment, {create: false})
            exists = true
        } catch (e) {
        }

        if (!exists) {
            throw new FileError(filepath, 'not found', 'ENOENT')
        }
        await parentDirHandle.removeEntry(fileSegment)
    }

    /**
     * Rename a file or directory
     * @param oldFilepath
     * @param newFilepath
     */
    async rename(oldFilepath: string, newFilepath: string): Promise<void> {
        const data = await this.readFile(adjustPath(oldFilepath))
        const writeOptions = typeof data === 'string' ? 'utf8' : undefined
        await this.writeFile(adjustPath(newFilepath), data, writeOptions)
        await this.unlink(adjustPath(oldFilepath))
    }

    /**
     * The result is a Stat object similar to the one used by Node but with fewer and slightly different properties and methods.
     * @param path
     * @param options
     */
    async stat(path: string, options?: undefined): Promise<FS.Stats> {
        let type: 'file' | 'dir'
        let size = 0, lastModified = 0
        try {
            await this.getDirectoryHandle(path)
            type = 'dir'
        } catch (e) {
            const fileHandle = await this.getFileHandle(path)
            const file = await fileHandle.getFile()
            type = 'file'
            size = file.size
            lastModified = file.lastModified
        }

        return {
            type,
            mode: 0,
            size: size,
            ino: 0,
            mtimeMs: lastModified,
            ctimeMs: 0,
            uid: 1,
            gid: 1,
            dev: 1,
            isFile() {return type === "file"},
            isDirectory() { return type === "dir" },
            isSymbolicLink() { return false }
        }
    }

    /**
     * Like fs.stat except that paths to symlinks return the symlink stats not the file stats of the symlink's target.
     * @param filepath
     * @param options
     */
    async lstat(filepath: string, options?: undefined): Promise<FS.Stats> {
        return this.stat(filepath, options)
    }

    readlink(filepath: string) {
        throw new Error('readlink: Not implemented')
    }

    symlink(filepath: string) {
        throw new Error('symlink: Not implemented')
    }

    /**
     * @param filepath
     * @returns The size of a file or directory in bytes.
     */
    async du(filepath: string): Promise<number> {
        const fileHandle = await this.getFileHandle(filepath)
        const file = await fileHandle.getFile()
        return file.size
    }
    /**
     * Function that saves anything that need to be saved in IndexedBD or custom IDB object. Right now it saves SuperBlock so it's save to dump the object as dump it into a file (e.g. from a Browser)
     * @returns Promise that resolves when super block is saved to file
     */
    async flush(): Promise<void> {

    }

    private async getDirectoryHandle(dirpath: string): Promise<FileSystemDirectoryHandle> {
        const dirSegments = this.pathSegments(dirpath)
        return await this.resolveDirHandle(dirSegments)
    }

    private async getFileHandle(filepath: string, options: FileSystemGetFileOptions = {}, createDirs?: boolean): Promise<FileSystemFileHandle> {
        const pathSegments = this.pathSegments(filepath)
        const fileSegment = pathSegments.slice(-1)[0]
        const dirSegments = pathSegments.slice(0, -1)
        const dirHandle =  await this.resolveDirHandle(dirSegments, createDirs)
        try {
            return await dirHandle.getFileHandle(fileSegment, options)
        } catch (e) {
            throw new FileError(filepath, 'not found', 'ENOENT')
        }
    }

    private pathSegments(filepath: string) {
        const path = adjustPath(filepath)
        return path.split('/').filter(seg => !!seg)
    }

    private async resolveDirHandle(dirSegments: string[], createDirs = false) {
        let handle = this.directoryHandle
        for (const dir of dirSegments) {
            try {
                handle = await handle.getDirectoryHandle(dir)
            } catch (e) {
                if (createDirs) {
                    handle = await handle.getDirectoryHandle(dir, {create: true})
                } else {
                    throw new FileError(dirSegments.join('/'), 'not found', 'ENOENT')
                }
            }
        }
        return handle
    }

}

// @ts-ignore
globalThis['DirectoryFS'] = DirectoryFS

export class DiskProjectStore implements DiskProjectStoreInterface {
    private readonly fs: DirectoryFS

    constructor(private directoryHandle: FileSystemDirectoryHandle) {
        this.fs = new DirectoryFS(directoryHandle)
    }

    get name() { return this.directoryHandle.name }

    async getProject(): Promise<ProjectWorkingCopy> {
        const projectFileText = await this.readTextFile(projectFileName)
        const project = loadJSONFromString(projectFileText) as Project
        let assetFileNames: string[] = []
        try { assetFileNames = await this.assetFilePaths()} catch (e) { }

        return {
            project,
            assetFileNames,
            get projectWithFiles() {
                return project.withFiles(assetFileNames)
            }
        }
    }


    async getFileNames(dirName: string = '') {
        const names = await this.fs.readdir(`/${dirName}`)
        names.sort()
        return names
    }

    createProject() {
        return this.fs.mkdir(`/${ASSET_DIR}`)
    }

    readTextFile(path: string) {
        return this.fs.readFile(`/${path}`, 'utf8') as Promise<string>
    }

    writeTextFile(path: string, text: string, createDirs = false) {
        return this.fs.writeFile(`/${path}`, text, 'utf8', createDirs)
    }

    writeProjectFile(project: Project) {
        return this.writeTextFile(projectFileName, JSON.stringify(project, null, 2))
    }

    deleteFile(path: string) {
        return this.fs.unlink(`/${path}`)
    }

    rename(oldPath: string, newPath: string) {
        return this.fs.rename(`/${oldPath}`, `/${newPath}`)
    }

    get fileSystem(): any {
        return this.fs
    }

    writeFile(path: string, fileData: Uint8Array, createDirs = false) {
        return this.fs.writeFile(`/${path}`, fileData, undefined, createDirs)
    }

    readFile(path: string) {
        return this.fs.readFile(`/${path}`) as Promise<Uint8Array>
    }

    writeAssetFile(path: string, fileData: Uint8Array) {
        return this.fs.writeFile(`/${ASSET_DIR}/${path}`, fileData)
    }

    async assetFilePaths(): Promise<string[]> {
        return (await this.getFileNames(`/${ASSET_DIR}`)).filter(name => !name.startsWith('.'))
    }

    readAssetFile(path: string) {
        return this.fs.readFile(`/${ASSET_DIR}/${path}`) as Promise<Uint8Array>
    }

    deleteAssetFile(path: string) {
        return this.fs.unlink(`/${ASSET_DIR}/${path}`)
    }

    renameAsset(oldPath: string, newPath: string) {
        return this.fs.rename(`/${ASSET_DIR}/${oldPath}`, `/${ASSET_DIR}/${newPath}`)
    }

    async copyFiles(newDirectoryHandle: FileSystemDirectoryHandle) {
        return copyDir(this.directoryHandle, newDirectoryHandle)
    }
}

async function copyDir(srcDirectoryHandle: FileSystemDirectoryHandle, destDirectoryHandle: FileSystemDirectoryHandle) {
    // @ts-ignore
    for await (const [name, handle] of srcDirectoryHandle) {
        console.log(name, handle)
        if (handle.kind === 'file') {
            await copyFile(handle, destDirectoryHandle)
        } else {
            const subDirHandle = await destDirectoryHandle.getDirectoryHandle(name, {create: true})
            await copyDir(handle, subDirHandle)
        }
    }
}

async function copyFile(srcFileHandle: FileSystemFileHandle, destDirectoryHandle: FileSystemDirectoryHandle) {
    const destFileHandle = await destDirectoryHandle.getFileHandle(srcFileHandle.name, {create: true})
    const file = await srcFileHandle.getFile()
    const data = new Uint8Array(await file.arrayBuffer())
    // @ts-ignore
    const writable = await destFileHandle.createWritable()
    await writable.write(data)
    await writable.close()
}
