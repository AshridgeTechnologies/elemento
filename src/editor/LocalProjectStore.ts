import Project from '../model/Project'
import FS from '@isomorphic-git/lightning-fs'
import {loadJSONFromString} from '../model/loadJSON'
import {PromiseFsClient} from 'isomorphic-git'

interface ProjectWorkingCopy {
    get project(): Project
}

export interface LocalProjectStore {
    getProjectNames(): Promise<string[]>

    getProject(name: string): Promise<ProjectWorkingCopy>

    createProject(name: string): Promise<void>

    readTextFile(projectName: string, path: string): Promise<string>
    writeTextFile(projectName: string, path: string, text: string): Promise<void>

    writeProjectFile(projectName: string, project: Project): Promise<void>

    get fileSystem() : FS

}

export const projectFileName = 'ElementoProject.json'
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
        return {
            project
        }
    }

    async getProjectNames() {
        const names = await this.fs.readdir('/')
        names.sort()
        return names
    }

    createProject(name: string) {
        return this.fs.mkdir('/' + name)
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

    get fileSystem(): any {
        return this.cbfs
    }

}