import {loadJSONFromString} from '../model/loadJSON'
import Project from '../model/Project'
import fs from 'fs'
import Builder, {FileCollection} from './Builder'
import {projectFileName} from '../shared/constants'


export async function buildProject(projectDir: string, outputDir: string, elementoUrl: string) {
    console.log('buildProject', projectDir, outputDir)
    const clientDir = `${outputDir}/client`
    const serverDir = `${outputDir}/server`
    fs.mkdirSync(clientDir, {recursive: true})
    fs.mkdirSync(serverDir, {recursive: true})

    const projectJson = fs.readFileSync(`${projectDir}/${projectFileName}`, 'utf8')
    const project = loadJSONFromString(projectJson) as Project
    const builder = new Builder(project, elementoUrl)
    const writeFiles = (files: FileCollection, dir: string) => {
        for (let path in files) {
            fs.writeFileSync(`${dir}/${path}`, files[path].contents, {encoding: 'utf8'})
        }
    }

    writeFiles(await builder.clientFiles(), clientDir)
    writeFiles(await builder.serverFiles(), serverDir)

    if (fs.existsSync(`${projectDir}/files`)) {
        fs.cpSync(`${projectDir}/files`, `${clientDir}/files`, {recursive: true, preserveTimestamps: true})
    }

    const sdkConfigOutput = fs.readFileSync(`${projectDir}/sdkConfig.out`, 'utf8')
    const firebaseConfigJson = sdkConfigOutput.match(/{[^}]+}/m)?.[0]
    if (!firebaseConfigJson) {
        throw new Error('Could not get firebase sdk config.  Command output was:\n' + sdkConfigOutput)
    }
    fs.writeFileSync(`${clientDir}/firebaseConfig.json`, firebaseConfigJson, {encoding: 'utf8'})
}



