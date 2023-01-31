import Project from '../model/Project'
import FS from '@isomorphic-git/lightning-fs'
import {loadJSONFromString} from '../model/loadJSON'

interface ProjectWorkingCopy {
    get project(): Project
    get assetFileNames(): string[]
    get projectWithFiles(): Project
}

export interface LocalProjectStore {
    getProjectNames(): Promise<string[]>

    getProject(name: string): Promise<ProjectWorkingCopy>

    createProject(name: string): Promise<void>

    readFile(projectName: string, fileName: string): Promise<Uint8Array>

    writeFile(projectName: string, fileName: string, fileData: Uint8Array): Promise<void>

    readTextFile(projectName: string, path: string): Promise<string>

    writeTextFile(projectName: string, path: string, text: string): Promise<void>

    writeProjectFile(projectName: string, project: Project): Promise<void>

    deleteFile(projectName: string, path: string): Promise<void>

    rename(projectName: string, oldPath: string, newPath: string): Promise<void>

    readAssetFile(projectName: string, fileName: string): Promise<Uint8Array>

    writeAssetFile(projectName: string, fileName: string, fileData: Uint8Array): Promise<void>

    deleteAssetFile(projectName: string, path: string): Promise<void>

    renameAsset(projectName: string, oldPath: string, newPath: string): Promise<void>

    get fileSystem() : FS
}

export const projectFileName = 'ElementoProject.json'
export const ASSET_DIR = 'files'  // also rename in LocalAssetReader

export class LocalProjectStoreIDB implements LocalProjectStore {
    private cbfs: FS
    private readonly fs: FS.PromisifiedFS

    constructor() {
        this.cbfs = new FS('projectFileSystem')
        this.fs = this.cbfs.promises
    }

    async getProject(projectName: string): Promise<ProjectWorkingCopy> {
        const projectFileText = await this.readTextFile(projectName, projectFileName)
        const project = loadJSONFromString(projectFileText) as Project
        let assetFileNames: string[] = []
        try { assetFileNames = (await this.getFileNames(`${projectName}/${ASSET_DIR}`)).filter(name => !name.startsWith('.'))} catch (e) { }

        return {
            project,
            assetFileNames,
            get projectWithFiles() {
                return project.withFiles(assetFileNames)
            }
        }
    }

    async getProjectNames() {
        return this.getFileNames(null)
    }

    async getFileNames(projectName: string | null) {
        const dirname = projectName ?? ''
        const names = await this.fs.readdir(`/${dirname}`)
        names.sort()
        return names
    }

    createProject(name: string) {
        return this.fs.mkdir(`/${name}`).then( ()=> this.fs.mkdir(`/${name}/${ASSET_DIR}`))
    }

    readTextFile(projectName: string, path: string) {
        return this.fs.readFile(`/${projectName}/${path}`, 'utf8') as Promise<string>
    }

    writeTextFile(projectName: string, path: string, text: string) {
        return this.fs.writeFile(`/${projectName}/${path}`, text, 'utf8')
    }

    writeProjectFile(projectName: string, project: Project) {
        return this.writeTextFile(projectName, projectFileName, JSON.stringify(project, null, 2))
    }

    deleteFile(projectName: string, path: string) {
        return this.fs.unlink(`/${projectName}/${path}`)
    }

    rename(projectName: string, oldPath: string, newPath: string) {
        return this.fs.rename(`/${projectName}/${oldPath}`, `/${projectName}/${newPath}`)
    }

    get fileSystem(): any {
        return this.cbfs
    }

    writeFile(projectName: string, path: string, fileData: Uint8Array) {
        return this.fs.writeFile(`/${projectName}/${path}`, fileData)
    }

    readFile(projectName: string, path: string) {
        return this.fs.readFile(`/${projectName}/${path}`) as Promise<Uint8Array>
    }

    writeAssetFile(projectName: string, path: string, fileData: Uint8Array) {
        return this.fs.writeFile(`/${projectName}/${ASSET_DIR}/${path}`, fileData)
    }

    readAssetFile(projectName: string, path: string) {
        return this.fs.readFile(`/${projectName}/${ASSET_DIR}/${path}`) as Promise<Uint8Array>
    }

    deleteAssetFile(projectName: string, path: string) {
        return this.fs.unlink(`/${projectName}/${ASSET_DIR}/${path}`)
    }

    renameAsset(projectName: string, oldPath: string, newPath: string) {
        return this.fs.rename(`/${projectName}/${ASSET_DIR}/${oldPath}`, `/${projectName}/${ASSET_DIR}/${newPath}`)
    }
}