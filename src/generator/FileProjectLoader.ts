import Project from '../model/Project'
import {ProjectLoader} from './ProjectBuilder'
import fs from 'fs'
import path from 'path'
import {projectFileName} from '../shared/constants'
import {loadJSONFromString} from '../model/loadJSON'

export default class FileProjectLoader implements ProjectLoader{
    constructor(private readonly projectDir: string) {}

    getProject() {
        return fs.promises.readFile(path.join(this.projectDir, projectFileName), 'utf8').then( text => loadJSONFromString(text) as Project)
    }
}