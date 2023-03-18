import {LocalProjectStore} from '../LocalProjectStore'
import GitProjectStore from '../GitProjectStore'
import http from 'isomorphic-git/http/web'
import {DirectoryFS, DiskProjectStore} from '../DiskProjectStore'

export default class EditorManager {
    constructor(private openProjectFunction: (name: string, projectStore: DiskProjectStore) => Promise<void>)
    {}
    getFromGitHub = async (url: string, directory: FileSystemDirectoryHandle) => {
        const projectStore = new DiskProjectStore(directory)
        const gitStore =  new GitProjectStore(projectStore.fileSystem, http)
        await gitStore.clone(url)
        await this.openProjectFunction(directory.name, projectStore)
    }
}