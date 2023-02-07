import {loadJSONFromString} from '../model/loadJSON'
import Project from '../model/Project'
import fs from 'fs'
import Builder from './Builder'
import {projectFileName} from '../editor/LocalProjectStore'


type FileCollection = { [p: string]: { text: string } }

export async function buildProject(projectDir: string, outputDir: string, elementoUrl: string) {
    console.log('buildProject', projectDir, outputDir)
    const clientDir = `${outputDir}/client`
    const serverDir = `${outputDir}/server`
    fs.mkdirSync(clientDir, {recursive: true})
    fs.mkdirSync(serverDir, {recursive: true})

    const projectJson = fs.readFileSync(`${projectDir}/${projectFileName}`, 'utf8')
    const project = loadJSONFromString(projectJson) as Project
    const builder = new Builder(project, elementoUrl)
    const writeFiles = (clientFiles: FileCollection, clientDir: string) => {
        for (let path in clientFiles) {
            fs.writeFileSync(`${clientDir}/${path}`, clientFiles[path].text, {encoding: 'utf8'})
        }
    }

    writeFiles(await builder.clientFiles(), clientDir)
    writeFiles(await builder.serverFiles(), serverDir)

    fs.cpSync(`${projectDir}/files`, `${clientDir}/files`, {recursive: true, preserveTimestamps: true})
}



