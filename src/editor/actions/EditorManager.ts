import {LocalProjectStore} from '../LocalProjectStore'
import GitProjectStore from '../GitProjectStore'
import http from 'isomorphic-git/http/web'

export default class EditorManager {
    constructor(private localProjectStore: LocalProjectStore,
                private openProjectFunction: (name: string) => Promise<void>)
    {}

    getProjectNames = async () => this.localProjectStore.getProjectNames()

    getFromGitHub = async (url: string, projectName: string) => {
        const fs = this.localProjectStore.fileSystem
        const store =  new GitProjectStore(fs, http)
        await store.clone(url, projectName)
        await this.openProjectFunction(projectName)
    }
}