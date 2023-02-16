import {DirectoryNode, FileNode, FileSystemTree} from '@webcontainer/api'
import Builder, {FileCollection} from '../generator/Builder'
import Project from '../model/Project'
import {LocalProjectStoreIDB} from './LocalProjectStore'
import FirebasePublish from '../model/FirebasePublish'

const rootDir = 'public'
const file = (contents: string | Uint8Array): FileNode => ({file: {contents}})
const dir = (directory: FileSystemTree): DirectoryNode => ({directory})
const asFileSystemTree = (files: FileCollection): FileSystemTree => {
    const entries = Object.entries(files).map( ([path, fileContents]) => {
        const resultPath = path.replace(/^\//, '')
        if (resultPath.includes('/')) {
            throw new Error('Cannot handle sub-directory paths yet')
        }

        return [resultPath, file(fileContents.contents)]
    })

    return Object.fromEntries(entries)
}

export const previewFiles = async (project: Project, projectName: string, elementoUrl: string): Promise<FileSystemTree> => {
    const clientFiles = await previewClientFiles(project, projectName, elementoUrl)
    const devServer_cjs = await loadFile('/devServer/devServer.cjs')
    return {
        'devServer.cjs': file(devServer_cjs),
        [rootDir]: dir(clientFiles)
    }
}

export const previewClientFiles = async (project: Project, projectName: string, elementoUrl: string): Promise<FileSystemTree> => {
    const builder = new Builder(project, elementoUrl)
    const firebasePublishForPreview = project.findChildElements(FirebasePublish)[0]
    const projectFiles = asFileSystemTree(await builder.clientFiles(firebasePublishForPreview))
    const assetFiles = await previewAssetFiles(projectName)
    projectFiles['files'] = dir(asFileSystemTree(assetFiles))
    return projectFiles
}

const previewAssetFiles = async (projectName: string): Promise<FileCollection> => {
    const localProjectStore = new LocalProjectStoreIDB()
    let paths
    try {
        paths = (await localProjectStore.assetFilePaths(projectName))
    } catch (e: any) {
        console.warn('Could not get asset file paths', e.message)
        return {}
    }
    const getAssetFileEntry = (path: string) =>
        localProjectStore.readAssetFile(projectName, path).then(contents => [path, {contents: new Uint8Array(contents)}])
    const assetFileEntries = await Promise.all(paths.map(getAssetFileEntry))
    return Object.fromEntries(assetFileEntries)
}

export const previewCodeFile = (project: Project): [path: string, contents: string] => {
    const builder = new Builder(project, '')
    return [`${rootDir}/${builder.codeFileName}`, builder.codeFile()]

}

const loadFile = (path: string) => {  // path must start with /
    const fullUrl = path
    return fetch(path)
        .then( resp => {
            console.log('Download', fullUrl, 'status', resp.status)
            if (!resp.ok) throw new Error(`Could not fetch ${fullUrl} status ${resp.status} ${resp.statusText}`)
            return resp
        })
        .then(resp => resp.text())
}