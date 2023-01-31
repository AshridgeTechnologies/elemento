import {LocalProjectStore} from '../LocalProjectStore'
import GitProjectStore from '../GitProjectStore'
import http from 'isomorphic-git/http/web'
import Project from '../../model/Project'
import ProjectHandler from '../ProjectHandler'

export default class EditorManager {
    constructor(private localProjectStore: LocalProjectStore,
                private projectHandler: ProjectHandler,
                private setGitHubUrl: (url: string) => void) //TODO avoid need to pass this around
    {}

    getProjectNames = async () => this.localProjectStore.getProjectNames()

    getFromGitHub = async (url: string, projectName: string) => {
        const fs = this.localProjectStore.fileSystem
        const store =  new GitProjectStore(fs, http)
        await store.clone(url, projectName)
        const projectWorkingCopy = await this.localProjectStore.getProject(projectName)
        this.updateProject(projectWorkingCopy.projectWithFiles, projectName)
    }

    private updateProject = (proj: Project, name: string) => {
        this.projectHandler.setProject(proj)
        this.projectHandler.name = name
        const gitProjectStore = new GitProjectStore(this.localProjectStore.fileSystem, http, null, null)
        gitProjectStore.getOriginRemote(name).then( this.setGitHubUrl )
    }
}