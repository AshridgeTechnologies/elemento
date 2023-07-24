import GitProjectStore from '../GitProjectStore'
import http from 'isomorphic-git/http/web'
import {DiskProjectStore} from '../DiskProjectStore'

import {editorEmptyProject} from '../../model/Project'

export default class EditorManager {
    constructor(private openProjectFunction: (name: string, projectStore: DiskProjectStore) => Promise<void>)
    {}
    getFromGitHub = async (url: string, directory: FileSystemDirectoryHandle) => {
        const projectStore = new DiskProjectStore(directory)
        const gitStore =  new GitProjectStore(projectStore.fileSystem, http)
        await gitStore.clone(url)
        await this.openProjectFunction(directory.name, projectStore)
    }

    newProject = async(directory: FileSystemDirectoryHandle) => {
        const projectStore = new DiskProjectStore(directory)
        await projectStore.createProject()
        await projectStore.writeProjectFile(editorEmptyProject())
        await this.openProjectFunction(directory.name, projectStore)
    }
}