import Project from '../model/Project'
import {ProjectLoader} from './ProjectBuilder'

export default class BrowserProjectLoader implements ProjectLoader {
    constructor(private readonly projectAccessor: () => Project) {}

    getProject(): Promise<Project> {
        return Promise.resolve(this.projectAccessor())
    }
}